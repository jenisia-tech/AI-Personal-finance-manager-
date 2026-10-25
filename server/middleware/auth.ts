import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/database.ts';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  monthly_income: number;
  currency: string;
  theme: 'light' | 'dark';
  created_at: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_key_finintel_ai_2026_super_secure_random_seed_key';

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    let token: string | undefined;

    // 1. Check HttpOnly cookie
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // 2. Fallback to Authorization Header (Bearer <token>)
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      res.status(401).json({ error: 'Unauthorized', message: 'Authentication required. Please log in.' });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    if (!decoded || !decoded.userId) {
      res.status(401).json({ error: 'Unauthorized', message: 'Invalid authentication token.' });
      return;
    }

    // Query user from database to ensure account still exists and fetch latest profile
    const row = db.prepare(`
      SELECT id, name, email, monthly_income, currency, theme, created_at
      FROM users WHERE id = ?
    `).get(decoded.userId) as any;

    if (!row) {
      res.status(401).json({ error: 'Unauthorized', message: 'User account no longer exists.' });
      return;
    }

    req.user = {
      id: row.id,
      name: row.name,
      email: row.email,
      monthly_income: row.monthly_income,
      currency: row.currency,
      theme: row.theme,
      created_at: row.created_at,
    };

    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Unauthorized', message: 'Session expired. Please log in again.' });
      return;
    }
    res.status(401).json({ error: 'Unauthorized', message: 'Invalid authentication session.' });
  }
}
