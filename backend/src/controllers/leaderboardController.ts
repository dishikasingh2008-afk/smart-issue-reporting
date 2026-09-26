import { Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

// Rewards helping the campus (getting issues resolved, upvoting real problems, rating fixes)
// rather than simply filing the most complaints.
const POINTS = { resolvedReport: 3, upvoteGiven: 1, ratingGiven: 2 };

export async function getLeaderboard(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        name: true,
        reportedIssues: { select: { status: true, category: true, priority: true } },
        _count: { select: { upvotesGiven: true, ratingsGiven: true } },
      },
    });

    const entries = students.map((s) => {
      const resolved = s.reportedIssues.filter((i) => i.status === 'RESOLVED');
      const resolvedCleanliness = resolved.filter((i) => i.category === 'Cleanliness').length;
      const resolvedSafety = resolved.filter((i) => i.category === 'Security' || i.priority === 'HIGH').length;
      const upvotesGiven = s._count.upvotesGiven;
      const ratingsGiven = s._count.ratingsGiven;

      const credits =
        resolved.length * POINTS.resolvedReport +
        upvotesGiven * POINTS.upvoteGiven +
        ratingsGiven * POINTS.ratingGiven;

      const badges: string[] = [];
      if (resolved.length >= 3) badges.push('🛠️ Problem Solver');
      if (resolvedCleanliness >= 2) badges.push('🌱 Clean Campus');
      if (resolvedSafety >= 1) badges.push('💡 Safety Watch');

      return {
        userId: s.id,
        name: s.name,
        credits,
        issuesResolved: resolved.length,
        upvotesGiven,
        ratingsGiven,
        badges,
      };
    });

    const ranked = entries
      .filter((e) => e.credits > 0)
      .sort((a, b) => b.credits - a.credits)
      .slice(0, 20);

    // Top 3 overall contributors also get the general "Campus Contributor" badge.
    ranked.slice(0, 3).forEach((e) => e.badges.push('🏆 Campus Contributor'));

    res.json({ success: true, data: ranked });
  } catch (err) {
    next(err);
  }
}
