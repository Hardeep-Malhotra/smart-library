import express from 'express';
import { body } from 'express-validator';
import { createUser, loginUser } from '../user/userController.js';

const userRouter = express.Router();

// Define routes for userRouter

//=======================================
// 1 .Create a new user Register route
//=======================================

userRouter.post(
  '/register',

  [
    body('name').notEmpty().withMessage('Name is required').trim(),

    body('email')
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail(),

    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ],

  createUser
);

//=======================================
// 2. User login route
//=======================================

userRouter.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail()
      .trim(),

    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .trim(),
  ],
  loginUser
);

export default userRouter;
