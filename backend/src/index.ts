import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import apiRoutes from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'https://the-malibu-mailbox.vercel.app' // Optional: add your known vercel domain here
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

const apiBasePaths = ['/api', '/_/backend/api'];

// API Routes (support Vercel prefix and local paths)
apiBasePaths.forEach((basePath) => {
  app.use(basePath, apiRoutes);
  app.get(`${basePath}/health`, (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', message: 'Malibu Mailbox API is running' });
  });
});

// Error Handler (Must be last)
app.use(errorHandler);

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Backend server running on port ${PORT}`);
  });
}

export default app;