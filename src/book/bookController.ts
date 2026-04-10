import fs from 'node:fs/promises'; // Promise-based file system module for async file operations
import path from 'node:path'; // Helps in handling file paths safely across OS
import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary.js'; // Cloudinary config for file uploads
import { BookModel } from './bookModel.js'; // Mongoose model

const createBook = async (req: Request, res: Response) => {
  // These will store local file paths for cleanup later
  let coverPath: string | null = null;
  let bookPath: string | null = null;

  try {
    // Extract uploaded files from request (Multer format)
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // ✅ 1. Validate if both files exist
    if (!files?.coverImageUrl?.[0] || !files?.file?.[0]) {
      return res.status(400).json({
        success: false,
        message: 'Both cover image and PDF file are required.',
      });
    }

    // Extract text fields from request body
    const { title, author, genre } = req.body;

    // ✅ 2. Validate required fields
    if (!title || !author || !genre) {
      return res.status(400).json({
        success: false,
        message: 'Title, Author, and Genre are required.',
      });
    }

    // Get individual files
    const coverImageFile = files.coverImageUrl[0];
    const bookFile = files.file[0];

    // ✅ 3. Define upload directory (safe for production)
    const uploadDir = path.resolve(process.cwd(), 'public/data/uploads');

    // Create full file paths
    coverPath = path.join(uploadDir, coverImageFile.filename);
    bookPath = path.join(uploadDir, bookFile.filename);

    // ✅ 4. Upload files to Cloudinary in parallel (faster)
    const [imageUpload, pdfUpload] = await Promise.all([
      cloudinary.uploader.upload(coverPath, {
        folder: 'book-covers', // Folder for images
        resource_type: 'image', // Specify resource type
      }),
      cloudinary.uploader.upload(bookPath, {
        folder: 'book-files', // Folder for PDFs
        resource_type: 'raw', // Required for non-image files (PDF)
      }),
    ]);

    // ✅ 5. Save book data in database
    const newBook = await BookModel.create({
      title,
      author,
      genre,
      coverImageUrl: imageUpload.secure_url, // Cloudinary image URL
      file: pdfUpload.secure_url, // Cloudinary PDF URL
    });

    // ✅ 6. Send success response
    return res.status(201).json({
      success: true,
      message: 'Book created successfully!',
      data: {
        id: newBook._id,
        title,
        author,
        genre,
        coverUrl: imageUpload.secure_url,
        fileUrl: pdfUpload.secure_url,
      },
    });
  } catch (error) {
    // ✅ 7. Global error handling
    console.error('Create Book Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  } finally {
    // ✅ 8. Cleanup: delete local files (runs always)
    try {
      if (coverPath) {
        await fs.unlink(coverPath); // Delete cover image
      }
      if (bookPath) {
        await fs.unlink(bookPath); // Delete PDF file
      }
    } catch (cleanupError) {
      console.error('Cleanup Error:', cleanupError);
    }
  }
};

export { createBook };
