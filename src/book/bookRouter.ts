import express from 'express';
import { createBook, updateBook, getAllBooks } from './bookController.js';
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

// =========================================================
// 1. Create Book Route
// =========================================================

bookRouter.post(
  '/',
  authenticate,
  upload.fields([
    { name: 'coverImageUrl', maxCount: 1 },
    { name: 'file', maxCount: 1 },
  ]),
  createBook
);

// =========================================================
// 2. Updated Book Route
// =========================================================

bookRouter.patch(
  '/:bookId',
  authenticate,
  upload.fields([
    { name: 'coverImageUrl', maxCount: 1 },
    { name: 'file', maxCount: 1 },
  ]),
  updateBook
);

// =========================================================
// 3. Get All Books
// =========================================================

bookRouter.get('/', getAllBooks);

export default bookRouter;
