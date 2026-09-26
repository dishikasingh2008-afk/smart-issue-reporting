import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';

export interface AuthRequest extends Request {
  user?: { userId: string; role: 'STUDENT' | 'ADMIN' };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('You must be logged in to access this resource.', 401));
  }
  const token = header.split(' ')[1];
  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (err) {
    next(new AppError('Your session is invalid or has expired. Please log in again.', 401));
  }
}

export function requireRole(...roles: Array<'STUDENT' | 'ADMIN'>) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
}
