const DownloadService = require('../../../modules/download/services/download.service');
const path = require('path');

const tmpDir = path.resolve(__dirname, '../../../downloads');

module.exports = async (job) => {
  return DownloadService.processJob(job.data, tmpDir);
};
