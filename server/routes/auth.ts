import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '../db/database.ts';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.ts';
import { authRateLimiter } from '../middleware/rateLimiter.ts';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_key_finintel_ai_2026_super_secure_random_seed_key';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setTokenCookie(res: Response, token: string): void {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

// 1. Register
router.post('/register', authRateLimiter(15), (req: Request, res: Response) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Field presence checks
    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ error: 'Validation Error', message: 'Name is required.' });
      return;
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      res.status(400).json({ error: 'Validation Error', message: 'Email address is required.' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!emailRegex.test(normalizedEmail)) {
      res.status(400).json({ error: 'Validation Error', message: 'Please provide a valid email address.' });
      return;
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Password must be at least 8 characters long.',
      });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Password confirmation does not match.',
      });
      return;
    }

    // Check if user already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
    if (existing) {
      res.status(409).json({
        error: 'Duplicate Email',
        message: 'An account with this email address already exists. Please log in instead.',
      });
      return;
    }

    // Hash password securely with bcrypt
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const userId = `usr-${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    // Insert user into database with ZERO default financial data
    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, currency, monthly_income, theme, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'INR', 0, 'light', ?, ?)
    `).run(userId, name.trim(), normalizedEmail, passwordHash, now, now);

    // Sign JWT session token
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    setTokenCookie(res, token);

    res.status(201).json({
      success: true,
      user: {
        id: userId,
        name: name.trim(),
        email: normalizedEmail,
        monthlyIncome: 0,
        currency: 'INR',
        theme: 'light',
        createdAt: now,
      },
      token,
      message: 'Account registered successfully.',
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server Error', message: 'Failed to complete registration.' });
  }
});

// 2. Login
router.post('/login', authRateLimiter(20), (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Validation Error', message: 'Email and password are required.' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = db.prepare(`
      SELECT id, name, email, password_hash, currency, monthly_income, theme, created_at
      FROM users WHERE email = ?
    `).get(normalizedEmail) as any;

    if (!user) {
      res.status(401).json({ error: 'Invalid Credentials', message: 'Incorrect email or password.' });
      return;
    }

    const passwordMatch = bcrypt.compareSync(password, user.password_hash);
    if (!passwordMatch) {
      res.status(401).json({ error: 'Invalid Credentials', message: 'Incorrect email or password.' });
      return;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    setTokenCookie(res, token);

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        monthlyIncome: user.monthly_income,
        currency: user.currency,
        theme: user.theme,
        createdAt: user.created_at,
      },
      token,
      message: 'Logged in successfully.',
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server Error', message: 'Failed to authenticate user.' });
  }
});

// 3. Logout
router.post('/logout', (req: Request, res: Response) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  });
  res.json({ success: true, message: 'Logged out successfully.' });
});

// 4. Current User Session Check
router.get('/me', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized', message: 'No active session.' });
    return;
  }

  res.json({
    success: true,
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      monthlyIncome: req.user.monthly_income,
      currency: req.user.currency,
      theme: req.user.theme,
      createdAt: req.user.created_at,
    },
  });
});

export default router;
