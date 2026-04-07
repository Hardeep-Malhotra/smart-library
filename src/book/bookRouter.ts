import express from 'express';
import { createBook } from '../book/bookController.js';

const bookRouter = express.Router();

// Book router

bookRouter.post('/', createBook);

export default bookRouter;
