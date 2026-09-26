import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth';
import { analyzeIssue } from '../services/categorization';
import { friendlyIssueId } from '../utils/issueId';

const createIssueSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  building: z.string().min(1, 'Building is required'),
  floor: z.string().min(1, 'Floor is required'),
  room: z.string().optional(),
  area: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
});

function withDisplayId(issue: any) {
  const { _count, upvotes, ...rest } = issue;
  return {
    ...rest,
    displayId: friendlyIssueId(issue.id),
    upvoteCount: _count?.upvotes ?? (Array.isArray(upvotes) ? upvotes.length : undefined),
    hasUpvoted: Array.isArray(upvotes) ? upvotes.length > 0 : undefined,
  };
}

const KEYWORD_STOPWORDS = new Set(['the', 'a', 'an', 'is', 'are', 'in', 'on', 'at', 'of', 'and', 'to', 'it', 'this', 'that', 'with', 'for', 'has', 'have', 'been', 'was', 'were']);

function extractKeywords(text: string): string[] {
  return Array.from(new Set(text.toLowerCase().match(/[a-z]{3,}/g) || [])).filter((w) => !KEYWORD_STOPWORDS.has(w));
}

export async function createIssue(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const parsed = createIssueSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError(parsed.error.errors[0].message, 400));
    }
    const { title, description, building, floor, room, area, latitude, longitude } = parsed.data;

    const analysis = analyzeIssue(title, description);
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const issue = await prisma.issue.create({
      data: {
        title,
        description,
        building,
        floor,
        room,
        area,
        latitude,
        longitude,
        imageUrl,
        category: analysis.category,
        priority: analysis.priority,
        priorityReason: analysis.priorityReason,
        reporterId: req.user!.userId,
        statusHistory: {
          create: {
            newStatus: 'REPORTED',
            changedById: req.user!.userId,
            comment: 'Issue reported by student.',
          },
        },
      },
      include: { statusHistory: true },
    });

    res.status(201).json({ success: true, data: withDisplayId({ ...issue, upvotes: [] }) });
  } catch (err) {
    next(err);
  }
}

export async function getIssues(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { status, category, priority, search, mine, page = '1', limit = '10' } = req.query as Record<string, string>;

    const where: any = {};
    if (req.user!.role === 'STUDENT' || mine === 'true') {
      where.reporterId = req.user!.userId;
    }
    if (status) where.status = status;
    if (category) where.category = category;
    if (priority) where.priority = priority;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { building: { contains: search, mode: 'insensitive' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

    const [issues, total] = await Promise.all([
      prisma.issue.findMany({
        where,
        include: {
          reporter: { select: { id: true, name: true, email: true } },
          assignedTo: { select: { id: true, name: true, email: true } },
          rating: true,
          _count: { select: { upvotes: true } },
          upvotes: { where: { userId: req.user!.userId }, select: { id: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.issue.count({ where }),
    ]);

    res.json({
      success: true,
      data: issues.map(withDisplayId),
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
}

export async function getIssueById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const issue = await prisma.issue.findUnique({
      where: { id: req.params.id },
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        rating: true,
        _count: { select: { upvotes: true } },
        upvotes: { where: { userId: req.user!.userId }, select: { id: true } },
        statusHistory: {
          include: { changedBy: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!issue) return next(new AppError('Issue not found.', 404));

    if (req.user!.role === 'STUDENT' && issue.reporterId !== req.user!.userId) {
      return next(new AppError('You do not have permission to view this issue.', 403));
    }

    res.json({ success: true, data: withDisplayId(issue) });
  } catch (err) {
    next(err);
  }
}

const updateIssueSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  building: z.string().optional(),
  floor: z.string().optional(),
  room: z.string().optional(),
  area: z.string().optional(),
});

export async function updateIssue(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.issue.findUnique({ where: { id: req.params.id } });
    if (!existing) return next(new AppError('Issue not found.', 404));
    if (req.user!.role === 'STUDENT' && existing.reporterId !== req.user!.userId) {
      return next(new AppError('You do not have permission to edit this issue.', 403));
    }

    const parsed = updateIssueSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError(parsed.error.errors[0].message, 400));
    }

    const issue = await prisma.issue.update({ where: { id: req.params.id }, data: parsed.data });
    res.json({ success: true, data: withDisplayId(issue) });
  } catch (err) {
    next(err);
  }
}

export async function deleteIssue(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.issue.findUnique({ where: { id: req.params.id } });
    if (!existing) return next(new AppError('Issue not found.', 404));
    if (req.user!.role === 'STUDENT' && existing.reporterId !== req.user!.userId) {
      return next(new AppError('You do not have permission to delete this issue.', 403));
    }
    await prisma.issue.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Issue deleted successfully.' });
  } catch (err) {
    next(err);
  }
}

// "Me too" / upvote toggle - lets a student back an existing open issue instead of filing a duplicate.
export async function toggleUpvote(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const issue = await prisma.issue.findUnique({ where: { id: req.params.id } });
    if (!issue) return next(new AppError('Issue not found.', 404));
    if (issue.reporterId === req.user!.userId) {
      return next(new AppError('You cannot upvote your own issue.', 400));
    }

    const existing = await prisma.issueUpvote.findUnique({
      where: { issueId_userId: { issueId: issue.id, userId: req.user!.userId } },
    });

    if (existing) {
      await prisma.issueUpvote.delete({ where: { id: existing.id } });
    } else {
      await prisma.issueUpvote.create({ data: { issueId: issue.id, userId: req.user!.userId } });
    }

    const upvoteCount = await prisma.issueUpvote.count({ where: { issueId: issue.id } });
    res.json({ success: true, data: { upvoteCount, hasUpvoted: !existing } });
  } catch (err) {
    next(err);
  }
}

const duplicateCheckSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().default(''),
  building: z.string().min(1),
  floor: z.string().min(1),
});

// Looks for open issues in the same building/floor with overlapping keywords, so a student
// can upvote an existing report instead of filing a near-duplicate.
export async function checkDuplicates(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const parsed = duplicateCheckSchema.safeParse(req.body);
    if (!parsed.success) return next(new AppError(parsed.error.errors[0].message, 400));
    const { title, description, building, floor } = parsed.data;

    const keywords = extractKeywords(`${title} ${description}`);
    if (keywords.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const candidates = await prisma.issue.findMany({
      where: {
        building: { equals: building, mode: 'insensitive' },
        floor: { equals: floor, mode: 'insensitive' },
        status: { not: 'RESOLVED' },
      },
      include: { _count: { select: { upvotes: true } } },
      orderBy: { createdAt: 'desc' },
      take: 25,
    });

    const matches = candidates
      .map((issue) => {
        const issueKeywords = extractKeywords(`${issue.title} ${issue.description}`);
        const overlap = keywords.filter((k) => issueKeywords.includes(k));
        return { issue, overlapCount: overlap.length };
      })
      .filter((m) => m.overlapCount >= 2)
      .sort((a, b) => b.overlapCount - a.overlapCount)
      .slice(0, 5)
      .map(({ issue }) => ({
        id: issue.id,
        displayId: friendlyIssueId(issue.id),
        title: issue.title,
        status: issue.status,
        building: issue.building,
        floor: issue.floor,
        upvoteCount: (issue as any)._count.upvotes,
      }));

    res.json({ success: true, data: matches });
  } catch (err) {
    next(err);
  }
}

const ratingSchema = z.object({
  stars: z.coerce.number().int().min(1).max(5),
  comment: z.string().optional(),
});

// Post-resolution rating - lets the reporting student rate how the issue was handled.
export async function submitRating(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const parsed = ratingSchema.safeParse(req.body);
    if (!parsed.success) return next(new AppError(parsed.error.errors[0].message, 400));

    const issue = await prisma.issue.findUnique({ where: { id: req.params.id }, include: { rating: true } });
    if (!issue) return next(new AppError('Issue not found.', 404));
    if (issue.reporterId !== req.user!.userId) {
      return next(new AppError('Only the student who reported this issue can rate it.', 403));
    }
    if (issue.status !== 'RESOLVED') {
      return next(new AppError('You can only rate an issue after it has been resolved.', 400));
    }
    if (issue.rating) {
      return next(new AppError('You have already rated this issue.', 400));
    }

    const rating = await prisma.rating.create({
      data: {
        issueId: issue.id,
        studentId: req.user!.userId,
        stars: parsed.data.stars,
        comment: parsed.data.comment,
      },
    });

    res.status(201).json({ success: true, data: rating });
  } catch (err) {
    next(err);
  }
}
