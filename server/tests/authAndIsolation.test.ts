import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.ts';
import { db } from '../db/database.ts';

describe('1. Authentication Tests', () => {
  const testUser = {
    name: 'Alice Johnson',
    email: `alice_${Date.now()}@example.com`,
    password: 'Password123!',
    confirmPassword: 'Password123!',
  };

  let userToken: string;
  let authCookie: string;

  it('1.1 Rejects registration with missing required fields or invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: '', email: 'not-an-email', password: 'short', confirmPassword: 'short' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation Error');
  });

  it('1.2 Rejects registration when passwords do not match', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...testUser, confirmPassword: 'DifferentPassword123!' });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Password confirmation does not match');
  });

  it('1.3 Successfully registers a new user with empty financial state (zero defaults)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.name).toBe(testUser.name);
    expect(res.body.user.email).toBe(testUser.email.toLowerCase());
    expect(res.body.user.monthlyIncome).toBe(0); // Zero defaults!
    expect(res.body.token).toBeDefined();

    // Verify password hash is never exposed
    expect(res.body.user.password_hash).toBeUndefined();
    expect(res.body.user.password).toBeUndefined();

    userToken = res.body.token;

    // Cookie verification
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    authCookie = Array.isArray(cookies) ? cookies[0] : cookies;
    expect(authCookie).toContain('token=');
    expect(authCookie.toLowerCase()).toContain('httponly');
  });

  it('1.4 Rejects duplicate email registration', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Duplicate Email');
  });

  it('1.5 Rejects login with incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'WrongPassword999!' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid Credentials');
  });

  it('1.6 Successfully logs in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email.toLowerCase());
  });

  it('1.7 Protected endpoints return 401 when called without authentication', async () => {
    const res = await request(app).get('/api/transactions');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('1.8 Protected endpoint /api/auth/me returns user profile with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(testUser.email.toLowerCase());
  });

  it('1.9 Successfully logs out and clears session cookie', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const cookies = res.headers['set-cookie'];
    if (cookies) {
      const cookieStr = Array.isArray(cookies) ? cookies.join(';') : cookies;
      expect(cookieStr).toContain('token=;');
    }
  });
});

describe('2. Financial Persistence, CRUD, and Exact Calculations', () => {
  let userToken: string;
  let userId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Finance Tester',
        email: `tester_${Date.now()}@example.com`,
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });
    userToken = res.body.token;
    userId = res.body.user.id;
  });

  it('2.1 Initially new user has 0 transactions, 0 budgets, 0 goals', async () => {
    const txRes = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${userToken}`);
    expect(txRes.status).toBe(200);
    expect(txRes.body.transactions).toEqual([]);

    const bRes = await request(app)
      .get('/api/budgets')
      .set('Authorization', `Bearer ${userToken}`);
    expect(bRes.status).toBe(200);
    expect(bRes.body.budgets).toEqual([]);

    const gRes = await request(app)
      .get('/api/goals')
      .set('Authorization', `Bearer ${userToken}`);
    expect(gRes.status).toBe(200);
    expect(gRes.body.goals).toEqual([]);
  });

  it('2.2 Adds an income transaction and verifies exact amount is stored', async () => {
    const exactAmount = 45750.5;
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        type: 'income',
        amount: exactAmount,
        category: 'Salary',
        paymentMode: 'Net Banking',
        date: '2026-10-01',
        description: 'Exact Salary Amount',
      });

    expect(res.status).toBe(201);
    expect(res.body.transaction.amount).toBe(exactAmount);
    expect(res.body.transaction.type).toBe('income');
    const txId = res.body.transaction.id;

    // Verify it persists in database with exact query
    const dbRow = db.prepare('SELECT amount, type FROM transactions WHERE id = ?').get(txId) as any;
    expect(dbRow.amount).toBe(exactAmount);
    expect(dbRow.type).toBe('income');
  });

  it('2.3 Adds an expense transaction and verifies exact amount and list update', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        type: 'expense',
        amount: 3250.75,
        category: 'Food',
        paymentMode: 'UPI',
        date: '2026-10-03',
        description: 'Groceries at Mart',
      });

    expect(res.status).toBe(201);
    expect(res.body.transaction.amount).toBe(3250.75);

    // Fetch transactions list
    const listRes = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${userToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.transactions.length).toBe(2);
  });

  it('2.4 Handles zero and invalid amounts gracefully with 400 validation error', async () => {
    const resZero = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        type: 'income',
        amount: 0,
        category: 'Salary',
        paymentMode: 'UPI',
        date: '2026-10-01',
        description: 'Zero amount',
      });
    expect(resZero.status).toBe(400);

    const resNegative = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        type: 'income',
        amount: -500,
        category: 'Salary',
        paymentMode: 'UPI',
        date: '2026-10-01',
        description: 'Negative amount',
      });
    expect(resNegative.status).toBe(400);
  });

  it('2.5 Goal deposit and withdrawal correctly update goal current_amount and record linked transactions', async () => {
    // Create goal
    const goalRes = await request(app)
      .post('/api/goals')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Emergency Fund',
        targetAmount: 100000,
        currentAmount: 20000,
        targetDate: '2027-01-01',
      });
    expect(goalRes.status).toBe(201);
    const goalId = goalRes.body.goal.id;

    // Perform deposit of ₹15,000
    const depRes = await request(app)
      .post(`/api/goals/${goalId}/deposit`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ amount: 15000, paymentMode: 'UPI' });

    expect(depRes.status).toBe(200);
    expect(depRes.body.goal.currentAmount).toBe(35000); // 20000 + 15000
    expect(depRes.body.transaction.type).toBe('deposit');
    expect(depRes.body.transaction.amount).toBe(15000);

    // Perform withdrawal of ₹5,000
    const withRes = await request(app)
      .post(`/api/goals/${goalId}/withdraw`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ amount: 5000, paymentMode: 'Net Banking' });

    expect(withRes.status).toBe(200);
    expect(withRes.body.goal.currentAmount).toBe(30000); // 35000 - 5000
    expect(withRes.body.transaction.type).toBe('withdrawal');
    expect(withRes.body.transaction.amount).toBe(5000);

    // Verify rejection if withdrawing more than current saved
    const overWithRes = await request(app)
      .post(`/api/goals/${goalId}/withdraw`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ amount: 999999 });
    expect(overWithRes.status).toBe(400);
  });
});

describe('3. Multi-Tenant User Isolation', () => {
  let userA_Token: string;
  let userA_Id: string;
  let userB_Token: string;
  let userB_Id: string;
  let userA_TxId: string;
  let userA_BudgetId: string;
  let userA_GoalId: string;

  beforeAll(async () => {
    // Register User A
    const resA = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User Alpha',
        email: `alpha_${Date.now()}@example.com`,
        password: 'PasswordAlpha123!',
        confirmPassword: 'PasswordAlpha123!',
      });
    userA_Token = resA.body.token;
    userA_Id = resA.body.user.id;

    // Register User B
    const resB = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User Beta',
        email: `beta_${Date.now()}@example.com`,
        password: 'PasswordBeta123!',
        confirmPassword: 'PasswordBeta123!',
      });
    userB_Token = resB.body.token;
    userB_Id = resB.body.user.id;

    // User A adds financial records
    const txA = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userA_Token}`)
      .send({
        type: 'income',
        amount: 30000,
        category: 'Salary',
        paymentMode: 'Net Banking',
        date: '2026-10-10',
        description: 'Alpha Salary ₹30,000',
      });
    userA_TxId = txA.body.transaction.id;

    const bA = await request(app)
      .post('/api/budgets')
      .set('Authorization', `Bearer ${userA_Token}`)
      .send({
        category: 'Food',
        limit: 15000,
        alertThreshold: 85,
      });
    userA_BudgetId = bA.body.budget.id;

    const gA = await request(app)
      .post('/api/goals')
      .set('Authorization', `Bearer ${userA_Token}`)
      .send({
        title: 'Alpha Car Fund',
        targetAmount: 500000,
        currentAmount: 100000,
        targetDate: '2028-01-01',
      });
    userA_GoalId = gA.body.goal.id;
  });

  it('3.1 User B sees empty dashboard and ZERO records belonging to User A', async () => {
    const txB = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${userB_Token}`);
    expect(txB.status).toBe(200);
    expect(txB.body.transactions).toEqual([]);

    const budB = await request(app)
      .get('/api/budgets')
      .set('Authorization', `Bearer ${userB_Token}`);
    expect(budB.status).toBe(200);
    expect(budB.body.budgets).toEqual([]);

    const goalB = await request(app)
      .get('/api/goals')
      .set('Authorization', `Bearer ${userB_Token}`);
    expect(goalB.status).toBe(200);
    expect(goalB.body.goals).toEqual([]);
  });

  it('3.2 User B CANNOT read, edit, or delete User A transactions via direct ID manipulation', async () => {
    // Attempt to update User A's transaction using User B's token
    const updateRes = await request(app)
      .put(`/api/transactions/${userA_TxId}`)
      .set('Authorization', `Bearer ${userB_Token}`)
      .send({ amount: 999999, description: 'Hacked by User B' });
    expect(updateRes.status).toBe(404);

    // Attempt to delete User A's transaction using User B's token
    const deleteRes = await request(app)
      .delete(`/api/transactions/${userA_TxId}`)
      .set('Authorization', `Bearer ${userB_Token}`);
    expect(deleteRes.status).toBe(404);

    // Verify User A's transaction is unmodified
    const checkTx = db.prepare('SELECT amount, description FROM transactions WHERE id = ?').get(userA_TxId) as any;
    expect(checkTx.amount).toBe(30000);
    expect(checkTx.description).toBe('Alpha Salary ₹30,000');
  });

  it('3.3 User B CANNOT update or delete User A budgets or savings goals', async () => {
    const budDeleteRes = await request(app)
      .delete(`/api/budgets/${userA_BudgetId}`)
      .set('Authorization', `Bearer ${userB_Token}`);
    expect(budDeleteRes.status).toBe(404);

    const goalDepositRes = await request(app)
      .post(`/api/goals/${userA_GoalId}/deposit`)
      .set('Authorization', `Bearer ${userB_Token}`)
      .send({ amount: 5000 });
    expect(goalDepositRes.status).toBe(404);
  });

  it('3.4 When User B adds records, User A data remains isolated and untouched', async () => {
    // User B adds ₹12,000 expense
    await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${userB_Token}`)
      .send({
        type: 'expense',
        amount: 12000,
        category: 'Shopping',
        paymentMode: 'Credit Card',
        date: '2026-10-12',
        description: 'Beta Shopping',
      });

    // Verify User A still only sees their 1 transaction of ₹30,000
    const txA = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${userA_Token}`);
    expect(txA.body.transactions.length).toBe(1);
    expect(txA.body.transactions[0].amount).toBe(30000);

    // Verify User B only sees their 1 transaction of ₹12,000
    const txB = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${userB_Token}`);
    expect(txB.body.transactions.length).toBe(1);
    expect(txB.body.transactions[0].amount).toBe(12000);
  });

  it('3.5 Export returns strictly the authenticated user data', async () => {
    const exportRes = await request(app)
      .get('/api/data/export')
      .set('Authorization', `Bearer ${userA_Token}`);

    expect(exportRes.status).toBe(200);
    expect(exportRes.body.transactions.length).toBe(1);
    expect(exportRes.body.transactions[0].description).toBe('Alpha Salary ₹30,000');
    expect(exportRes.body.userProfile.name).toBe('User Alpha');
  });
});
