import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth';
import { friendlyIssueId } from '../utils/issueId';

function withDisplayId(issue: any) {
  return { ...issue, displayId: friendlyIssueId(issue.id) };
}

const statusSchema = z.object({
  status: z.enum(['REPORTED', 'IN_PROGRESS', 'RESOLVED']),
  comment: z.string().optional(),
});

export async function updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) return next(new AppError(parsed.error.errors[0].message, 400));
    const { status, comment } = parsed.data;

    const existing = await prisma.issue.findUnique({ where: { id: req.params.id } });
    if (!existing) return next(new AppError('Issue not found.', 404));

    const issue = await prisma.$transaction(async (tx) => {
      const updated = await tx.issue.update({
        where: { id: req.params.id },
        data: {
          status,
          resolvedAt: status === 'RESOLVED' ? new Date() : null,
          statusHistory: {
            create: {
              oldStatus: existing.status,
              newStatus: status,
              comment,
              changedById: req.user!.userId,
            },
          },
        },
      });

      await tx.notification.create({
        data: {
          userId: existing.reporterId,
          issueId: existing.id,
          message: `Your issue "${existing.title}" status changed to ${status.replace('_', ' ')}.${comment ? ` Comment: ${comment}` : ''}`,
        },
      });

      return updated;
    });

    res.json({ success: true, data: withDisplayId(issue) });
  } catch (err) {
    next(err);
  }
}

const prioritySchema = z.object({ priority: z.enum(['LOW', 'MEDIUM', 'HIGH']) });

export async function updatePriority(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const parsed = prioritySchema.safeParse(req.body);
    if (!parsed.success) return next(new AppError(parsed.error.errors[0].message, 400));

    const existing = await prisma.issue.findUnique({ where: { id: req.params.id } });
    if (!existing) return next(new AppError('Issue not found.', 404));

    const issue = await prisma.issue.update({
      where: { id: req.params.id },
      data: {
        priority: parsed.data.priority,
        priorityReason: `Priority manually overridden to ${parsed.data.priority} by admin.`,
      },
    });
    res.json({ success: true, data: withDisplayId(issue) });
  } catch (err) {
    next(err);
  }
}

const assignSchema = z.object({ assignedToId: z.string().nullable() });

export async function assignIssue(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const parsed = assignSchema.safeParse(req.body);
    if (!parsed.success) return next(new AppError(parsed.error.errors[0].message, 400));

    const existing = await prisma.issue.findUnique({ where: { id: req.params.id } });
    if (!existing) return next(new AppError('Issue not found.', 404));

    if (parsed.data.assignedToId) {
      const staff = await prisma.user.findUnique({ where: { id: parsed.data.assignedToId } });
      if (!staff || staff.role !== 'ADMIN') {
        return next(new AppError('Issues can only be assigned to admin/staff users.', 400));
      }
    }

    const issue = await prisma.issue.update({
      where: { id: req.params.id },
      data: { assignedToId: parsed.data.assignedToId },
    });
    res.json({ success: true, data: withDisplayId(issue) });
  } catch (err) {
    next(err);
  }
}

const commentSchema = z.object({ comment: z.string().min(1, 'Comment cannot be empty') });

export async function addComment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const parsed = commentSchema.safeParse(req.body);
    if (!parsed.success) return next(new AppError(parsed.error.errors[0].message, 400));

    const existing = await prisma.issue.findUnique({ where: { id: req.params.id } });
    if (!existing) return next(new AppError('Issue not found.', 404));

    await prisma.$transaction(async (tx) => {
      await tx.issueStatusHistory.create({
        data: {
          issueId: existing.id,
          oldStatus: existing.status,
          newStatus: existing.status,
          comment: parsed.data.comment,
          changedById: req.user!.userId,
        },
      });
      await tx.notification.create({
        data: {
          userId: existing.reporterId,
          issueId: existing.id,
          message: `Admin commented on your issue "${existing.title}": ${parsed.data.comment}`,
        },
      });
    });

    res.status(201).json({ success: true, message: 'Comment added successfully.' });
  } catch (err) {
    next(err);
  }
}
