import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', message: 'Malibu Mailbox API is running' });
});

app.listen(PORT, () => {
    console.log(`🚀 Backend server running on port ${PORT}`);
});