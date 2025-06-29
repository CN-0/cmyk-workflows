import { Request, Response, NextFunction } from 'express';
import logger from '@flowforge/shared/src/utils/logger';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Auth service error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  // Default error
  let error = {
    success: false,
    error: 'Internal server error'
  };

  // Validation errors
  if (err.name === 'ValidationError') {
    error.error = 'Validation failed';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.error = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    error.error = 'Token expired';
  }

  // SQLite errors
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    error.error = 'Resource already exists';
  }

  res.status(err.statusCode || 500).json(error);
};