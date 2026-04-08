import express from 'express';
import { createBook } from '../book/bookController.js';
import multer from 'multer';
import path from 'node:path';
const bookRouter = express.Router();

const upload = multer({
  dest: path.resolve(__dirname, '../../public/data/uploads'),
  limits: {
    fileSize: 3e7,
  },
});

// Book router

bookRouter.post(
  '/',
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'file', maxCount: 1 },
  ]),
  createBook
);

export default bookRouter;
