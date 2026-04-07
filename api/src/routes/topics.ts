import { Router, Response } from 'express';
import { Role } from '@prisma/client';
import { body, param } from 'express-validator';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { AppError } from '../middleware/errorHandler';
import { asyncHandler } from '../utils/asyncHandler';
import { prisma } from '../lib/prisma';

const router: Router = Router();

// List topics (public)
router.get('/', asyncHandler(async (req, res: Response) => {
  try {
    const { category, difficulty } = req.query;
    
    const where: any = {};
    if (category) {
      where.category = category as string;
    }
    if (difficulty) {
      where.difficulty = difficulty as string;
    }
    
    const topics = await prisma.topic.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    
    res.json({ topics });
  } catch (error) {
    throw error;
  }
}));

// Get topic by ID (public)
router.get('/:id', asyncHandler(async (req, res: Response) => {
  try {
    const { id } = req.params;
    
    const topic = await prisma.topic.findUnique({
      where: { id },
      include: {
        _count: {
          select: { debates: true },
        },
      },
    });
    
    if (!topic) {
      throw new AppError(404, 'Topic not found');
    }
    
    res.json({ topic });
  } catch (error) {
    throw error;
  }
}));

// Create topic
router.post(
  '/',
  [
    requireAuth,
    requireRole([Role.ADMIN, Role.MODERATOR]),
    body('title').notEmpty().withMessage('Title is required'),
    body('description').optional().isString(),
    body('category').optional().isString(),
    body('difficulty').optional().isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
    validateRequest,
  ],
  asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const { title, description, category, difficulty } = req.body;
      
      const topic = await prisma.topic.create({
        data: {
          title,
          description,
          category,
          difficulty: difficulty || 'INTERMEDIATE',
        },
      });
      
      res.status(201).json({ topic });
    } catch (error) {
      throw error;
    }
  })
);

// Update topic
router.put(
  '/:id',
  [
    requireAuth,
    requireRole([Role.ADMIN, Role.MODERATOR]),
    param('id').isString(),
    body('title').optional().isString(),
    body('description').optional().isString(),
    body('category').optional().isString(),
    body('difficulty').optional().isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
    validateRequest,
  ],
  asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { title, description, category, difficulty } = req.body;
      
      const topic = await prisma.topic.findUnique({ where: { id } });
      if (!topic) {
        throw new AppError(404, 'Topic not found');
      }
      
      const updatedTopic = await prisma.topic.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(description !== undefined && { description }),
          ...(category && { category }),
          ...(difficulty && { difficulty }),
        },
      });
      
      res.json({ topic: updatedTopic });
    } catch (error) {
      throw error;
    }
  })
);

// Delete topic
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
      
      const topic = await prisma.topic.findUnique({ where: { id } });
      if (!topic) {
        throw new AppError(404, 'Topic not found');
      }
      
      // Check if topic is used in debates
      const debatesCount = await prisma.debate.count({
        where: { topicId: id },
      });
      
      if (debatesCount > 0) {
        throw new AppError(400, 'Cannot delete topic that is used in debates');
      }
      
      await prisma.topic.delete({ where: { id } });
      
      res.json({ message: 'Topic deleted successfully' });
    } catch (error) {
      throw error;
    }
  })
);

export default router;
