import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { param } from 'express-validator';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { AppError } from '../middleware/errorHandler';

const router: Router = Router();
const prisma = new PrismaClient();

// List notifications for current user
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { unreadOnly } = req.query;
    
    const where: any = { userId };
    
    if (unreadOnly === 'true') {
      where.isRead = false;
    }
    
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to 50 most recent
    });
    
    res.json({ notifications });
  } catch (error) {
    throw error;
  }
});

// Mark notification as read
router.patch(
  '/:id/read',
  [
    requireAuth,
    param('id').isString(),
    validateRequest,
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      
      const notification = await prisma.notification.findUnique({
        where: { id },
      });
      
      if (!notification) {
        throw new AppError(404, 'Notification not found');
      }
      
      if (notification.userId !== userId) {
        throw new AppError(403, 'Access denied');
      }
      
      const updatedNotification = await prisma.notification.update({
        where: { id },
        data: { isRead: true },
      });
      
      res.json({ notification: updatedNotification });
    } catch (error) {
      throw error;
    }
  }
);

// Mark all notifications as read
router.post('/mark-all-read', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    throw error;
  }
});

export default router;
