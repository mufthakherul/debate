import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true,
    public details?: Array<{ field: string; message: string }>
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    logger.error(`AppError: ${err.message}`, {
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
      details: err.details,
    });

    return res.status(err.statusCode).json({
      error: err.message,
      statusCode: err.statusCode,
      details: err.details || [],
    });
  }

  const isPrismaInitError =
    err.name === 'PrismaClientInitializationError' ||
    err.message.includes('PrismaClientInitializationError') ||
    err.message.includes('DATABASE_URL') ||
    err.message.includes("Can't reach database server");

  if (isPrismaInitError) {
    logger.error(`Database error: ${err.message}`, {
      path: req.path,
      method: req.method,
    });

    return res.status(503).json({
      error: 'Database is unavailable',
      statusCode: 503,
    });
  }

  // Unexpected errors
  logger.error(`Unexpected error: ${err.message}`, {
    error: err,
    path: req.path,
    method: req.method,
  });

  return res.status(500).json({
    error: 'Internal server error',
    statusCode: 500,
    details: process.env.NODE_ENV === 'development' ? [{ field: 'stack', message: err.stack ?? 'No stack available' }] : [],
  });
};
