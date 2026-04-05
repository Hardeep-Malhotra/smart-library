import express from 'express';
import { createUser } from './usercontroller.js';

const userRouter = express.Router();

// Define routes for userRouter

userRouter.post('/register', createUser);

export default userRouter;
