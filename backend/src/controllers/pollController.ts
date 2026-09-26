import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth';

function withResults(poll: any, userId: string) {
  const totalVotes = poll.options.reduce((sum: number, o: any) => sum + o.votes.length, 0);
  const votedOptionId = poll.options.flatMap((o: any) => o.votes).find((v: any) => v.userId === userId)?.optionId ?? null;
  return {
    id: poll.id,
    question: poll.question,
    isActive: poll.isActive,
    createdAt: poll.createdAt,
    totalVotes,
    hasVoted: !!votedOptionId,
    votedOptionId,
    options: poll.options.map((o: any) => ({
      id: o.id,
      text: o.text,
      voteCount: o.votes.length,
      percentage: totalVotes > 0 ? Math.round((o.votes.length / totalVotes) * 100) : 0,
    })),
  };
}

export async function getPolls(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const polls = await prisma.poll.findMany({
      include: { options: { include: { votes: { select: { userId: true, optionId: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: polls.map((p) => withResults(p, req.user!.userId)) });
  } catch (err) {
    next(err);
  }
}

const createPollSchema = z.object({
  question: z.string().min(3, 'Question must be at least 3 characters'),
  options: z.array(z.string().min(1)).min(2, 'Provide at least 2 options').max(8, 'At most 8 options allowed'),
});

export async function createPoll(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const parsed = createPollSchema.safeParse(req.body);
    if (!parsed.success) return next(new AppError(parsed.error.errors[0].message, 400));

    const poll = await prisma.poll.create({
      data: {
        question: parsed.data.question,
        options: { create: parsed.data.options.map((text) => ({ text })) },
      },
      include: { options: { include: { votes: true } } },
    });

    res.status(201).json({ success: true, data: withResults(poll, req.user!.userId) });
  } catch (err) {
    next(err);
  }
}

const voteSchema = z.object({ optionId: z.string().min(1) });

export async function votePoll(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const parsed = voteSchema.safeParse(req.body);
    if (!parsed.success) return next(new AppError(parsed.error.errors[0].message, 400));

    const poll = await prisma.poll.findUnique({ where: { id: req.params.id }, include: { options: true } });
    if (!poll) return next(new AppError('Poll not found.', 404));
    if (!poll.isActive) return next(new AppError('This poll is closed.', 400));

    const option = poll.options.find((o) => o.id === parsed.data.optionId);
    if (!option) return next(new AppError('Invalid option for this poll.', 400));

    const existingVote = await prisma.pollVote.findUnique({
      where: { pollId_userId: { pollId: poll.id, userId: req.user!.userId } },
    });
    if (existingVote) return next(new AppError('You have already voted on this poll.', 400));

    await prisma.pollVote.create({
      data: { pollId: poll.id, optionId: option.id, userId: req.user!.userId },
    });

    const updated = await prisma.poll.findUnique({
      where: { id: poll.id },
      include: { options: { include: { votes: { select: { userId: true, optionId: true } } } } },
    });
    res.json({ success: true, data: withResults(updated, req.user!.userId) });
  } catch (err) {
    next(err);
  }
}

const toggleSchema = z.object({ isActive: z.boolean() });

export async function togglePoll(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const parsed = toggleSchema.safeParse(req.body);
    if (!parsed.success) return next(new AppError(parsed.error.errors[0].message, 400));

    const existing = await prisma.poll.findUnique({ where: { id: req.params.id } });
    if (!existing) return next(new AppError('Poll not found.', 404));

    const poll = await prisma.poll.update({ where: { id: req.params.id }, data: { isActive: parsed.data.isActive } });
    res.json({ success: true, data: poll });
  } catch (err) {
    next(err);
  }
}

export async function deletePoll(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.poll.findUnique({ where: { id: req.params.id } });
    if (!existing) return next(new AppError('Poll not found.', 404));
    await prisma.poll.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Poll deleted successfully.' });
  } catch (err) {
    next(err);
  }
}
