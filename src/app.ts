import express from 'express';

import globalErrorHandler from './middlewares/globalErrorHandler.middleware.js';
import userRouter from './user/userRouter..js';

const app = express();

app.use(express.json(), express.urlencoded({ extended: true }));
// Routes

app.get('/', (req, res, next) => {
  res.send('Welcome to the Book API');
  next();
});

app.use('/api/users', userRouter);

// Global Error Handler
app.use(globalErrorHandler);

export default app;
