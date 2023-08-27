// !!! MUST BE FIRST !!! Load environment variables from config file.
import './loadEnvironmentVariables.js';

import './databaseConnection.js';

import booksRoutes from './routes/books.js';

import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/books', booksRoutes);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
