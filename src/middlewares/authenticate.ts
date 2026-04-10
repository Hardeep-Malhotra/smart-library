import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import pkg from 'jsonwebtoken';
const { verify } = pkg;
import _config from '../config/config.js';

// Extend Request interface to include userId
export interface AuthRequest extends Request {
  userId?: string;
}

const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization');

  if (!token) {
    return next(createHttpError(401, 'Authorization header missing'));
  }

  try {
    const parts = token.split(' ');

    // Ensure "Bearer " prefix exists
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return next(
        createHttpError(401, 'Format is Authorization: Bearer [token]')
      );
    }

    const parsedToken = parts[1];

    const decoded = verify(parsedToken, _config.jwtSecret as string) as {
      userId: string;
    };

    if (!decoded || !decoded.userId) {
      return next(createHttpError(401, 'Invalid token payload'));
    }

    // 1. Attach userId to request for use in controllers
    req.userId = decoded.userId;

    // 2. CRITICAL: Move to the next middleware/controller
    next();
  } catch (error) {
    console.log(error);
    return next(createHttpError(401, 'Token expired or invalid'));
  }
};

export default authenticate;
