import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import User from './userModel.js';

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  // step 1 validate the request body (e.g., check for required fields, validate email format, etc.)
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      createHttpError(400, 'Validation failed', { errors: errors.array() })
    );
  }

  // step 2 Database logic to create a new user would go here (e.g., hashing the password, saving the user to the database, etc.)
  const userExists = await User.findOne({ email });

  if (userExists) {
    const error = createHttpError(409, 'User with this email already exists');
    return next(error);
  }

  // step 3 password hashing and user creation logic would go here (e.g., using bcrypt to hash the password, saving the user to the database, etc.)
  const hashedPassword = await bcrypt.hash(password, 10);

  // step 4 process the registration logic (e.g., save user to database, hash password, etc.)
  // step 5 send a response back to the client (e.g., success message, user data, etc.)
  res.json({ message: 'User registered successfully' });
  next();
};

export { createUser };
