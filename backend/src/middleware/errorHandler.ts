import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  // Prisma unique constraint violation
  if (err?.code === 'P2002') {
    return res.status(409).json({ success: false, message: `A record with this ${err.meta?.target || 'value'} already exists.` });
  }
  if (err?.code === 'P2025') {
    return res.status(404).json({ success: false, message: 'Requested record was not found.' });
  }

  if (err?.name === 'MulterError') {
    return res.status(400).json({ success: false, message: err.message });
  }

  // eslint-disable-next-line no-console
  console.error('Unhandled error:', err);
  return res.status(500).json({ success: false, message: 'Something went wrong on the server. Please try again later.' });
}
