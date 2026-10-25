import { Router, Response } from 'express';
import { db } from '../db/database.ts';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.ts';
import {
  generateSpendingPrediction,
  RawTransactionRecord,
} from '../services/linearRegressionService.ts';

const router = Router();
router.use(authenticate);

/**
 * GET /api/prediction/spending
 * Retrieves the machine learning spending prediction for the authenticated user
 * using Ordinary Least Squares Linear Regression on historical monthly expenses.
 */
router.get('/spending', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const referenceDate = typeof req.query.referenceDate === 'string' ? req.query.referenceDate : undefined;

    // Retrieve all historical expense transactions for the authenticated user only
    const transactions = db.prepare(`
      SELECT date, amount, type
      FROM transactions
      WHERE user_id = ? AND type = 'expense'
      ORDER BY date ASC
    `).all(userId) as RawTransactionRecord[];

    // Retrieve active budgets for the authenticated user to compute overall monthly budget ceiling
    const budgetRow = db.prepare(`
      SELECT COALESCE(SUM(limit_amount), 0) AS totalBudgetLimit
      FROM budgets
      WHERE user_id = ?
    `).get(userId) as { totalBudgetLimit: number };

    const totalBudgetLimit = budgetRow?.totalBudgetLimit || 0;

    // Run Machine Learning Linear Regression pipeline
    const predictionResult = generateSpendingPrediction(
      transactions,
      totalBudgetLimit,
      referenceDate
    );

    res.json({
      success: true,
      prediction: predictionResult,
    });
  } catch (err: any) {
    console.error('Spending prediction error:', err);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to generate spending prediction.',
    });
  }
});

export default router;
