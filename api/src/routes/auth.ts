import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { body } from 'express-validator';
import { config } from '../config';
import { validateRequest } from '../middleware/validation';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router: Router = Router();
const prisma = new PrismaClient();

// Helper function to generate access token
const generateAccessToken = (userId: string, role: string): string => {
  return jwt.sign(
    { userId, role },
    config.jwt.secret as jwt.Secret,
    { expiresIn: config.jwt.accessTokenTTL } as jwt.SignOptions
  );
};

// Helper function to generate refresh token
const generateRefreshToken = (userId: string, role: string): string => {
  return jwt.sign(
    { userId, role },
    config.jwt.refreshTokenSecret as jwt.Secret,
    { expiresIn: config.jwt.refreshTokenTTL } as jwt.SignOptions
  );
};

// Helper function to hash refresh token
const hashToken = (token: string) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Helper function to calculate expiry date
const getExpiryDate = (ttl: string) => {
  const match = ttl.match(/^(\d+)([hdm])$/);
  if (!match) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // default 7 days
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  const multipliers: { [key: string]: number } = {
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  
  return new Date(Date.now() + value * multipliers[unit]);
};

// Register endpoint
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    validateRequest,
  ],
  async (req: Request, res: Response) => {
    try {
      const { email, username, password } = req.body;
      
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email }, { username }]
        }
      });
      
      if (existingUser) {
        throw new AppError(400, 'User already exists');
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = await prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword
        },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          createdAt: true
        }
      });
      
      const accessToken = generateAccessToken(user.id, user.role);
      const refreshToken = generateRefreshToken(user.id, user.role);
      
      // Store hashed refresh token
      await prisma.refreshToken.create({
        data: {
          token: hashToken(refreshToken),
          userId: user.id,
          expiresAt: getExpiryDate(config.jwt.refreshTokenTTL),
        },
      });
      
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      
      res.status(201).json({ user, token: accessToken });
    } catch (error) {
      throw error;
    }
  }
);

// Login endpoint
router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validateRequest,
  ],
  async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      const user = await prisma.user.findUnique({
        where: { username }
      });
      
      if (!user) {
        throw new AppError(401, 'Invalid credentials');
      }
      
      const validPassword = await bcrypt.compare(password, user.password);
      
      if (!validPassword) {
        throw new AppError(401, 'Invalid credentials');
      }
      
      const accessToken = generateAccessToken(user.id, user.role);
      const refreshToken = generateRefreshToken(user.id, user.role);
      
      // Store hashed refresh token
      await prisma.refreshToken.create({
        data: {
          token: hashToken(refreshToken),
          userId: user.id,
          expiresAt: getExpiryDate(config.jwt.refreshTokenTTL),
        },
      });
      
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      
      res.json({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role
        },
        token: accessToken
      });
    } catch (error) {
      throw error;
    }
  }
);

// Refresh token endpoint
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      throw new AppError(401, 'No refresh token provided');
    }
    
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwt.refreshTokenSecret) as {
      userId: string;
      role: string;
    };
    
    // Check if token exists in database
    const hashedToken = hashToken(refreshToken);
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        token: hashedToken,
        userId: decoded.userId,
        expiresAt: { gt: new Date() },
      },
    });
    
    if (!storedToken) {
      throw new AppError(401, 'Invalid refresh token');
    }
    
    // Generate new access token
    const accessToken = generateAccessToken(decoded.userId, decoded.role);
    
    res.json({ token: accessToken });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError(401, 'Refresh token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError(401, 'Invalid refresh token');
    }
    throw error;
  }
});

// Logout endpoint
router.post('/logout', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (refreshToken) {
      const hashedToken = hashToken(refreshToken);
      await prisma.refreshToken.deleteMany({
        where: {
          token: hashedToken,
          userId: req.user!.userId,
        },
      });
    }
    
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    throw error;
  }
});

// Password reset request endpoint
router.post(
  '/password-reset-request',
  [
    body('email').isEmail().withMessage('Invalid email'),
    validateRequest,
  ],
  async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      const user = await prisma.user.findUnique({
        where: { email },
      });
      
      if (!user) {
        // Don't reveal if user exists
        return res.json({ message: 'If the email exists, a reset link will be sent' });
      }
      
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = hashToken(resetToken);
      
      // Delete any existing reset tokens
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });
      
      // Create new reset token
      await prisma.passwordResetToken.create({
        data: {
          token: hashedToken,
          userId: user.id,
          expiresAt: getExpiryDate(config.passwordReset.tokenTTL),
        },
      });
      
      // TODO: Send email with reset link
      logger.info(`Password reset requested for ${email}. Token: ${resetToken}`);
      logger.info(`Reset link: ${config.cors.origin}/reset-password?token=${resetToken}`);
      
      return res.json({ message: 'If the email exists, a reset link will be sent' });
    } catch (error) {
      throw error;
    }
  }
);

// Password reset confirm endpoint
router.post(
  '/password-reset-confirm',
  [
    body('token').notEmpty().withMessage('Token is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    validateRequest,
  ],
  async (req: Request, res: Response) => {
    try {
      const { token, newPassword } = req.body;
      
      const hashedToken = hashToken(token);
      
      const resetToken = await prisma.passwordResetToken.findFirst({
        where: {
          token: hashedToken,
          expiresAt: { gt: new Date() },
        },
        include: { user: true },
      });
      
      if (!resetToken) {
        throw new AppError(400, 'Invalid or expired reset token');
      }
      
      // Update password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      });
      
      // Delete reset token
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      });
      
      // Invalidate all refresh tokens
      await prisma.refreshToken.deleteMany({
        where: { userId: resetToken.userId },
      });
      
      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      throw error;
    }
  }
);

export default router;
