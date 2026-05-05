const { Queue } = require('bullmq');
const env = require('../../shared/config/env');

const connection = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
  ...(env.REDIS_PASSWORD && { tls: {} }) // Upstash requires TLS
};

const audioQueue = new Queue('audio-queue', { connection });

module.exports = {
  audioQueue,
  connection,
};
