// Shared utilities and types for FlowForge services
module.exports = {
  Database: require('./utils/database').Database,
  RedisClient: require('./utils/redis').RedisClient,
  logger: require('./utils/logger'),
  authMiddleware: require('./middleware/auth'),
  validationMiddleware: require('./middleware/validation')
};