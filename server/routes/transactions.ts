import { Router, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db/database.ts';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.ts';

const router = Router();
router.use(authenticate);

// 1. Get all transactions for the authenticated user
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const rows = db.prepare(`
      SELECT id, type, amount, category, payment_mode AS paymentMode, date, description, goal_id AS goalId, created_at AS createdAt, updated_at AS updatedAt
      FROM transactions
      WHERE user_id = ?
      ORDER BY date DESC, created_at DESC
    `).all(userId) as any[];

    res.json({ success: true, transactions: rows });
  } catch (err: any) {
    console.error('Fetch transactions error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to retrieve transactions.' });
  }
});

// 2. Add a new transaction
router.post('/', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { type, amount, category, paymentMode, date, description, goalId } = req.body;

    const validTypes = ['income', 'expense', 'deposit', 'withdrawal'];
    if (!type || !validTypes.includes(type)) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid transaction type. Must be income, expense, deposit, or withdrawal.',
      });
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Amount must be a valid positive number greater than ₹0.',
      });
      return;
    }

    // Exact precision to 2 decimal places (paise)
    const normalizedAmount = Math.round(numAmount * 100) / 100;

    if (!category || typeof category !== 'string' || !category.trim()) {
      res.status(400).json({ error: 'Validation Error', message: 'Category is required.' });
      return;
    }

    if (!paymentMode || typeof paymentMode !== 'string' || !paymentMode.trim()) {
      res.status(400).json({ error: 'Validation Error', message: 'Payment mode is required.' });
      return;
    }

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      res.status(400).json({ error: 'Validation Error', message: 'Valid date (YYYY-MM-DD) is required.' });
      return;
    }

    if (!description || typeof description !== 'string' || !description.trim()) {
      res.status(400).json({ error: 'Validation Error', message: 'Description is required.' });
      return;
    }

    const id = `tx-${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    // If goalId is provided for deposit or withdrawal, verify goal ownership
    let validGoalId: string | null = null;
    if (goalId) {
      const goal = db.prepare('SELECT id, current_amount FROM savings_goals WHERE id = ? AND user_id = ?').get(goalId, userId) as any;
      if (goal) {
        validGoalId = goal.id;
        if (type === 'deposit') {
          const newCurrent = Math.round((goal.current_amount + normalizedAmount) * 100) / 100;
          db.prepare('UPDATE savings_goals SET current_amount = ?, updated_at = ? WHERE id = ?').run(newCurrent, now, goal.id);
        } else if (type === 'withdrawal') {
          const newCurrent = Math.max(0, Math.round((goal.current_amount - normalizedAmount) * 100) / 100);
          db.prepare('UPDATE savings_goals SET current_amount = ?, updated_at = ? WHERE id = ?').run(newCurrent, now, goal.id);
        }
      }
    }

    db.prepare(`
      INSERT INTO transactions (id, user_id, type, amount, category, payment_mode, date, description, goal_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      userId,
      type,
      normalizedAmount,
      category.trim(),
      paymentMode.trim(),
      date,
      description.trim(),
      validGoalId,
      now,
      now
    );

    const createdTx = {
      id,
      type,
      amount: normalizedAmount,
      category: category.trim(),
      paymentMode: paymentMode.trim(),
      date,
      description: description.trim(),
      goalId: validGoalId,
      createdAt: now,
      updatedAt: now,
    };

    res.status(201).json({ success: true, transaction: createdTx });
  } catch (err: any) {
    console.error('Create transaction error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to record transaction.' });
  }
});

// 3. Update an existing transaction
router.put('/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const txId = req.params.id;

    // Check ownership
    const existing = db.prepare('SELECT * FROM transactions WHERE id = ? AND user_id = ?').get(txId, userId) as any;
    if (!existing) {
      res.status(404).json({ error: 'Not Found', message: 'Transaction not found or access denied.' });
      return;
    }

    const { type, amount, category, paymentMode, date, description } = req.body;

    const validTypes = ['income', 'expense', 'deposit', 'withdrawal'];
    const updatedType = type && validTypes.includes(type) ? type : existing.type;

    let updatedAmount = existing.amount;
    if (amount !== undefined) {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        res.status(400).json({ error: 'Validation Error', message: 'Amount must be greater than ₹0.' });
        return;
      }
      updatedAmount = Math.round(numAmount * 100) / 100;
    }

    const updatedCategory = category && typeof category === 'string' && category.trim() ? category.trim() : existing.category;
    const updatedPaymentMode = paymentMode && typeof paymentMode === 'string' && paymentMode.trim() ? paymentMode.trim() : existing.payment_mode;
    const updatedDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : existing.date;
    const updatedDescription = description && typeof description === 'string' && description.trim() ? description.trim() : existing.description;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE transactions
      SET type = ?, amount = ?, category = ?, payment_mode = ?, date = ?, description = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `).run(
      updatedType,
      updatedAmount,
      updatedCategory,
      updatedPaymentMode,
      updatedDate,
      updatedDescription,
      now,
      txId,
      userId
    );

    const updatedTx = {
      id: txId,
      type: updatedType,
      amount: updatedAmount,
      category: updatedCategory,
      paymentMode: updatedPaymentMode,
      date: updatedDate,
      description: updatedDescription,
      goalId: existing.goal_id,
      createdAt: existing.created_at,
      updatedAt: now,
    };

    res.json({ success: true, transaction: updatedTx });
  } catch (err: any) {
    console.error('Update transaction error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to update transaction.' });
  }
});

// 4. Delete a transaction
router.delete('/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const txId = req.params.id;

    // Check ownership
    const existing = db.prepare('SELECT id FROM transactions WHERE id = ? AND user_id = ?').get(txId, userId);
    if (!existing) {
      res.status(404).json({ error: 'Not Found', message: 'Transaction not found or access denied.' });
      return;
    }

    db.prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?').run(txId, userId);

    res.json({ success: true, id: txId, message: 'Transaction deleted successfully.' });
  } catch (err: any) {
    console.error('Delete transaction error:', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to delete transaction.' });
  }
});

export default router;
