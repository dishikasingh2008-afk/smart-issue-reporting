import { Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth';

export async function getNotifications(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.userId },
      include: { issue: { select: { id: true, title: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: notifications });
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });
    if (!notification || notification.userId !== req.user!.userId) {
      return next(new AppError('Notification not found.', 404));
    }
    const updated = await prisma.notification.update({ where: { id: req.params.id }, data: { isRead: true } });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}
