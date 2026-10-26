import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import authRouter from './routes/auth.ts';
import transactionsRouter from './routes/transactions.ts';
import budgetsRouter from './routes/budgets.ts';
import goalsRouter from './routes/goals.ts';
import userRouter from './routes/user.ts';
import dataRouter from './routes/data.ts';
import predictionRouter from './routes/prediction.ts';

dotenv.config();

export const app = express();

const rawCorsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
const configuredOrigins = rawCorsOrigin
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server, or same-origin)
      if (!origin) return callback(null, true);

      // Check configured origins or localhost/127.0.0.1
      if (
        configuredOrigins.includes(origin) ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')
      ) {
        return callback(null, true);
      }

      // Safely allow *.vercel.app deployments and preview branches
      try {
        const parsed = new URL(origin);
        if (parsed.hostname.endsWith('.vercel.app')) {
          return callback(null, true);
        }
      } catch {
        // Invalid URL format
      }

      // Disallow origin gracefully without throwing an unhandled 500 error
      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
  })
);

app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());

// Healthcheck
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Route registration
app.use('/api/auth', authRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/budgets', budgetsRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/user', userRouter);
app.use('/api/data', dataRouter);
app.use('/api/prediction', predictionRouter);

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const isProd = process.env.NODE_ENV === 'production';
  console.error('Unhandled Server Error:', isProd ? err.message : err);
  res.status(err.status || 500).json({
    error: err.name || 'InternalServerError',
    message: isProd ? 'An unexpected error occurred. Please try again.' : err.message,
  });
});

export default app;
