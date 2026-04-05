import { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';
import config from '../config/config.js';

const globalErrorHandler = (
  err: HttpError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    errors: err.errors || null,
    errorStack: config.env === 'development' ? err.stack : '',
    message: err.message || 'Internal Server Error',
  });
  next();
};
export default globalErrorHandler;
