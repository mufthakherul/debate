import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    url: process.env.DATABASE_URL || '',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'default-jwt-secret',
    accessTokenTTL: process.env.ACCESS_TOKEN_TTL || '15m',
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'default-refresh-secret',
    refreshTokenTTL: process.env.REFRESH_TOKEN_TTL || '7d',
  },
  
  passwordReset: {
    tokenTTL: process.env.PASSWORD_RESET_TTL || '1h',
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    allowedOrigins: process.env.CORS_ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  },
};
