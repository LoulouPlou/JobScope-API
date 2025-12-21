import { Request, Response, NextFunction } from 'express';

export function errorHandler(error: any, _req: Request, res: Response, _next: NextFunction): void {
  const status = error.status || 500;
  const code = error.code || 'INTERNAL_SERVER_ERROR';
  const message = error.message || 'An unexpected error occurred';

  console.error(`[ERROR] ${status} - ${code}: ${message}`);
  if (error.stack) {
    console.error(error.stack);
  }

  res.status(status).json({
    message,
    code,
    ...(error.details && { details: error.details }),
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    message: `Route ${req.method} ${req.originalUrl} not found`,
    code: 'NOT_FOUND',
  });
}
