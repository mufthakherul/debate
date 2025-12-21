import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { config } from '../config';
import { AppError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: Role;
  };
}

export const requireAuth = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'No token provided');
    }
    
    const token = authHeader.substring(7);
    
    const decoded = jwt.verify(token, config.jwt.secret) as {
      userId: string;
      role: Role;
    };
    
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError(401, 'Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError(401, 'Invalid token');
    }
    throw error;
  }
};

export const requireRole = (roles: Role[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }
    
    if (!roles.includes(req.user.role)) {
      throw new AppError(403, 'Insufficient permissions');
    }
    
    next();
  };
};
