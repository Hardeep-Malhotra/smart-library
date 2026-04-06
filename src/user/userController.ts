import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from './userModel.js';
import _config from '../config/config.js';
import userModel from './userModel.js';

//===============================================================================================================================================================================
// 1. Create a new user Register controller function with validation and error handling and also with token generation logic and send a response back to the client.
//===============================================================================================================================================================================
const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name } = req.body;

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

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    //step 4 Token generation logic would go here (e.g., using JWT to create a token for the user, etc.)
    const token = jwt.sign(
      { userId: newUser._id },
      _config.jwtSecret as string,
      {
        expiresIn: '7d',
      }
    );

    // step 4 send a response back to the client (e.g., success message, user data, etc.)
    res.status(201).json({
      accessToken: token,
      name: newUser.name,
      email: newUser.email,
    });
  } catch (error) {
    next(error);
  }
};

//==============================================================================================================================================================
// 2. User login controller function with validation and error handling and also with token generation logic and send a response back to the client.
//==============================================================================================================================================================
const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // step 1 destructure email and password from the request body
    const { email, password } = req.body;

    // step 2 validate the request body (e.g., check for required fields, validate email format, etc.)
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return next(
        createHttpError(400, 'Validation failed', { errors: errors.array() })
      );
    }

    // step 3 Database logic to find the user by email and compare the provided password with the stored hashed password would go here (e.g., using bcrypt to compare passwords, etc.)
    const user = await userModel.findOne({ email });

    if (!user) {
      return next(createHttpError(404, 'User not found with this email'));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return next(createHttpError(401, 'Invalid email and password'));
    }

    // step 4 Token generation logic would go here (e.g., using JWT to create a token for the user, etc.)
    const token = jwt.sign({ userId: user._id }, _config.jwtSecret as string, {
      expiresIn: '7d',
    });

    // step 5 cookie setting logic would go here (e.g., using res.cookie to set the token in an HTTP-only cookie, etc.)
    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // step 6 send a response back to the client (e.g., success message, user data, etc.)
    return res.json({
      message: 'Login successful',
      accessToken: token,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
};

export { createUser, loginUser };
