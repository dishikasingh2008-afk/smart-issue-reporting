import { Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth';

export async function getUsers(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true, role: true, createdAt: true,
        _count: { select: { reportedIssues: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({
      success: true,
      data: users.map((u) => ({ ...u, reportedIssueCount: u._count.reportedIssues, _count: undefined })),
    });
  } catch (err) {
    next(err);
  }
}

export async function getUserById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    if (!user) return next(new AppError('User not found.', 404));
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}
