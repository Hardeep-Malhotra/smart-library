import fs from 'node:fs/promises';
import path from 'node:path';
import mongoose from 'mongoose';
import { Response } from 'express';
import cloudinary from '../config/cloudinary.js';
import { BookModel } from './bookModel.js';
import { AuthRequest } from '../middlewares/authenticate.js';
import { Book } from './bookTypes.js';

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

export { createBook };
