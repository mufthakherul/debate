import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from './errorHandler';

export const validateRequest = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => {
      const validationError = err as Record<string, unknown>;
      return {
        field: (validationError.path as string) || (validationError.param as string) || 'body',
        message: err.msg,
      };
    });

    throw new AppError(
      400,
      'Validation failed for the request body',
      true,
      formattedErrors
    );
  }
  
  next();
};
