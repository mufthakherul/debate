import dotenv from 'dotenv';

dotenv.config();

const requiredEnv = [
  'DATABASE_URL',
  'JWT_SECRET',
  'REFRESH_TOKEN_SECRET',
];

if (process.env.NODE_ENV === 'production') {
  requiredEnv.forEach((envName) => {
    if (!process.env[envName]) {
      throw new Error(`Missing required environment variable: ${envName}`);
    }
  });
}

export const config = {
  port: parseInt(process.env.PORT || '8000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  logFormat: process.env.LOG_FORMAT || 'pretty',
  
  database: {
    url:
      process.env.DATABASE_URL ||
      'postgresql://debate_user:debate_pass@localhost:5432/debate_db',
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
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    allowedOrigins: process.env.CORS_ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  },
};
