import express from 'express';
import cors from 'cors';
import globalErrorHandler from './middlewares/globalErrorHandler.middleware.js';
import userRouter from './user/userRouter..js';
import bookRouter from './book/bookRouter.js';
import _config from './config/config.js';

const app = express();
app.use(
  cors({
    origin: _config.frontendDomain,
  })
);
app.use(express.json(), express.urlencoded({ extended: true }));
// Routes

app.get('/', (req, res, next) => {
  res.send('Welcome to the Book API');
  next();
});

// All user related routes will go here and will be prefixed with /api/users
app.use('/api/users', userRouter);

// All book related routes will go here and will be prefixed with /api/books
app.use('/api/books', bookRouter);

// Global Error Handler
app.use(globalErrorHandler);

export default app;
