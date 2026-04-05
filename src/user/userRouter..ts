import express from 'express';
import { body } from 'express-validator';
import { createUser } from '../user/usercontroller.js';

const userRouter = express.Router();

// Define routes for userRouter

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

export default userRouter;
