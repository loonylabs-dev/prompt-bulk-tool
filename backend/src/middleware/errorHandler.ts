import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@prompt-bulk-tool/shared';

export interface CustomError extends Error {
  status?: number;
  code?: string;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString()
  });

  // Default error
  let status = 500;
  let message = 'Internal Server Error';
  let code = 'INTERNAL_ERROR';

  // Handle specific error types
  if (err.status) {
    status = err.status;
  }

  if (err.message) {
    message = err.message;
  }

  if (err.code) {
    code = err.code;
  }

  // Handle SQLite errors
  if (err.message?.includes('UNIQUE constraint failed')) {
    status = 409;
    message = 'Resource already exists';
    code = 'DUPLICATE_RESOURCE';
  }

  if (err.message?.includes('FOREIGN KEY constraint failed')) {
    status = 400;
    message = 'Invalid reference to related resource';
    code = 'INVALID_REFERENCE';
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    status = 400;
    code = 'VALIDATION_ERROR';
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Invalid token';
    code = 'INVALID_TOKEN';
  }

  if (err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Token expired';
    code = 'TOKEN_EXPIRED';
  }

  const response: ApiResponse = {
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      code: code
    })
  };

  res.status(status).json(response);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const createError = (status: number, message: string, code?: string): CustomError => {
  const error: CustomError = new Error(message);
  error.status = status;
  if (code) error.code = code;
  return error;
};