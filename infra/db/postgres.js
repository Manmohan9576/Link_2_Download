const { Pool } = require('pg');
const env = require('../../shared/config/env');
const logger = require('../../shared/utils/logger');

const pool = new Pool({
  user: env.DB_USER,
  host: env.DB_HOST,
  database: env.DB_NAME,
  password: env.DB_PASSWORD,
  port: 5432,
  ssl: env.DB_HOST !== 'postgres' && env.DB_HOST !== 'localhost' ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  logger.error('Unexpected error on DB connection', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
