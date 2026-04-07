import { Router, Response } from 'express';
import { Role } from '@prisma/client';
import { body, param } from 'express-validator';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { AppError } from '../middleware/errorHandler';
import { prisma } from '../lib/prisma';

const router: Router = Router();

// Submit score (judges only)
router.post(
  '/',
  [
    requireAuth,
    body('debateId').isString().withMessage('Debate ID is required'),
    body('participantId').isString().withMessage('Participant ID is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('score').isFloat({ min: 0 }).withMessage('Score must be non-negative'),
    body('maxScore').isFloat({ min: 0 }).withMessage('Max score must be non-negative'),
    body('weight').optional().isFloat({ min: 0 }),
    body('feedback').optional().isString(),
    body('isPublic').optional().isBoolean(),
    validateRequest,
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const { debateId, participantId, category, score, maxScore, weight, feedback, isPublic } = req.body;
      const judgeId = req.user!.userId;
      
      // Check if debate exists
      const debate = await prisma.debate.findUnique({
        where: { id: debateId },
        include: {
          participants: true,
        },
      });
      
      if (!debate) {
        throw new AppError(404, 'Debate not found');
      }
      
      // Check if user is a judge for this debate
      const judgeParticipant = debate.participants.find(
        p => p.userId === judgeId && p.role === 'JUDGE'
      );
      
      if (!judgeParticipant && req.user!.role !== Role.ADMIN) {
        throw new AppError(403, 'Only assigned judges can submit scores');
      }
      
      // Check if participant exists and is part of this debate
      const participant = await prisma.debateParticipant.findUnique({
        where: { id: participantId },
      });
      
      if (!participant || participant.debateId !== debateId) {
        throw new AppError(404, 'Participant not found in this debate');
      }
      
      // Validate score <= maxScore
      if (score > maxScore) {
        throw new AppError(400, 'Score cannot exceed max score');
      }
      
      const scoreRecord = await prisma.score.create({
        data: {
          debateId,
          judgeId,
          participantId,
          category,
          score,
          maxScore,
          weight: weight || 1.0,
          feedback,
          isPublic: isPublic ?? false,
        },
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
      });
      
      // Create notification for the participant
      await prisma.notification.create({
        data: {
          userId: participant.userId,
          type: 'SCORE_SUBMITTED',
          payload: {
            debateId,
            debateTitle: debate.title,
            category,
            score,
            maxScore,
            isPublic: isPublic ?? false,
          },
        },
      });
      
      res.status(201).json({ score: scoreRecord });
    } catch (error) {
      throw error;
    }
  }
);

// Get aggregated scores for a debate
router.get(
  '/debate/:debateId/aggregated',
  [
    requireAuth,
    param('debateId').isString(),
    validateRequest,
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const { debateId } = req.params;
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      
      // Check if debate exists
      const debate = await prisma.debate.findUnique({
        where: { id: debateId },
        include: {
          participants: true,
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
      
      // Fetch scores
      const scores = await prisma.score.findMany({
        where: {
          debateId,
          ...(userRole === Role.ADMIN || userRole === Role.MODERATOR ? {} : { isPublic: true }),
        },
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
      });
      
      // Aggregate scores by participant
      const aggregated = debate.participants.reduce((acc, participant) => {
        const participantScores = scores.filter(s => s.participantId === participant.id);
        
        if (participantScores.length === 0) {
          return acc;
        }
        
        const totalWeightedScore = participantScores.reduce(
          (sum, s) => sum + (s.score / s.maxScore) * s.weight,
          0
        );
        const totalWeight = participantScores.reduce((sum, s) => sum + s.weight, 0);
        const averageScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
        
        const totalScore = participantScores.reduce((sum, s) => sum + s.score, 0);
        const totalMaxScore = participantScores.reduce((sum, s) => sum + s.maxScore, 0);
        
        acc[participant.id] = {
          participant: {
            id: participant.id,
            user: {
              id: participant.userId,
              username: participantScores[0]?.participant.user.username || '',
            },
            role: participant.role,
            teamSide: participant.teamSide,
          },
          totalScore,
          totalMaxScore,
          averageScore,
          scoresCount: participantScores.length,
          scores: participantScores,
        };
        
        return acc;
      }, {} as any);
      
      res.json({ aggregated });
    } catch (error) {
      throw error;
    }
  }
);

export default router;
