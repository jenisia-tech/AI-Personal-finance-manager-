import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.ts';
import { db } from '../db/database.ts';
import {
  fitLinearRegression,
  calculateMAE,
  evaluateChronologicalHoldout,
  evaluateBudgetComparison,
  filterHistoricalExpenses,
  aggregateMonthlyExpenses,
  generateSpendingPrediction,
  RawTransactionRecord,
} from '../services/linearRegressionService.ts';

describe('CO5: Machine Learning - AI Spending Prediction via Linear Regression', () => {
  /* =========================================================================
   * 1. Deterministic Algorithm Tests
   * ========================================================================= */

  it('1. Linear regression predicts a simple known linear trend correctly', () => {
    // Model: y = 2000 * x + 10000
    // x = 0 -> y = 10000
    // x = 1 -> y = 12000
    // x = 2 -> y = 14000
    // x = 3 -> y = 16000
    // Expected next month (x = 4): y = 2000 * 4 + 10000 = 18000
    const points = [
      { x: 0, y: 10000 },
      { x: 1, y: 12000 },
      { x: 2, y: 14000 },
      { x: 3, y: 16000 },
    ];

    const model = fitLinearRegression(points);

    expect(model.slope).toBeCloseTo(2000, 2);
    expect(model.intercept).toBeCloseTo(10000, 2);
    expect(model.rSquared).toBeCloseTo(1.0, 3);
    expect(model.isZeroVariance).toBe(false);

    const prediction = model.predict(4);
    expect(prediction).toBe(18000);
  });

  it('2. A dataset with insufficient observations does not produce a misleading prediction', () => {
    // Only 2 months recorded: should return hasEnoughData: false
    const rawTxs: RawTransactionRecord[] = [
      { date: '2026-01-15', amount: 5000, type: 'expense' },
      { date: '2026-02-10', amount: 6000, type: 'expense' },
    ];

    const result = generateSpendingPrediction(rawTxs, 10000, '2026-03-01');

    expect(result.hasEnoughData).toBe(false);
    expect(result.monthsCount).toBe(2);
    expect(result.requiredMonths).toBe(3);
    expect(result.predictedAmount).toBe(0);
    expect(result.model).toBeNull();
    expect(result.evaluation.canEvaluate).toBe(false);
    expect(result.explanation).toContain('requires at least 3 months');
  });

  it('3. Zero-variance historical expenses are handled safely', () => {
    // All observations identical: y = 15000
    const points = [
      { x: 0, y: 15000 },
      { x: 1, y: 15000 },
      { x: 2, y: 15000 },
    ];

    const model = fitLinearRegression(points);

    expect(model.isZeroVariance).toBe(true);
    expect(model.slope).toBe(0);
    expect(model.intercept).toBe(15000);
    expect(model.rSquared).toBe(1);
    expect(model.predict(3)).toBe(15000);
  });

  it('4. Missing calendar months are handled according to the defined data policy', () => {
    // History has recorded expenses in Jan 2026, Mar 2026, May 2026 (Feb and Apr missing)
    // Policy: Aggregate distinct observed calendar months chronologically without inventing fake values
    const rawTxs: RawTransactionRecord[] = [
      { date: '2026-01-05', amount: 10000, type: 'expense' },
      { date: '2026-03-12', amount: 12000, type: 'expense' },
      { date: '2026-05-20', amount: 14000, type: 'expense' },
    ];

    const aggregated = aggregateMonthlyExpenses(rawTxs);

    expect(aggregated.length).toBe(3);
    expect(aggregated[0].month).toBe('2026-01');
    expect(aggregated[0].actualAmount).toBe(10000);
    expect(aggregated[1].month).toBe('2026-03');
    expect(aggregated[1].actualAmount).toBe(12000);
    expect(aggregated[2].month).toBe('2026-05');
    expect(aggregated[2].actualAmount).toBe(14000);

    const result = generateSpendingPrediction(rawTxs, 20000, '2026-06-01');
    expect(result.hasEnoughData).toBe(true);
    expect(result.monthsCount).toBe(3);
    // Sequence 10000, 12000, 14000 -> next is 16000
    expect(result.predictedAmount).toBe(16000);
    expect(result.nextMonth).toBe('2026-06');
  });

  it('5. Income transactions are excluded from expense totals', () => {
    const rawTxs: RawTransactionRecord[] = [
      { date: '2026-01-01', amount: 50000, type: 'income' },
      { date: '2026-01-05', amount: 8000, type: 'expense' },
      { date: '2026-02-01', amount: 50000, type: 'income' },
      { date: '2026-02-05', amount: 9000, type: 'expense' },
      { date: '2026-03-01', amount: 50000, type: 'income' },
      { date: '2026-03-05', amount: 10000, type: 'expense' },
      { date: '2026-03-10', amount: 5000, type: 'deposit' },
    ];

    const filtered = filterHistoricalExpenses(rawTxs, '2026-04-01');
    expect(filtered.length).toBe(3);
    expect(filtered.every((t) => t.type === 'expense')).toBe(true);

    const aggregated = aggregateMonthlyExpenses(filtered);
    expect(aggregated.map((m) => m.actualAmount)).toEqual([8000, 9000, 10000]);
  });

  it('6. Future-dated transactions are excluded from historical training data', () => {
    const rawTxs: RawTransactionRecord[] = [
      { date: '2026-01-10', amount: 5000, type: 'expense' },
      { date: '2026-02-10', amount: 5000, type: 'expense' },
      { date: '2026-03-10', amount: 5000, type: 'expense' },
      // Future dated beyond reference date 2026-03-15
      { date: '2026-04-01', amount: 99999, type: 'expense' },
      { date: '2026-12-31', amount: 88888, type: 'expense' },
    ];

    const referenceDate = '2026-03-15';
    const filtered = filterHistoricalExpenses(rawTxs, referenceDate);

    expect(filtered.length).toBe(3);
    expect(filtered.find((t) => t.date > referenceDate)).toBeUndefined();
  });

  it('9. Chronological holdout evaluation does not train on future observations', () => {
    // 4 chronological months
    const monthlyData = [
      { month: '2026-01', actualAmount: 10000, index: 0, transactionCount: 1 },
      { month: '2026-02', actualAmount: 12000, index: 1, transactionCount: 1 },
      { month: '2026-03', actualAmount: 14000, index: 2, transactionCount: 1 },
      { month: '2026-04', actualAmount: 16000, index: 3, transactionCount: 1 },
    ];

    const evalResult = evaluateChronologicalHoldout(monthlyData);

    expect(evalResult.canEvaluate).toBe(true);
    expect(evalResult.trainMonths).toBe(3); // First 3 months used for training
    expect(evalResult.testMonths).toBe(1);  // 4th month used strictly as un-seen test holdout
    // Known trend: train on 10000, 12000, 14000 (y = 2000x + 10000). Predict at x=3 is 16000.
    // Actual at x=3 is 16000 -> MAE should be 0!
    expect(evalResult.mae).toBe(0);
  });

  it('10. MAE is calculated correctly', () => {
    const actual = [10000, 15000, 20000];
    const predicted = [11000, 14000, 22000];
    // Absolute errors: |10000-11000|=1000, |15000-14000|=1000, |20000-22000|=2000
    // Total error = 4000 / 3 = 1333.33
    const mae = calculateMAE(actual, predicted);
    expect(mae).toBeCloseTo(1333.33, 2);
  });

  it('11. Budget comparison works when a budget exists (exceeded vs. buffer)', () => {
    // Case A: Exceeds budget
    const resExceeded = evaluateBudgetComparison(25000, 20000);
    expect(resExceeded.hasBudget).toBe(true);
    expect(resExceeded.isExceeded).toBe(true);
    expect(resExceeded.status).toBe('exceeded');
    expect(resExceeded.difference).toBe(5000);
    expect(resExceeded.message).toContain('exceed your monthly budget');

    // Case B: Within budget buffer
    const resWithin = evaluateBudgetComparison(18000, 20000);
    expect(resWithin.hasBudget).toBe(true);
    expect(resWithin.isExceeded).toBe(false);
    expect(resWithin.status).toBe('within_budget');
    expect(resWithin.difference).toBe(2000);
    expect(resWithin.message).toContain('Healthy Margin');
  });

  it('12. The application handles the absence of a budget gracefully', () => {
    const resNoBudget = evaluateBudgetComparison(25000, 0);
    expect(resNoBudget.hasBudget).toBe(false);
    expect(resNoBudget.status).toBe('no_budget');
    expect(resNoBudget.message).toContain('No active monthly budget configured');
  });

  it('13. Empty transaction history produces a helpful message', () => {
    const result = generateSpendingPrediction([], 0);
    expect(result.hasEnoughData).toBe(false);
    expect(result.monthsCount).toBe(0);
    expect(result.predictedAmount).toBe(0);
    expect(result.explanation).toContain('requires at least 3 months of recorded expenses');
  });

  /* =========================================================================
   * 2. Integration & Multi-User Isolation Tests
   * ========================================================================= */

  describe('User Isolation and API Scoping', () => {
    const userA = {
      name: 'User A ML',
      email: `user_a_ml_${Date.now()}@example.com`,
      password: 'Password123!',
      confirmPassword: 'Password123!',
    };

    const userB = {
      name: 'User B ML',
      email: `user_b_ml_${Date.now()}@example.com`,
      password: 'Password123!',
      confirmPassword: 'Password123!',
    };

    let tokenA: string;
    let tokenB: string;

    beforeAll(async () => {
      // Register User A
      const resA = await request(app).post('/api/auth/register').send(userA);
      expect(resA.status).toBe(201);
      tokenA = resA.body.token;

      // Register User B
      const resB = await request(app).post('/api/auth/register').send(userB);
      expect(resB.status).toBe(201);
      tokenB = resB.body.token;

      // Insert 3 months of expense transactions for User A
      const userIdA = resA.body.user.id;
      const nowIso = new Date().toISOString();
      const insertTx = db.prepare(`
        INSERT INTO transactions (id, user_id, type, amount, category, payment_mode, date, description, created_at, updated_at)
        VALUES (?, ?, 'expense', ?, 'Shopping', 'UPI', ?, 'User A test expense', ?, ?)
      `);

      insertTx.run(`tx_a_1_${Date.now()}`, userIdA, 10000, '2026-01-10', nowIso, nowIso);
      insertTx.run(`tx_a_2_${Date.now()}`, userIdA, 12000, '2026-02-10', nowIso, nowIso);
      insertTx.run(`tx_a_3_${Date.now()}`, userIdA, 14000, '2026-03-10', nowIso, nowIso);

      // User A also creates a monthly budget
      db.prepare(`
        INSERT INTO budgets (id, user_id, category, limit_amount, period, alert_threshold, created_at, updated_at)
        VALUES (?, ?, 'Shopping', 20000, 'monthly', 80, ?, ?)
      `).run(`b_a_1_${Date.now()}`, userIdA, nowIso, nowIso);
    });

    it('7. Predictions are based only on the authenticated user’s transactions', async () => {
      // User A has 3 months of historical data
      const res = await request(app)
        .get('/api/prediction/spending?referenceDate=2026-04-01')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.prediction.hasEnoughData).toBe(true);
      expect(res.body.prediction.monthsCount).toBe(3);
      // y = 2000x + 10000 -> next is 16000
      expect(res.body.prediction.predictedAmount).toBe(16000);
      expect(res.body.prediction.budgetComparison.hasBudget).toBe(true);
      expect(res.body.prediction.budgetComparison.budgetLimit).toBe(20000);
      expect(res.body.prediction.budgetComparison.status).toBe('within_budget');
    });

    it('8. One user cannot retrieve another user’s prediction data', async () => {
      // User B has 0 transactions recorded
      const res = await request(app)
        .get('/api/prediction/spending')
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      // User B MUST have hasEnoughData: false with 0 months, completely isolated from User A
      expect(res.body.prediction.hasEnoughData).toBe(false);
      expect(res.body.prediction.monthsCount).toBe(0);
      expect(res.body.prediction.predictedAmount).toBe(0);
      expect(res.body.prediction.historicalData.length).toBe(0);
    });

    it('Rejects unauthenticated requests to /api/prediction/spending', async () => {
      const res = await request(app).get('/api/prediction/spending');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Unauthorized');
    });
  });
});
