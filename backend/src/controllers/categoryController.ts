import { Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/prisma';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth';

export async function getCategories(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
}

const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  description: z.string().optional(),
});

export async function createCategory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const parsed = categorySchema.safeParse(req.body);
    if (!parsed.success) return next(new AppError(parsed.error.errors[0].message, 400));
    const category = await prisma.category.create({ data: parsed.data });
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
}

export async function updateCategory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const parsed = categorySchema.partial().safeParse(req.body);
    if (!parsed.success) return next(new AppError(parsed.error.errors[0].message, 400));
    const category = await prisma.category.update({ where: { id: req.params.id }, data: parsed.data });
    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
}

export async function deleteCategory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (err) {
    next(err);
  }
}
