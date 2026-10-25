import { Router, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db/database.ts';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();
router.use(authenticate);

// 1. Get all budgets for the authenticated user
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const rows = db.prepare(`
      SELECT id, category, limit_amount AS 'limit', period, alert_threshold AS alertThreshold, start_date AS startDate, end_date AS endDate, created_at AS createdAt, updated_at AS updatedAt
      FROM budgets
      WHERE user_id = ?
      ORDER BY category ASC
    `).all(userId) as any[];

    res.json({ success: true, budgets: rows });
  } catch (err: any) {
    console.error('Fetch budgets error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to retrieve budgets.' });
  }
});

// 2. Create or upsert a budget
router.post('/', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { category, limit, alertThreshold, period, startDate, endDate } = req.body;

    if (!category || typeof category !== 'string' || !category.trim()) {
      res.status(400).json({ error: 'Validation Error', message: 'Category is required.' });
      return;
    }

    const numLimit = parseFloat(limit);
    if (isNaN(numLimit) || numLimit < 0) {
      res.status(400).json({ error: 'Validation Error', message: 'Limit must be a non-negative number.' });
      return;
    }

    const normalizedLimit = Math.round(numLimit * 100) / 100;
    const normalizedThreshold = Number(alertThreshold) || 80;
    const normalizedPeriod = period === 'monthly' ? 'monthly' : 'monthly';
    const now = new Date().toISOString();

    // Check if budget for category already exists for user
    const existing = db.prepare('SELECT id FROM budgets WHERE user_id = ? AND category = ?').get(userId, category.trim()) as any;

    if (existing) {
      db.prepare(`
        UPDATE budgets
        SET limit_amount = ?, alert_threshold = ?, period = ?, start_date = ?, end_date = ?, updated_at = ?
        WHERE id = ? AND user_id = ?
      `).run(normalizedLimit, normalizedThreshold, normalizedPeriod, startDate || null, endDate || null, now, existing.id, userId);

      res.json({
        success: true,
        budget: {
          id: existing.id,
          category: category.trim(),
          limit: normalizedLimit,
          alertThreshold: normalizedThreshold,
          period: normalizedPeriod,
          startDate: startDate || null,
          endDate: endDate || null,
          updatedAt: now,
        },
      });
      return;
    }

    const id = `b-${crypto.randomUUID()}`;
    db.prepare(`
      INSERT INTO budgets (id, user_id, category, limit_amount, period, alert_threshold, start_date, end_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, userId, category.trim(), normalizedLimit, normalizedPeriod, normalizedThreshold, startDate || null, endDate || null, now, now);

    res.status(201).json({
      success: true,
      budget: {
        id,
        category: category.trim(),
        limit: normalizedLimit,
        alertThreshold: normalizedThreshold,
        period: normalizedPeriod,
        startDate: startDate || null,
        endDate: endDate || null,
        createdAt: now,
        updatedAt: now,
      },
    });
  } catch (err: any) {
    console.error('Create budget error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to save budget.' });
  }
});

// 3. Update an existing budget
router.put('/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const budgetId = req.params.id;

    const existing = db.prepare('SELECT * FROM budgets WHERE id = ? AND user_id = ?').get(budgetId, userId) as any;
    if (!existing) {
      res.status(404).json({ error: 'Not Found', message: 'Budget not found or access denied.' });
      return;
    }

    const { limit, alertThreshold, category, startDate, endDate } = req.body;

    let updatedLimit = existing.limit_amount;
    if (limit !== undefined) {
      const numLimit = parseFloat(limit);
      if (isNaN(numLimit) || numLimit < 0) {
        res.status(400).json({ error: 'Validation Error', message: 'Limit must be a non-negative number.' });
        return;
      }
      updatedLimit = Math.round(numLimit * 100) / 100;
    }

    const updatedThreshold = alertThreshold !== undefined ? Number(alertThreshold) : existing.alert_threshold;
    const updatedCategory = category && typeof category === 'string' && category.trim() ? category.trim() : existing.category;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE budgets
      SET category = ?, limit_amount = ?, alert_threshold = ?, start_date = ?, end_date = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `).run(updatedCategory, updatedLimit, updatedThreshold, startDate || existing.start_date, endDate || existing.end_date, now, budgetId, userId);

    res.json({
      success: true,
      budget: {
        id: budgetId,
        category: updatedCategory,
        limit: updatedLimit,
        alertThreshold: updatedThreshold,
        period: existing.period,
        startDate: startDate || existing.start_date,
        endDate: endDate || existing.end_date,
        createdAt: existing.created_at,
        updatedAt: now,
      },
    });
  } catch (err: any) {
    console.error('Update budget error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to update budget.' });
  }
});

// 4. Delete a budget
router.delete('/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const budgetId = req.params.id;

    const existing = db.prepare('SELECT id FROM budgets WHERE id = ? AND user_id = ?').get(budgetId, userId);
    if (!existing) {
      res.status(404).json({ error: 'Not Found', message: 'Budget not found or access denied.' });
      return;
    }

    db.prepare('DELETE FROM budgets WHERE id = ? AND user_id = ?').run(budgetId, userId);

    res.json({ success: true, id: budgetId, message: 'Budget removed successfully.' });
  } catch (err: any) {
    console.error('Delete budget error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to delete budget.' });
  }
});

export default router;
