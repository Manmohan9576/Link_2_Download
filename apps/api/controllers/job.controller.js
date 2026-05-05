const { z } = require('zod');
const db = require('../../../infra/db/postgres');
const { audioQueue } = require('../../../infra/queue/bullmq');
const { JOB_STATUS } = require('../../../shared/utils/constants');

const jobSchema = z.object({
  url: z.string().url(),
  format: z.enum(['mp3', 'mp4']).default('mp3'),
  quality: z.enum(['low', 'medium', 'high']).default('high')
});

class JobController {
  static async createJob(request, reply) {
    try {
      const { url, format, quality } = jobSchema.parse(request.body);

      const res = await db.query(
        'INSERT INTO jobs (video_url, status, format, quality) VALUES ($1, $2, $3, $4) RETURNING id',
        [url, JOB_STATUS.QUEUED, format, quality]
      );
      const dbJobId = res.rows[0].id;

      await audioQueue.add('download-task', { videoUrl: url, dbJobId, format, quality });

      return { success: true, jobId: dbJobId };
    } catch (err) {
      return reply.status(400).send({ error: 'Invalid request' });
    }
  }

  static async getJob(request, reply) {
    const { id } = request.params;
    const res = await db.query('SELECT * FROM jobs WHERE id = $1', [id]);
    if (res.rows.length === 0) return reply.status(404).send({ error: 'Not found' });

    const job = res.rows[0];
    if (job.status === JOB_STATUS.DONE && job.file_key) {
      job.download_url = '/jobs/' + job.id + '/download';
    }

    return job;
  }

  static async uploadJobFile(request, reply) {
    if (process.env.INTERNAL_API_TOKEN && request.headers['x-internal-token'] !== process.env.INTERNAL_API_TOKEN) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const { id } = request.params;
    const rawFileName = request.headers['x-file-name'];
    if (!rawFileName) return reply.status(400).send({ error: 'Missing file name' });

    const fs = require('fs');
    const path = require('path');
    const uploadsDir = path.resolve(__dirname, '../../../downloads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const fileName = path.basename(decodeURIComponent(rawFileName));
    const filePath = path.join(uploadsDir, fileName);
    await fs.promises.writeFile(filePath, request.body);

    await db.query(
      'UPDATE jobs SET status = $1, file_key = $2 WHERE id = $3',
      [JOB_STATUS.DONE, filePath, id]
    );

    return { success: true, file_key: filePath };
  }

  static async downloadJob(request, reply) {
    const { id } = request.params;
    const res = await db.query('SELECT * FROM jobs WHERE id = $1', [id]);
    if (res.rows.length === 0) return reply.status(404).send({ error: 'Not found' });

    const job = res.rows[0];
    if (job.status !== JOB_STATUS.DONE || !job.file_key) {
      return reply.status(400).send({ error: 'Download not ready' });
    }

    const fs = require('fs');
    const path = require('path');
    if (!fs.existsSync(job.file_key)) {
      return reply.status(404).send({ error: 'File not found on server' });
    }

    const filename = path.basename(job.file_key);
    const encodedFilename = encodeURIComponent(filename);
    reply.header('Content-Disposition', "attachment; filename*=UTF-8''" + encodedFilename);
    const stream = fs.createReadStream(job.file_key);
    return reply.send(stream);
  }
}

module.exports = JobController;
