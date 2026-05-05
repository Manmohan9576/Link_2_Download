require('dotenv').config();
const { Worker } = require('bullmq');
const { connection } = require('../../infra/queue/bullmq');
const downloadProcessor = require('./processors/download.processor');
const logger = require('../../shared/utils/logger');

const worker = new Worker('audio-queue', downloadProcessor, { 
  connection,
  lockDuration: 600000,
  concurrency: process.env.WORKER_CONCURRENCY ? parseInt(process.env.WORKER_CONCURRENCY) : 3 // Process 3 downloads at the same time
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

// --- Auto-Cleanup Logic ---
const fs = require('fs');
const path = require('path');

function cleanupOldFiles() {
  const directory = path.resolve(__dirname, '../../downloads');
  if (!fs.existsSync(directory)) return;

  const maxAgeMs = 24 * 60 * 60 * 1000; // 24 hours
  const now = Date.now();

  fs.readdir(directory, (err, files) => {
    if (err) return logger.error(`[Cleanup] Error reading dir: ${err.message}`);
    
    files.forEach(file => {
      // Don't delete hidden files like .gitkeep or cookies.txt
      if (file.startsWith('.') || file === 'cookies.txt') return;

      const filePath = path.join(directory, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;
        
        if (now - stats.mtimeMs > maxAgeMs) {
          fs.unlink(filePath, err => {
            if (!err) logger.info(`[Cleanup] Deleted old file: ${file}`);
          });
        }
      });
    });
  });
}

// Run cleanup immediately on startup, then every 1 hour
cleanupOldFiles();
setInterval(cleanupOldFiles, 60 * 60 * 1000);
