const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error:', err);

  // Default error
  let error = {
    success: false,
    error: 'Internal server error'
  };

  // Validation errors
  if (err.name === 'ValidationError') {
    error.error = err.message;
    return res.status(400).json(error);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.error = 'Invalid token';
    return res.status(401).json(error);
  }

  // Database errors
  if (err.code === 'SQLITE_CONSTRAINT') {
    error.error = 'Database constraint violation';
    return res.status(400).json(error);
  }

  res.status(500).json(error);
};

module.exports = { errorHandler };