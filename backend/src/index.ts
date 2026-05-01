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

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', message: 'Malibu Mailbox API is running' });
});

// Error Handler (Must be last)
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🚀 Backend server running on port ${PORT}`);
});