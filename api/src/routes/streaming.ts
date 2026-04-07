import { Router, Response } from 'express';
import { Role, StreamPlatformType } from '@prisma/client';
import { body, param } from 'express-validator';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { AppError } from '../middleware/errorHandler';
import { asyncHandler } from '../utils/asyncHandler';
import { prisma } from '../lib/prisma';

const router: Router = Router();

/**
 * Get streaming status for a debate
 */
router.get(
  '/status/:debateId',
  [
    requireAuth,
    param('debateId').isString(),
    validateRequest,
  ],
  asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const { debateId } = req.params;
      
      const session = await prisma.streamSession.findUnique({
        where: { debateId },
        include: {
          platforms: true,
          debate: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
      });
      
      if (!session) {
        return res.json({
          debateId,
          status: 'IDLE',
          platforms: [],
        });
      }
      
      return res.json({
        debateId,
        sessionId: session.id,
        status: session.status,
        startedAt: session.startedAt,
        platforms: session.platforms.map(p => ({
          platform: p.platform,
          isActive: p.isActive,
          status: p.status,
          lastError: p.lastError,
        })),
      });
    } catch (error) {
      throw error;
    }
  })
);

/**
 * Get streaming engagement statistics
 */
router.get(
  '/stats/:debateId',
  [
    requireAuth,
    param('debateId').isString(),
    validateRequest,
  ],
  asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const { debateId } = req.params;
      
      const session = await prisma.streamSession.findUnique({
        where: { debateId },
        include: {
          stats: {
            orderBy: { recordedAt: 'desc' },
            take: 1,
          },
        },
      });
      
      if (!session || session.stats.length === 0) {
        return res.json({
          viewerCount: 0,
          peakViewers: 0,
          totalComments: 0,
          totalLikes: 0,
        });
      }
      
      const latestStats = session.stats[0];
      return res.json({
        viewerCount: latestStats.viewerCount,
        peakViewers: latestStats.peakViewers,
        totalComments: latestStats.totalComments,
        totalLikes: latestStats.totalLikes,
        recordedAt: latestStats.recordedAt,
      });
    } catch (error) {
      throw error;
    }
  })
);

/**
 * Start streaming to one or multiple platforms
 */
router.post(
  '/start',
  [
    requireAuth,
    requireRole([Role.ADMIN, Role.MODERATOR]),
    body('debateId').isString().withMessage('Debate ID is required'),
    body('platforms').isArray({ min: 1 }).withMessage('At least one platform is required'),
    body('platforms.*.platform').isString(),
    body('platforms.*.streamKey').optional().isString(),
    body('platforms.*.streamUrl').optional().isString(),
    validateRequest,
  ],
  asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const { debateId, platforms } = req.body;
      
      // Check if debate exists and is in progress
      const debate = await prisma.debate.findUnique({
        where: { id: debateId },
      });
      
      if (!debate) {
        throw new AppError(404, 'Debate not found');
      }
      
      if (debate.status !== 'IN_PROGRESS') {
        throw new AppError(400, 'Debate must be in progress to start streaming');
      }
      
      // Validate each platform configuration
      for (const platform of platforms) {
        if (!['YOUTUBE', 'FACEBOOK', 'TWITCH', 'CUSTOM_RTMP'].includes(platform.platform)) {
          throw new AppError(400, `Invalid platform: ${platform.platform}`);
        }
        
        if (platform.platform === 'CUSTOM_RTMP' && !platform.streamUrl) {
          throw new AppError(400, 'Stream URL is required for Custom RTMP');
        }
        
        if (platform.streamKey && platform.streamKey.length < 10) {
          throw new AppError(400, 'Stream key must be at least 10 characters');
        }
      }
      
      // Create or update stream session
      let session = await prisma.streamSession.findUnique({
        where: { debateId },
        include: { platforms: true },
      });
      
      if (!session) {
        session = await prisma.streamSession.create({
          data: {
            debateId,
            status: 'STARTING',
            startedAt: new Date(),
            platforms: {
              create: platforms.map((p: any) => ({
                platform: p.platform as StreamPlatformType,
                streamKey: p.streamKey,
                streamUrl: p.streamUrl,
                isActive: true,
                status: 'STARTING',
              })),
            },
          },
          include: { platforms: true },
        });
      } else {
        // Update existing session
        await prisma.streamSession.update({
          where: { id: session.id },
          data: {
            status: 'STARTING',
            startedAt: new Date(),
          },
        });
        
        // Add or update platforms
        for (const platform of platforms) {
          await prisma.streamPlatform.upsert({
            where: {
              sessionId_platform: {
                sessionId: session.id,
                platform: platform.platform as StreamPlatformType,
              },
            },
            create: {
              sessionId: session.id,
              platform: platform.platform as StreamPlatformType,
              streamKey: platform.streamKey,
              streamUrl: platform.streamUrl,
              isActive: true,
              status: 'STARTING',
            },
            update: {
              streamKey: platform.streamKey,
              streamUrl: platform.streamUrl,
              isActive: true,
              status: 'STARTING',
              lastError: null,
            },
          });
        }
      }
      
      // Simulate stream starting (in a real implementation, this would connect to actual streaming services)
      // For now, immediately mark as LIVE
      await prisma.streamSession.update({
        where: { id: session.id },
        data: { status: 'LIVE' },
      });
      
      await prisma.streamPlatform.updateMany({
        where: {
          sessionId: session.id,
          platform: {
            in: platforms.map((p: any) => p.platform as StreamPlatformType),
          },
        },
        data: {
          status: 'LIVE',
        },
      });
      
      const updatedSession = await prisma.streamSession.findUnique({
        where: { id: session.id },
        include: { platforms: true },
      });
      
      res.json({
        message: 'Stream started successfully',
        session: updatedSession,
      });
    } catch (error) {
      throw error;
    }
  })
);

/**
 * Stop streaming to one or all platforms
 */
router.post(
  '/stop',
  [
    requireAuth,
    requireRole([Role.ADMIN, Role.MODERATOR]),
    body('debateId').isString().withMessage('Debate ID is required'),
    body('platforms').optional().isArray(),
    validateRequest,
  ],
  asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const { debateId, platforms } = req.body;
      
      const session = await prisma.streamSession.findUnique({
        where: { debateId },
        include: { platforms: true },
      });
      
      if (!session) {
        throw new AppError(404, 'No active stream session found');
      }
      
      if (platforms && platforms.length > 0) {
        // Stop specific platforms
        await prisma.streamPlatform.updateMany({
          where: {
            sessionId: session.id,
            platform: {
              in: platforms as StreamPlatformType[],
            },
          },
          data: {
            isActive: false,
            status: 'STOPPED',
          },
        });
        
        // Check if all platforms are stopped
        const activePlatforms = await prisma.streamPlatform.count({
          where: {
            sessionId: session.id,
            isActive: true,
          },
        });
        
        if (activePlatforms === 0) {
          await prisma.streamSession.update({
            where: { id: session.id },
            data: {
              status: 'STOPPED',
              stoppedAt: new Date(),
            },
          });
        }
      } else {
        // Stop all platforms
        await prisma.streamPlatform.updateMany({
          where: { sessionId: session.id },
          data: {
            isActive: false,
            status: 'STOPPED',
          },
        });
        
        await prisma.streamSession.update({
          where: { id: session.id },
          data: {
            status: 'STOPPED',
            stoppedAt: new Date(),
          },
        });
      }
      
      const updatedSession = await prisma.streamSession.findUnique({
        where: { id: session.id },
        include: { platforms: true },
      });
      
      res.json({
        message: 'Stream stopped successfully',
        session: updatedSession,
      });
    } catch (error) {
      throw error;
    }
  })
);

/**
 * Update streaming statistics (typically called by a background job or webhook)
 */
router.post(
  '/stats',
  [
    requireAuth,
    requireRole([Role.ADMIN, Role.MODERATOR]),
    body('debateId').isString().withMessage('Debate ID is required'),
    body('viewerCount').isInt({ min: 0 }),
    body('peakViewers').optional().isInt({ min: 0 }),
    body('totalComments').optional().isInt({ min: 0 }),
    body('totalLikes').optional().isInt({ min: 0 }),
    validateRequest,
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const { debateId, viewerCount, peakViewers, totalComments, totalLikes } = req.body;
      
      const session = await prisma.streamSession.findUnique({
        where: { debateId },
      });
      
      if (!session) {
        throw new AppError(404, 'No active stream session found');
      }
      
      const stats = await prisma.streamStats.create({
        data: {
          sessionId: session.id,
          viewerCount,
          peakViewers: peakViewers || viewerCount,
          totalComments: totalComments || 0,
          totalLikes: totalLikes || 0,
        },
      });
      
      res.json({ stats });
    } catch (error) {
      throw error;
    }
  }
);

export default router;
