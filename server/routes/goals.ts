import { Router, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db/database.ts';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();
router.use(authenticate);

// 1. Get all goals for the authenticated user
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const rows = db.prepare(`
      SELECT id, title, target_amount AS targetAmount, current_amount AS currentAmount, target_date AS targetDate, category, icon, color, created_at AS createdAt, updated_at AS updatedAt
      FROM savings_goals
      WHERE user_id = ?
      ORDER BY target_date ASC
    `).all(userId) as any[];

    res.json({ success: true, goals: rows });
  } catch (err: any) {
    console.error('Fetch goals error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to retrieve savings goals.' });
  }
});

// 2. Create a new goal
router.post('/', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { title, targetAmount, currentAmount, targetDate, category, icon, color } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ error: 'Validation Error', message: 'Goal title is required.' });
      return;
    }

    const numTarget = parseFloat(targetAmount);
    if (isNaN(numTarget) || numTarget <= 0) {
      res.status(400).json({ error: 'Validation Error', message: 'Target amount must be greater than ₹0.' });
      return;
    }

    const normalizedTarget = Math.round(numTarget * 100) / 100;
    const numCurrent = parseFloat(currentAmount);
    const normalizedCurrent = isNaN(numCurrent) || numCurrent < 0 ? 0 : Math.round(numCurrent * 100) / 100;

    if (!targetDate || !/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
      res.status(400).json({ error: 'Validation Error', message: 'Valid target date (YYYY-MM-DD) is required.' });
      return;
    }

    const id = `g-${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO savings_goals (id, user_id, title, target_amount, current_amount, target_date, category, icon, color, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      userId,
      title.trim(),
      normalizedTarget,
      normalizedCurrent,
      targetDate,
      category ? category.trim() : 'General',
      icon || '🎯',
      color || '#34C759',
      now,
      now
    );

    res.status(201).json({
      success: true,
      goal: {
        id,
        title: title.trim(),
        targetAmount: normalizedTarget,
        currentAmount: normalizedCurrent,
        targetDate,
        category: category ? category.trim() : 'General',
        icon: icon || '🎯',
        color: color || '#34C759',
        createdAt: now,
        updatedAt: now,
      },
    });
  } catch (err: any) {
    console.error('Create goal error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to create savings goal.' });
  }
});

// 3. Update an existing goal
router.put('/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const goalId = req.params.id;

    const existing = db.prepare('SELECT * FROM savings_goals WHERE id = ? AND user_id = ?').get(goalId, userId) as any;
    if (!existing) {
      res.status(404).json({ error: 'Not Found', message: 'Goal not found or access denied.' });
      return;
    }

    const { title, targetAmount, currentAmount, targetDate, category, icon, color } = req.body;

    let updatedTarget = existing.target_amount;
    if (targetAmount !== undefined) {
      const numTarget = parseFloat(targetAmount);
      if (isNaN(numTarget) || numTarget <= 0) {
        res.status(400).json({ error: 'Validation Error', message: 'Target amount must be greater than ₹0.' });
        return;
      }
      updatedTarget = Math.round(numTarget * 100) / 100;
    }

    let updatedCurrent = existing.current_amount;
    if (currentAmount !== undefined) {
      const numCurrent = parseFloat(currentAmount);
      if (isNaN(numCurrent) || numCurrent < 0) {
        res.status(400).json({ error: 'Validation Error', message: 'Current amount cannot be negative.' });
        return;
      }
      updatedCurrent = Math.round(numCurrent * 100) / 100;
    }

    const updatedTitle = title && typeof title === 'string' && title.trim() ? title.trim() : existing.title;
    const updatedTargetDate = targetDate && /^\d{4}-\d{2}-\d{2}$/.test(targetDate) ? targetDate : existing.target_date;
    const updatedCategory = category && typeof category === 'string' ? category.trim() : existing.category;
    const updatedIcon = icon || existing.icon;
    const updatedColor = color || existing.color;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE savings_goals
      SET title = ?, target_amount = ?, current_amount = ?, target_date = ?, category = ?, icon = ?, color = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `).run(
      updatedTitle,
      updatedTarget,
      updatedCurrent,
      updatedTargetDate,
      updatedCategory,
      updatedIcon,
      updatedColor,
      now,
      goalId,
      userId
    );

    res.json({
      success: true,
      goal: {
        id: goalId,
        title: updatedTitle,
        targetAmount: updatedTarget,
        currentAmount: updatedCurrent,
        targetDate: updatedTargetDate,
        category: updatedCategory,
        icon: updatedIcon,
        color: updatedColor,
        createdAt: existing.created_at,
        updatedAt: now,
      },
    });
  } catch (err: any) {
    console.error('Update goal error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to update goal.' });
  }
});

// 4. Delete a goal
router.delete('/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const goalId = req.params.id;

    const existing = db.prepare('SELECT id FROM savings_goals WHERE id = ? AND user_id = ?').get(goalId, userId);
    if (!existing) {
      res.status(404).json({ error: 'Not Found', message: 'Goal not found or access denied.' });
      return;
    }

    db.prepare('DELETE FROM savings_goals WHERE id = ? AND user_id = ?').run(goalId, userId);

    res.json({ success: true, id: goalId, message: 'Savings goal deleted successfully.' });
  } catch (err: any) {
    console.error('Delete goal error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to delete goal.' });
  }
});

// 5. Deposit to Goal (Atomic Goal Update + Transaction Creation)
router.post('/:id/deposit', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const goalId = req.params.id;
    const { amount, paymentMode } = req.body;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      res.status(400).json({ error: 'Validation Error', message: 'Deposit amount must be greater than ₹0.' });
      return;
    }

    const normalizedAmount = Math.round(numAmount * 100) / 100;

    const goal = db.prepare('SELECT * FROM savings_goals WHERE id = ? AND user_id = ?').get(goalId, userId) as any;
    if (!goal) {
      res.status(404).json({ error: 'Not Found', message: 'Savings goal not found or access denied.' });
      return;
    }

    const newCurrent = Math.round((goal.current_amount + normalizedAmount) * 100) / 100;
    const now = new Date().toISOString();
    const today = now.split('T')[0];

    // Update goal
    db.prepare('UPDATE savings_goals SET current_amount = ?, updated_at = ? WHERE id = ?').run(newCurrent, now, goalId);

    // Create linked deposit transaction
    const txId = `tx-${crypto.randomUUID()}`;
    const txDescription = `Deposit to ${goal.title}`;
    const txPaymentMode = paymentMode || 'UPI';

    db.prepare(`
      INSERT INTO transactions (id, user_id, type, amount, category, payment_mode, date, description, goal_id, created_at, updated_at)
      VALUES (?, ?, 'deposit', ?, 'Investments', ?, ?, ?, ?, ?, ?)
    `).run(txId, userId, normalizedAmount, txPaymentMode, today, txDescription, goalId, now, now);

    res.json({
      success: true,
      goal: {
        id: goal.id,
        title: goal.title,
        targetAmount: goal.target_amount,
        currentAmount: newCurrent,
        targetDate: goal.target_date,
        category: goal.category,
        icon: goal.icon,
        color: goal.color,
        createdAt: goal.created_at,
        updatedAt: now,
      },
      transaction: {
        id: txId,
        type: 'deposit',
        amount: normalizedAmount,
        category: 'Investments',
        paymentMode: txPaymentMode,
        date: today,
        description: txDescription,
        goalId,
        createdAt: now,
        updatedAt: now,
      },
      message: `Deposited ₹${normalizedAmount.toLocaleString('en-IN')} to ${goal.title}`,
    });
  } catch (err: any) {
    console.error('Deposit error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to process deposit.' });
  }
});

// 6. Withdraw from Goal (Atomic Goal Update + Transaction Creation)
router.post('/:id/withdraw', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const goalId = req.params.id;
    const { amount, paymentMode } = req.body;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      res.status(400).json({ error: 'Validation Error', message: 'Withdrawal amount must be greater than ₹0.' });
      return;
    }

    const normalizedAmount = Math.round(numAmount * 100) / 100;

    const goal = db.prepare('SELECT * FROM savings_goals WHERE id = ? AND user_id = ?').get(goalId, userId) as any;
    if (!goal) {
      res.status(404).json({ error: 'Not Found', message: 'Savings goal not found or access denied.' });
      return;
    }

    if (normalizedAmount > goal.current_amount) {
      res.status(400).json({
        error: 'Validation Error',
        message: `Cannot withdraw ₹${normalizedAmount.toLocaleString('en-IN')}. Current saved balance is ₹${goal.current_amount.toLocaleString('en-IN')}.`,
      });
      return;
    }

    const newCurrent = Math.max(0, Math.round((goal.current_amount - normalizedAmount) * 100) / 100);
    const now = new Date().toISOString();
    const today = now.split('T')[0];

    // Update goal
    db.prepare('UPDATE savings_goals SET current_amount = ?, updated_at = ? WHERE id = ?').run(newCurrent, now, goalId);

    // Create linked withdrawal transaction
    const txId = `tx-${crypto.randomUUID()}`;
    const txDescription = `Withdrawal from ${goal.title}`;
    const txPaymentMode = paymentMode || 'Net Banking';

    db.prepare(`
      INSERT INTO transactions (id, user_id, type, amount, category, payment_mode, date, description, goal_id, created_at, updated_at)
      VALUES (?, ?, 'withdrawal', ?, 'Investments', ?, ?, ?, ?, ?, ?)
    `).run(txId, userId, normalizedAmount, txPaymentMode, today, txDescription, goalId, now, now);

    res.json({
      success: true,
      goal: {
        id: goal.id,
        title: goal.title,
        targetAmount: goal.target_amount,
        currentAmount: newCurrent,
        targetDate: goal.target_date,
        category: goal.category,
        icon: goal.icon,
        color: goal.color,
        createdAt: goal.created_at,
        updatedAt: now,
      },
      transaction: {
        id: txId,
        type: 'withdrawal',
        amount: normalizedAmount,
        category: 'Investments',
        paymentMode: txPaymentMode,
        date: today,
        description: txDescription,
        goalId,
        createdAt: now,
        updatedAt: now,
      },
      message: `Withdrew ₹${normalizedAmount.toLocaleString('en-IN')} from ${goal.title}`,
    });
  } catch (err: any) {
    console.error('Withdrawal error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to process withdrawal.' });
  }
});

export default router;
