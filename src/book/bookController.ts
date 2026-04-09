import path from 'node:path';
import { fileURLToPath } from 'node:url'; // Add this for __dirname fix
import { Request, Response, NextFunction } from 'express';
import cloudinary from '../config/cloudinary.js';

// In ES Modules __filename and _dirname are not defined, so we need to create them using fileURLToPath and path.dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // step 1: check if file exists in the request And send file into the coverImageUrl field and check if the file is present in the coverImageUrl field
    if (!files || !files.coverImageUrl || !files.coverImageUrl[0]) {
      return res
        .status(400)
        .json({ message: 'Bhai, coverImageUrl field mein file bhejo!' });
    }

    // step 2: get the file extension from the mimetype and filename
    const coverImageMimeType = files.coverImageUrl[0].mimetype
      .split('/')
      .at(-1);
    const fileName = files.coverImageUrl[0].filename;

    // step 3: resolve the file path using path.resolve and __dirname to get the absolute path of the file
    const filePath = path.resolve(
      __dirname,
      '../../public/data/uploads',
      fileName
    );

    // step 4: upload the file to cloudinary using the uploader.upload method and pass the file path and options for filename override, folder, and format
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      filename_override: fileName,
      folder: 'book-covers',
      format: coverImageMimeType,
    });

    console.log('Cloudinary Result:', uploadResult.secure_url);

    // step 5: send the response with the secure URL of the uploaded image and a success message and status code 201
    return res.status(201).json({
      message: 'Book cover uploaded!',
      url: uploadResult.secure_url,
    });
  } catch (error) {
    console.error('Error:', error);
    // step 6: if there is an error during the upload process, send a response with status code 500 and an error message. If headers are already sent, call next() to pass the error to the global error handler
    if (!res.headersSent) {
      return res.status(500).json({ message: 'Upload failed' });
    }
    next(error);
  }
};

export { createBook };
