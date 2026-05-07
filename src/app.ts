import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import transactionRoutes from './routes/transaction.routes';
import { getFirebaseAdminConfigStatus } from './utils/firebase';

dotenv.config({ quiet: true });

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

app.get('/api/debug/firebase', (req: Request, res: Response) => {
  res.json(getFirebaseAdminConfigStatus());
});

export default app;
