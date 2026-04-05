import { Request, Response, NextFunction } from 'express';

const createUser = (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: 'User registration endpoint' });
  next();
};

export { createUser };
