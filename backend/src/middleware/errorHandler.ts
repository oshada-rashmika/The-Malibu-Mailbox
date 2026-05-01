import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error for internal tracking
  console.error(`[Backend Error] ${new Date().toISOString()}:`, {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  const status = err.status || 500;
  const message = err.message || 'Something went wrong on the server';

  // Clean JSON response for the frontend
  res.status(status).json({
    success: false,
    error: {
      status,
      message,
      // Only include stack trace in development
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
  });
};
