import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import express, { json } from 'express';
import cors from 'cors';
import transcriptRoutes from './routes/transcriptRoutes.js';

const app = express();

app.use(cors());
app.use(json());
app.get('/', (req, res) => {
  return res.status(200).json('VidSummary-version-1');
});
app.use('/api/transcript', transcriptRoutes);
app.get('/api/ping', (req, res) => {
  res.send('pong');
});
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ App connected to database');
    const url = `http://localhost:${process.env.PORT}`;
    app.listen(process.env.PORT, () => {
      console.log(`✅ App listening on: \x1b[32m%s\x1b[0m`, url);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to database:', error.message);
    process.exit(1);
  });
