const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const db = require('../../../infra/db/postgres');
const Mp3Strategy = require('../strategies/mp3.strategy');
const Mp4Strategy = require('../strategies/mp4.strategy');
const logger = require('../../../shared/utils/logger');
const { JOB_STATUS, FORMATS } = require('../../../shared/utils/constants');
const { getProvider } = require('../providers');

class DownloadService {
  static async processJob(jobData, tmpDir) {
    const { videoUrl, dbJobId, format, quality } = jobData;

    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    const provider = getProvider(videoUrl);
    const cleanUrl = provider.formatUrl ? await provider.formatUrl(videoUrl) : videoUrl;

    console.log('FINAL URL:', cleanUrl);

    try {
      await db.query('UPDATE jobs SET status = $1 WHERE id = $2', [JOB_STATUS.PROCESSING, dbJobId]);
      logger.info('Processing Job ' + dbJobId + ' (' + format.toUpperCase() + ' - ' + quality + ')');

      const ProxyService = require('../../../shared/services/proxy.service');
      
      await ProxyService.executeWithFallback(async (proxyUrl) => {
        const outputPathTemplate = path.join(tmpDir, 'job-' + dbJobId + '-%(title)s.%(ext)s');
        const ytDlpCommand = format === FORMATS.MP4
          ? Mp4Strategy.getCommand(cleanUrl, outputPathTemplate, quality, proxyUrl)
          : Mp3Strategy.getCommand(cleanUrl, outputPathTemplate, proxyUrl);

        execSync(ytDlpCommand, { stdio: 'inherit' });
      });

      const files = fs.readdirSync(tmpDir);
      const fileToUpload = files.find(f => f.startsWith('job-' + dbJobId + '-'));
      if (!fileToUpload) throw new Error('File not found after download.');

      const outputPath = path.join(tmpDir, fileToUpload);
      const uploadedFileKey = await this.uploadToApi(outputPath, dbJobId);
      const fileKey = uploadedFileKey || outputPath;

      await db.query(
        'UPDATE jobs SET status = $1, file_key = $2 WHERE id = $3',
        [JOB_STATUS.DONE, fileKey, dbJobId]
      );

      logger.success('Job ' + dbJobId + ' Finished Successfully');
    } catch (error) {
      await db.query('UPDATE jobs SET status = $1, error_message = $2 WHERE id = $3',
        [JOB_STATUS.FAILED, error.message, dbJobId]
      );
      logger.error('Job ' + dbJobId + ' Failed:', error.message);
    }
  }

  static async uploadToApi(filePath, dbJobId) {
    if (!process.env.API_BASE_URL) return null;

    const fileName = path.basename(filePath);
    const url = new URL('/internal/jobs/' + dbJobId + '/file', process.env.API_BASE_URL);
    const headers = {
      'content-type': 'application/octet-stream',
      'x-file-name': encodeURIComponent(fileName),
    };

    if (process.env.INTERNAL_API_TOKEN) {
      headers['x-internal-token'] = process.env.INTERNAL_API_TOKEN;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: fs.createReadStream(filePath),
      duplex: 'half',
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error('API upload failed: ' + response.status + ' ' + message);
    }

    const data = await response.json();
    return data.file_key;
  }
}

module.exports = DownloadService;
