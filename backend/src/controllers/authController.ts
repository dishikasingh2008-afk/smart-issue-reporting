import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../config/prisma';
import { signToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../middleware/auth';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['STUDENT', 'ADMIN']).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

function sanitizeUser(user: any) {
  const { password, ...rest } = user;
  return rest;
}

export async function register(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError(parsed.error.errors[0].message, 400));
    }
    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return next(new AppError('An account with this email already exists.', 409));
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: 'STUDENT' },
    });

    const token = signToken({ userId: user.id, role: user.role as any });
    res.status(201).json({ success: true, data: { user: sanitizeUser(user), token } });
  } catch (err) {
    next(err);
  }
}

export async function login(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError(parsed.error.errors[0].message, 400));
    }
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return next(new AppError('Invalid email or password.', 401));
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return next(new AppError('Invalid email or password.', 401));
    }

    const token = signToken({ userId: user.id, role: user.role as any });
    res.json({ success: true, data: { user: sanitizeUser(user), token } });
  } catch (err) {
    next(err);
  }
}

export async function logout(_req: AuthRequest, res: Response) {
  // Stateless JWT: client just discards the token. Endpoint kept for API completeness.
  res.json({ success: true, message: 'Logged out successfully.' });
}

export async function me(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) return next(new AppError('User not found.', 404));
    res.json({ success: true, data: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
}
