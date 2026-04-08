import { Request, Response, NextFunction } from 'express';

const createBook = (req: Request, res: Response, next: NextFunction) => {
  const { title, author, genre } = req.body;

  // 👇 Proper type casting
  const files = req.files as {
    coverImage?: Express.Multer.File[];
    file?: Express.Multer.File[];
  };

  console.log(files);
  const coverImage = files.coverImage?.[0]?.filename;
  const filePath = files.file?.[0]?.filename;

  res.json({
    title,
    author,
    genre,
    coverImage,
    file: filePath,
  });
  next();
};

export { createBook };
