import express from 'express';

import globalErrorHandler from './middlewares/globalErrorHandler.middleware.js';

const app = express();

// Routes

app.get('/', (req, res, next) => {
  res.send('Welcome to the Book API');
  next();
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
