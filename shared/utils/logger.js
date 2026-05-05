const logger = {
  info: (...args) => console.log('ℹ️', ...args),
  success: (...args) => console.log('✅', ...args),
  error: (...args) => console.error('❌', ...args),
  warn: (...args) => console.warn('⚠️', ...args),
};

module.exports = logger;
