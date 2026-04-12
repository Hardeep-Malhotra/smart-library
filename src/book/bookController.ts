import fs from 'node:fs/promises';
import path from 'node:path';
import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import cloudinary from '../config/cloudinary.js';
import { BookModel } from './bookModel.js';
import { AuthRequest } from '../middlewares/authenticate.js';
import { Book } from './bookTypes.js';
import createHttpError from 'http-errors';

// ==========================================
// Create Book Controller Function
// ==========================================

const createBook = async (req: AuthRequest, res: Response) => {
  let coverPath: string | null = null;
  let bookPath: string | null = null;

  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const files = req.files as { [key: string]: Express.Multer.File[] };

    if (!files?.coverImageUrl?.[0] || !files?.file?.[0]) {
      return res.status(400).json({
        success: false,
        message: 'Both cover image and PDF file are required.',
      });
    }

    const { title, genre } = req.body;

    if (!title || !genre) {
      return res.status(400).json({
        success: false,
        message: 'Title and Genre are required.',
      });
    }

    const coverImageFile = files.coverImageUrl[0];
    const bookFile = files.file[0];

    const uploadDir = path.resolve(process.cwd(), 'public/data/uploads');

    coverPath = path.join(uploadDir, coverImageFile.filename);
    bookPath = path.join(uploadDir, bookFile.filename);

    const [imageUpload, pdfUpload] = await Promise.all([
      cloudinary.uploader.upload(coverPath, {
        folder: 'book-covers',
        resource_type: 'image',
      }),
      cloudinary.uploader.upload(bookPath, {
        folder: 'book-files',
        resource_type: 'raw',
      }),
    ]);

    const newBook: Book = await BookModel.create({
      title,
      author: new mongoose.Types.ObjectId(req.userId),
      genre,
      coverImageUrl: imageUpload.secure_url,
      file: pdfUpload.secure_url,
    });

    return res.status(201).json({
      success: true,
      message: 'Book created successfully!',
      data: {
        id: newBook._id.toString(),
        title: newBook.title,
        author: newBook.author,
        genre: newBook.genre,
        coverUrl: newBook.coverImageUrl,
        fileUrl: newBook.file,
      },
    });
  } catch (error) {
    console.error('Create Book Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  } finally {
    try {
      if (coverPath) await fs.unlink(coverPath);
      if (bookPath) await fs.unlink(bookPath);
    } catch (err) {
      console.error('Cleanup Error:', err);
    }
  }
};

// ==========================================
// Update Book Controller Function
// ==========================================

const updateBook = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, genre } = req.body;
    const bookId = req.params.bookId;

    const book = await BookModel.findById(bookId);
    if (!book) {
      return next(createHttpError(404, 'Book not found!'));
    }

    if (book.author.toString() !== req.userId) {
      return next(createHttpError(403, 'You cannot update this book'));
    }

    const files = req.files as { [key: string]: Express.Multer.File[] };

    let newImageUrl = book.coverImageUrl;
    let newPdfUrl = book.file;

    const uploadDir = path.resolve(process.cwd(), 'public/data/uploads');

    // 📸 Image
    if (files?.coverImageUrl) {
      const file = files.coverImageUrl[0];
      const imagePath = path.join(uploadDir, file.filename);

      const upload = await cloudinary.uploader.upload(imagePath, {
        folder: 'book-covers',
      });

      newImageUrl = upload.secure_url;

      await fs.unlink(imagePath);
    }

    // 📄 PDF
    if (files?.file) {
      const file = files.file[0];
      const pdfPath = path.join(uploadDir, file.filename);

      const upload = await cloudinary.uploader.upload(pdfPath, {
        folder: 'book-files',
        resource_type: 'raw',
      });

      newPdfUrl = upload.secure_url;

      await fs.unlink(pdfPath);
    }

    // ✏️ Update
    book.title = title || book.title;
    book.genre = genre || book.genre;
    book.coverImageUrl = newImageUrl;
    book.file = newPdfUrl;

    await book.save();

    res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      book,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// GetAllBooks Controller Function
// ==========================================

const getAllBooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const search = req.query.search || '';
    const genre = req.query.genre;

    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    if (genre) {
      filter.genre = genre as string;
    }

    const total = await BookModel.countDocuments(filter);

    const books = await BookModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      books,
    });
  } catch (error) {
    next(error);
  }
};

export { createBook, updateBook, getAllBooks };
