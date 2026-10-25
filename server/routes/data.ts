import { Router, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db/database.ts';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.ts';
import { seedDemoDataForUser } from '../db/seed.ts';

const router = Router();
router.use(authenticate);

// 1. Explicit Dev-Only Seed Command
router.post('/dev-seed', (req: AuthenticatedRequest, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    res.status(403).json({ error: 'Forbidden', message: 'Seeding demo data is disabled in production.' });
    return;
  }

  try {
    const userId = req.user!.id;
    seedDemoDataForUser(userId, db);
    res.json({ success: true, message: 'Demo data loaded successfully for testing.' });
  } catch (err: any) {
    console.error('Seed error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to seed demo data.' });
  }
});

// 2. Export Current User Data (JSON Snapshot)
router.get('/export', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const userProfile = db.prepare(`
      SELECT name, email, monthly_income AS monthlyIncome, currency, theme, created_at AS createdAt
      FROM users WHERE id = ?
    `).get(userId);

    const transactions = db.prepare(`
      SELECT id, type, amount, category, payment_mode AS paymentMode, date, description, goal_id AS goalId, created_at AS createdAt
      FROM transactions WHERE user_id = ? ORDER BY date DESC
    `).all(userId);

    const budgets = db.prepare(`
      SELECT id, category, limit_amount AS 'limit', period, alert_threshold AS alertThreshold
      FROM budgets WHERE user_id = ?
    `).all(userId);

    const goals = db.prepare(`
      SELECT id, title, target_amount AS targetAmount, current_amount AS currentAmount, target_date AS targetDate, category, icon, color
      FROM savings_goals WHERE user_id = ?
    `).all(userId);

    const payload = {
      version: '2.0-db',
      exportedAt: new Date().toISOString(),
      userProfile,
      transactions,
      budgets,
      goals,
    };

    res.json(payload);
  } catch (err: any) {
    console.error('Export error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to export financial data.' });
  }
});

// 3. Import User Data (Strictly Assigned to Authenticated User)
router.post('/import', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { transactions, budgets, goals } = req.body;
    const now = new Date().toISOString();

    let importedTxs = 0;
    let importedBudgets = 0;
    let importedGoals = 0;

    // Import Goals
    if (Array.isArray(goals)) {
      const stmt = db.prepare(`
        INSERT INTO savings_goals (id, user_id, title, target_amount, current_amount, target_date, category, icon, color, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const g of goals) {
        if (g.title && Number(g.targetAmount) > 0 && g.targetDate) {
          const id = `g-${crypto.randomUUID()}`;
          stmt.run(
            id,
            userId,
            String(g.title).trim(),
            Math.round(Number(g.targetAmount) * 100) / 100,
            Math.max(0, Math.round(Number(g.currentAmount || 0) * 100) / 100),
            g.targetDate,
            g.category || 'General',
            g.icon || '🎯',
            g.color || '#34C759',
            now,
            now
          );
          importedGoals++;
        }
      }
    }

    // Import Budgets
    if (Array.isArray(budgets)) {
      const stmt = db.prepare(`
        INSERT INTO budgets (id, user_id, category, limit_amount, period, alert_threshold, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'monthly', ?, ?, ?)
        ON CONFLICT(user_id, category) DO UPDATE SET limit_amount = excluded.limit_amount, alert_threshold = excluded.alert_threshold, updated_at = excluded.updated_at
      `);

      for (const b of budgets) {
        if (b.category && Number(b.limit) >= 0) {
          stmt.run(
            `b-${crypto.randomUUID()}`,
            userId,
            String(b.category).trim(),
            Math.round(Number(b.limit) * 100) / 100,
            Number(b.alertThreshold) || 80,
            now,
            now
          );
          importedBudgets++;
        }
      }
    }

    // Import Transactions
    if (Array.isArray(transactions)) {
      const stmt = db.prepare(`
        INSERT INTO transactions (id, user_id, type, amount, category, payment_mode, date, description, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const t of transactions) {
        const numAmt = parseFloat(t.amount);
        const validTypes = ['income', 'expense', 'deposit', 'withdrawal'];
        if (numAmt > 0 && validTypes.includes(t.type) && t.category && t.date && t.description) {
          stmt.run(
            `tx-${crypto.randomUUID()}`,
            userId,
            t.type,
            Math.round(numAmt * 100) / 100,
            String(t.category).trim(),
            t.paymentMode || 'UPI',
            t.date,
            String(t.description).trim(),
            now,
            now
          );
          importedTxs++;
        }
      }
    }

    res.json({
      success: true,
      message: `Successfully imported ${importedTxs} transactions, ${importedBudgets} budgets, and ${importedGoals} savings goals.`,
      stats: { importedTxs, importedBudgets, importedGoals },
    });
  } catch (err: any) {
    console.error('Import error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to import financial data.' });
  }
});

export default router;
