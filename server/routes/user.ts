import { Router, Response } from 'express';
import { db } from '../db/database.ts';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();
router.use(authenticate);

// 1. Get Profile
router.get('/profile', (req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, profile: req.user });
});

// 2. Update Profile
router.put('/profile', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, monthlyIncome, currency, theme } = req.body;

    const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    if (!existing) {
      res.status(404).json({ error: 'Not Found', message: 'User not found.' });
      return;
    }

    const updatedName = name && typeof name === 'string' && name.trim() ? name.trim() : existing.name;
    let updatedIncome = existing.monthly_income;
    if (monthlyIncome !== undefined) {
      const num = parseFloat(monthlyIncome);
      if (!isNaN(num) && num >= 0) {
        updatedIncome = Math.round(num * 100) / 100;
      }
    }

    const updatedCurrency = currency || existing.currency;
    const updatedTheme = theme === 'dark' ? 'dark' : theme === 'light' ? 'light' : existing.theme;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE users
      SET name = ?, monthly_income = ?, currency = ?, theme = ?, updated_at = ?
      WHERE id = ?
    `).run(updatedName, updatedIncome, updatedCurrency, updatedTheme, now, userId);

    res.json({
      success: true,
      profile: {
        id: userId,
        name: updatedName,
        email: existing.email,
        monthlyIncome: updatedIncome,
        currency: updatedCurrency,
        theme: updatedTheme,
        createdAt: existing.created_at,
        updatedAt: now,
      },
      message: 'Profile updated successfully.',
    });
  } catch (err: any) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to update profile.' });
  }
});

export default router;
