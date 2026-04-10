import express from 'express';
import { createBook } from './bookController.js';
import multer from 'multer';
import path from 'node:path';
import authenticate from '../middlewares/authenticate.js';
const bookRouter = express.Router();

const upload = multer({
  dest: path.resolve(process.cwd(), 'public/data/uploads'),
  limits: {
    fileSize: 1e7,
  },
});

// Book router

bookRouter.post(
  '/',
  authenticate,
  upload.fields([
    { name: 'coverImageUrl', maxCount: 1 },
    { name: 'file', maxCount: 1 },
  ]),
  createBook
);

export default bookRouter;
