const Redis = require('ioredis');
const env = require('../../shared/config/env');

const redisClient = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
  ...(env.REDIS_PASSWORD && { tls: {} })
});

redisClient.on('error', (err) => {
  console.error('[Redis Cache] Error:', err.message);
});

module.exports = redisClient;
