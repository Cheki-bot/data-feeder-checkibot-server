import { Request, Response, NextFunction } from 'express';

// 404 handler
export function notFoundHandler(req: Request, res: Response, _next: NextFunction): void {
  res.status(404).json({ error: 'Resource not found' });
}

// General error handler
interface CustomError {
  status?: number;
  message?: string;
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  console.error(err);
  let status = 500;
  let message = 'Internal server error';
  if (typeof err === 'object' && err !== null) {
    const customErr = err as CustomError;
    if (typeof customErr.status === 'number') {
      status = customErr.status;
    }
    if (typeof customErr.message === 'string' && customErr.message.trim() !== '') {
      message = customErr.message;
    }
  }
  res.status(status).json({
    error: message,
  });
}
