const JobController = require('../controllers/job.controller');
const InfoController = require('../controllers/info.controller');

module.exports = async function (fastify, opts) {
  fastify.post('/info', InfoController.fetchInfo);
  fastify.post('/jobs', JobController.createJob);
  fastify.get('/jobs/:id', JobController.getJob);
  fastify.post('/internal/jobs/:id/file', JobController.uploadJobFile);
  fastify.get('/jobs/:id/download', JobController.downloadJob);
};
