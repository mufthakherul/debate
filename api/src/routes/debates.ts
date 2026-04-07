import { Router, Response } from 'express';
import { DebateStatus, Role } from '@prisma/client';
import { body, param } from 'express-validator';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { AppError } from '../middleware/errorHandler';
import { asyncHandler } from '../utils/asyncHandler';
import { prisma } from '../lib/prisma';

const router: Router = Router();

// List debates (with filtering)
router.get('/', requireAuth, asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const { status, isPublic } = req.query;
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    
    const where: any = {};
    
    if (status) {
      where.status = status as DebateStatus;
    }
    
    // Non-admins can only see public debates or debates they're assigned to
    if (userRole === Role.USER) {
      where.OR = [
        { isPublic: true },
        { participants: { some: { userId } } },
        { creatorId: userId },
      ];
    } else if (isPublic !== undefined) {
      where.isPublic = isPublic === 'true';
    }
    
    const debates = await prisma.debate.findMany({
      where,
      include: {
        creator: {
          select: { id: true, username: true, email: true, role: true },
        },
        topic: {
          select: { id: true, title: true, category: true, difficulty: true },
        },
        participants: {
          include: {
            user: {
              select: { id: true, username: true, role: true },
            },
          },
        },
        _count: {
          select: { rounds: true, scores: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    res.json({ debates });
  } catch (error) {
    throw error;
  }
}));

// Get debate by ID
router.get('/:id', requireAuth, asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    
    const debate = await prisma.debate.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, username: true, email: true, role: true },
        },
        topic: true,
        participants: {
          include: {
            user: {
              select: { id: true, username: true, email: true, role: true },
            },
          },
        },
        rounds: {
          orderBy: { order: 'asc' },
        },
        scores: {
          where: userRole === Role.ADMIN || userRole === Role.MODERATOR 
            ? {} 
            : { OR: [{ isPublic: true }, { judgeId: userId }] },
          include: {
            judge: {
              select: { id: true, username: true },
            },
            participant: {
              include: {
                user: {
                  select: { id: true, username: true },
                },
              },
            },
          },
        },
      },
    });
    
    if (!debate) {
      throw new AppError(404, 'Debate not found');
    }
    
    // Check permissions
    const isParticipant = debate.participants.some(p => p.userId === userId);
    const isCreator = debate.creatorId === userId;
    const isAdmin = userRole === Role.ADMIN || userRole === Role.MODERATOR;
    
    if (!debate.isPublic && !isParticipant && !isCreator && !isAdmin) {
      throw new AppError(403, 'Access denied');
    }
    
    res.json({ debate });
  } catch (error) {
    throw error;
  }
}));

// Create debate
router.post(
  '/',
  [
    requireAuth,
    requireRole([Role.ADMIN, Role.MODERATOR]),
    body('title').notEmpty().withMessage('Title is required'),
    body('description').optional().isString(),
    body('topicId').optional().isString(),
    body('isPublic').optional().isBoolean(),
    validateRequest,
  ],
  asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const { title, description, topicId, isPublic } = req.body;
      
      // Validate topic if provided
      if (topicId) {
        const topic = await prisma.topic.findUnique({ where: { id: topicId } });
        if (!topic) {
          throw new AppError(400, 'Topic not found');
        }
      }
      
      const debate = await prisma.debate.create({
        data: {
          title,
          description,
          topicId,
          isPublic: isPublic ?? false,
          creatorId: req.user!.userId,
        },
        include: {
          creator: {
            select: { id: true, username: true, role: true },
          },
          topic: true,
        },
      });
      
      res.status(201).json({ debate });
    } catch (error) {
      throw error;
    }
  })
);

// Update debate
router.put(
  '/:id',
  [
    requireAuth,
    requireRole([Role.ADMIN, Role.MODERATOR]),
    param('id').isString(),
    body('title').optional().isString(),
    body('description').optional().isString(),
    body('topicId').optional().isString(),
    body('isPublic').optional().isBoolean(),
    validateRequest,
  ],
  asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { title, description, topicId, isPublic } = req.body;
      
      const debate = await prisma.debate.findUnique({ where: { id } });
      if (!debate) {
        throw new AppError(404, 'Debate not found');
      }
      
      // Validate topic if provided
      if (topicId) {
        const topic = await prisma.topic.findUnique({ where: { id: topicId } });
        if (!topic) {
          throw new AppError(400, 'Topic not found');
        }
      }
      
      const updatedDebate = await prisma.debate.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(description !== undefined && { description }),
          ...(topicId && { topicId }),
          ...(isPublic !== undefined && { isPublic }),
        },
        include: {
          creator: {
            select: { id: true, username: true, role: true },
          },
          topic: true,
        },
      });
      
      res.json({ debate: updatedDebate });
    } catch (error) {
      throw error;
    }
  })
);

// Delete debate
router.delete(
  '/:id',
  [
    requireAuth,
    requireRole([Role.ADMIN, Role.MODERATOR]),
    param('id').isString(),
    validateRequest,
  ],
  asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      
      const debate = await prisma.debate.findUnique({ where: { id } });
      if (!debate) {
        throw new AppError(404, 'Debate not found');
      }
      
      await prisma.debate.delete({ where: { id } });
      
      res.json({ message: 'Debate deleted successfully' });
    } catch (error) {
      throw error;
    }
  })
);

// Assign participant to debate
router.post(
  '/:id/participants',
  [
    requireAuth,
    requireRole([Role.ADMIN, Role.MODERATOR]),
    param('id').isString(),
    body('userId').isString().withMessage('User ID is required'),
    body('role').isIn(['DEBATER', 'JUDGE', 'TIMEKEEPER', 'MODERATOR']).withMessage('Invalid role'),
    body('teamSide').optional().isIn(['AFFIRMATIVE', 'NEGATIVE', 'NEUTRAL']),
    validateRequest,
  ],
  asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { userId, role, teamSide } = req.body;
      
      // Check if debate exists
      const debate = await prisma.debate.findUnique({ where: { id } });
      if (!debate) {
        throw new AppError(404, 'Debate not found');
      }
      
      // Check if user exists
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new AppError(404, 'User not found');
      }
      
      // Check if already assigned
      const existing = await prisma.debateParticipant.findUnique({
        where: { debateId_userId: { debateId: id, userId } },
      });
      
      if (existing) {
        throw new AppError(400, 'User already assigned to this debate');
      }
      
      const participant = await prisma.debateParticipant.create({
        data: {
          debateId: id,
          userId,
          role,
          teamSide: teamSide || 'NEUTRAL',
        },
        include: {
          user: {
            select: { id: true, username: true, email: true, role: true },
          },
        },
      });
      
      // Create notification
      await prisma.notification.create({
        data: {
          userId,
          type: 'ROLE_ASSIGNED',
          payload: {
            debateId: id,
            debateTitle: debate.title,
            role,
            teamSide: teamSide || 'NEUTRAL',
          },
        },
      });
      
      res.status(201).json({ participant });
    } catch (error) {
      throw error;
    }
  })
);

// Add round to debate
router.post(
  '/:id/rounds',
  [
    requireAuth,
    requireRole([Role.ADMIN, Role.MODERATOR]),
    param('id').isString(),
    body('order').isInt({ min: 1 }).withMessage('Order must be a positive integer'),
    body('type').isIn(['OPENING', 'REBUTTAL', 'CROSS_EXAMINATION', 'CLOSING']).withMessage('Invalid round type'),
    body('durationSeconds').isInt({ min: 1 }).withMessage('Duration must be positive'),
    validateRequest,
  ],
  asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { order, type, durationSeconds } = req.body;
      
      const debate = await prisma.debate.findUnique({ where: { id } });
      if (!debate) {
        throw new AppError(404, 'Debate not found');
      }
      
      // Check if order already exists
      const existing = await prisma.debateRound.findUnique({
        where: { debateId_order: { debateId: id, order } },
      });
      
      if (existing) {
        throw new AppError(400, 'Round with this order already exists');
      }
      
      const round = await prisma.debateRound.create({
        data: {
          debateId: id,
          order,
          type,
          durationSeconds,
        },
      });
      
      res.status(201).json({ round });
    } catch (error) {
      throw error;
    }
  })
);

// Update debate status
router.patch(
  '/:id/status',
  [
    requireAuth,
    requireRole([Role.ADMIN, Role.MODERATOR]),
    param('id').isString(),
    body('status').isIn(['DRAFT', 'SCHEDULED', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).withMessage('Invalid status'),
    body('scheduledAt').optional().isISO8601().withMessage('Invalid date format'),
    validateRequest,
  ],
  asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { status, scheduledAt } = req.body;
      
      const debate = await prisma.debate.findUnique({
        where: { id },
        include: { participants: true },
      });
      
      if (!debate) {
        throw new AppError(404, 'Debate not found');
      }
      
      const updateData: any = { status };
      
      if (status === 'SCHEDULED' && scheduledAt) {
        updateData.scheduledAt = new Date(scheduledAt);
      } else if (status === 'IN_PROGRESS') {
        updateData.startedAt = new Date();
      } else if (status === 'COMPLETED') {
        updateData.completedAt = new Date();
      }
      
      const updatedDebate = await prisma.debate.update({
        where: { id },
        data: updateData,
      });
      
      // Notify participants
      if (status === 'SCHEDULED' || status === 'IN_PROGRESS') {
        const notificationType = status === 'SCHEDULED' ? 'DEBATE_INVITATION' : 'DEBATE_STARTING';
        
        await Promise.all(
          debate.participants.map(participant =>
            prisma.notification.create({
              data: {
                userId: participant.userId,
                type: notificationType,
                payload: {
                  debateId: id,
                  debateTitle: debate.title,
                  status,
                  ...(scheduledAt && { scheduledAt }),
                },
              },
            })
          )
        );
      }
      
      res.json({ debate: updatedDebate });
    } catch (error) {
      throw error;
    }
  })
);

export default router;
