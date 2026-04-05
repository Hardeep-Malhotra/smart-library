import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';

const createUser = (req: Request, res: Response, next: NextFunction) => {
  // step 1 validate the request body (e.g., check for required fields, validate email format, etc.)
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      createHttpError(400, 'Validation failed', { errors: errors.array() })
    );
  }

  // step 2 process the registration logic (e.g., save user to database, hash password, etc.)
  // step 3 send a response back to the client (e.g., success message, user data, etc.)
  res.json({ message: 'User registered successfully' });
  next();
};

export { createUser };
