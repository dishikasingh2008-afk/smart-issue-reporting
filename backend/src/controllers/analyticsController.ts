import { Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/auth';

export async function getDashboardAnalytics(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const [total, reported, inProgress, resolved, highPriority, allIssues, ratedIssues] = await Promise.all([
      prisma.issue.count(),
      prisma.issue.count({ where: { status: 'REPORTED' } }),
      prisma.issue.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.issue.count({ where: { status: 'RESOLVED' } }),
      prisma.issue.count({ where: { priority: 'HIGH' } }),
      prisma.issue.findMany({ select: { category: true, priority: true, status: true, building: true, createdAt: true } }),
      prisma.issue.findMany({
        where: { rating: { isNot: null } },
        select: { assignedTo: { select: { id: true, name: true } }, rating: { select: { stars: true } } },
      }),
    ]);

    const byCategory: Record<string, number> = {};
    const byStatus: Record<string, number> = { REPORTED: reported, IN_PROGRESS: inProgress, RESOLVED: resolved };
    const byPriority: Record<string, number> = { LOW: 0, MEDIUM: 0, HIGH: 0 };
    const byBuilding: Record<string, number> = {};
    const byMonth: Record<string, number> = {};

    for (const issue of allIssues) {
      byCategory[issue.category] = (byCategory[issue.category] || 0) + 1;
      byPriority[issue.priority] = (byPriority[issue.priority] || 0) + 1;
      byBuilding[issue.building] = (byBuilding[issue.building] || 0) + 1;
      const monthKey = issue.createdAt.toISOString().slice(0, 7);
      byMonth[monthKey] = (byMonth[monthKey] || 0) + 1;
    }

    // Post-resolution ratings rolled up per assigned staff member - a real performance signal
    // instead of just raw resolution counts.
    const staffRatings: Record<string, { name: string; total: number; count: number }> = {};
    let ratingSum = 0;
    for (const r of ratedIssues) {
      ratingSum += r.rating!.stars;
      if (r.assignedTo) {
        const bucket = staffRatings[r.assignedTo.id] || { name: r.assignedTo.name, total: 0, count: 0 };
        bucket.total += r.rating!.stars;
        bucket.count += 1;
        staffRatings[r.assignedTo.id] = bucket;
      }
    }
    const byStaffRating = Object.values(staffRatings)
      .map((s) => ({ name: s.name, avgRating: Math.round((s.total / s.count) * 10) / 10, ratingCount: s.count }))
      .sort((a, b) => b.avgRating - a.avgRating);

    res.json({
      success: true,
      data: {
        totals: { total, reported, inProgress, resolved, highPriority },
        byCategory: Object.entries(byCategory).map(([name, value]) => ({ name, value })),
        byStatus: Object.entries(byStatus).map(([name, value]) => ({ name, value })),
        byPriority: Object.entries(byPriority).map(([name, value]) => ({ name, value })),
        byBuilding: Object.entries(byBuilding).map(([name, value]) => ({ name, value })),
        byMonth: Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b)).map(([month, value]) => ({ month, value })),
        avgRating: ratedIssues.length > 0 ? Math.round((ratingSum / ratedIssues.length) * 10) / 10 : null,
        ratingCount: ratedIssues.length,
        byStaffRating,
      },
    });
  } catch (err) {
    next(err);
  }
}
