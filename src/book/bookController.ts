import fs from 'node:fs/promises'; // File system import for cleanup
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Request, Response, NextFunction } from 'express';
import cloudinary from '../config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // 1. Validation: Dono files check karo
    if (!files?.coverImageUrl?.[0] || !files?.file?.[0]) {
      return res
        .status(400)
        .json({ message: 'Bhai, image aur PDF dono chahiye!' });
    }

    const coverImageFile = files.coverImageUrl[0];
    const bookFile = files.file[0];

    // 2. Resolve Paths
    const coverPath = path.resolve(
      __dirname,
      '../../public/data/uploads',
      coverImageFile.filename
    );
    const bookPath = path.resolve(
      __dirname,
      '../../public/data/uploads',
      bookFile.filename
    );

    // 3. Upload to Cloudinary (Parallel upload for better speed)
    const [imageUpload, pdfUpload] = await Promise.all([
      cloudinary.uploader.upload(coverPath, {
        filename_override: coverImageFile.filename,
        folder: 'book-covers',
        format: coverImageFile.mimetype.split('/').at(-1),
      }),
      cloudinary.uploader.upload(bookPath, {
        filename_override: bookFile.filename,
        folder: 'book-files',
        resource_type: 'raw',
      }),
    ]);

    // 4. Cleanup: Local storage se files delete karo
    await fs.unlink(coverPath);
    await fs.unlink(bookPath);

    return res.status(201).json({
      message: 'Book successfully created!',
      coverUrl: imageUpload.secure_url,
      fileUrl: pdfUpload.secure_url,
    });
  } catch (error) {
    console.error('Error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ message: 'Upload fail ho gaya!' });
    }
    next(error);
  }
};

export { createBook };
