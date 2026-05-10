require('dotenv').config(); // Load env if ran locally
const path = require('path');
const fastify = require('fastify')({ logger: true, bodyLimit: 1024 * 1024 * 1024 });
const db = require('../../infra/db/postgres');
const jobRoutes = require('./routes/job.routes');
const logger = require('../../shared/utils/logger');

// Plugins Setup
fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, '../../downloads'),
  prefix: '/downloads', 
});

fastify.register(require('@fastify/static'), {
  root: path.join(__dirname),
  prefix: '/', 
});

fastify.register(require('@fastify/cors'), { origin: "*" });

fastify.addContentTypeParser('application/octet-stream', { parseAs: 'buffer' }, (request, body, done) => {
  done(null, body);
});

// Routes
fastify.get('/', async (request, reply) => {
  return reply.sendFile('index.html');
});

fastify.register(jobRoutes);

const start = async () => {
  try {
     await db.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        video_url TEXT NOT NULL,
        format TEXT DEFAULT 'mp3',
        quality TEXT DEFAULT 'high',
        status TEXT NOT NULL,
        file_key TEXT,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    logger.success("🚀 API Server running at http://localhost:3000");
    
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

start();
