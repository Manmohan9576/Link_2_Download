require('dotenv').config();
const { Worker } = require('bullmq');
const { connection } = require('../../infra/queue/bullmq');
const downloadProcessor = require('./processors/download.processor');
const logger = require('../../shared/utils/logger');

const worker = new Worker('audio-queue', downloadProcessor, { 
  connection,
  lockDuration: 600000 
});

worker.on('completed', job => {
  logger.success(`Job ${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
  logger.error(`Job ${job.id} has failed with ${err.message}`);
});

// Graceful Shutdown for Scale-to-Zero
const shutdown = async (signal) => {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  await worker.close();
  logger.info('Worker closed cleanly.');
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

logger.info('👷 Worker is active and waiting for jobs...');
