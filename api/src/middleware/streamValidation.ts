import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

/**
 * Validates stream key format before activating RTMP
 */
export const validateStreamKey = (req: Request, _res: Response, next: NextFunction) => {
  const { streamKey } = req.body;
  
  if (!streamKey) {
    throw new AppError(400, 'Stream key is required');
  }
  
  // Basic validation for stream key format
  // Stream keys should be alphanumeric with possible dashes/underscores
  const streamKeyRegex = /^[a-zA-Z0-9_-]{10,}$/;
  
  if (!streamKeyRegex.test(streamKey)) {
    throw new AppError(400, 'Invalid stream key format. Must be at least 10 alphanumeric characters.');
  }
  
  next();
};

/**
 * Validates streaming platform type
 */
export const validatePlatform = (req: Request, _res: Response, next: NextFunction) => {
  const { platform } = req.body;
  
  if (!platform) {
    throw new AppError(400, 'Platform is required');
  }
  
  const validPlatforms = ['YOUTUBE', 'FACEBOOK', 'TWITCH', 'CUSTOM_RTMP'];
  
  if (!validPlatforms.includes(platform)) {
    throw new AppError(400, `Invalid platform. Must be one of: ${validPlatforms.join(', ')}`);
  }
  
  next();
};

/**
 * Validates RTMP URL format for custom RTMP streams
 */
export const validateRtmpUrl = (req: Request, _res: Response, next: NextFunction) => {
  const { streamUrl, platform } = req.body;
  
  if (platform === 'CUSTOM_RTMP' && streamUrl) {
    // RTMP URLs should start with rtmp:// or rtmps://
    const rtmpUrlRegex = /^rtmps?:\/\/.+/;
    
    if (!rtmpUrlRegex.test(streamUrl)) {
      throw new AppError(400, 'Invalid RTMP URL format. Must start with rtmp:// or rtmps://');
    }
  }
  
  next();
};
