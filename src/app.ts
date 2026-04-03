import express from 'express';

const app = express();

// Routes

app.get('/', (req, res) => {
  res.send('Welcome to the Book API');
});

export default app;
