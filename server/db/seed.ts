import { DatabaseSync } from 'node:sqlite';
import crypto from 'crypto';
import { db as defaultDb } from './database.ts';

export function seedDemoDataForUser(userId: string, database?: DatabaseSync): void {
  const targetDb = database || defaultDb;
  const now = new Date().toISOString();
  const currentYM = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

  // 1. Update user profile monthly income baseline to 103000
  targetDb.prepare(`
    UPDATE users SET monthly_income = 103000, updated_at = ? WHERE id = ?
  `).run(now, userId);

  // 2. Clear existing records for this user (if re-seeding)
  targetDb.prepare('DELETE FROM transactions WHERE user_id = ?').run(userId);
  targetDb.prepare('DELETE FROM budgets WHERE user_id = ?').run(userId);
  targetDb.prepare('DELETE FROM savings_goals WHERE user_id = ?').run(userId);

  // 3. Insert Savings Goals
  const goals = [
    {
      id: `g-${crypto.randomUUID()}`,
      title: 'Emergency Fund (6 Months)',
      target_amount: 150000,
      current_amount: 95000,
      target_date: '2026-12-31',
      category: 'Safety',
      icon: '🛡️',
      color: '#34C759',
    },
    {
      id: `g-${crypto.randomUUID()}`,
      title: 'MacBook Pro M3 Max',
      target_amount: 140000,
      current_amount: 85000,
      target_date: '2027-03-31',
      category: 'Tech',
      icon: '💻',
      color: '#0071E3',
    },
    {
      id: `g-${crypto.randomUUID()}`,
      title: 'Goa Year-End Vacation',
      target_amount: 25000,
      current_amount: 18000,
      target_date: '2026-11-25',
      category: 'Travel',
      icon: '🏖️',
      color: '#FF9500',
    },
  ];

  const goalStmt = targetDb.prepare(`
    INSERT INTO savings_goals (id, user_id, title, target_amount, current_amount, target_date, category, icon, color, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const g of goals) {
    goalStmt.run(
      g.id,
      userId,
      g.title,
      g.target_amount,
      g.current_amount,
      g.target_date,
      g.category,
      g.icon,
      g.color,
      now,
      now
    );
  }

  // 4. Insert Budgets
  const budgets = [
    { category: 'Food', limit: 12000, threshold: 85 },
    { category: 'Entertainment', limit: 3000, threshold: 85 },
    { category: 'Shopping', limit: 8000, threshold: 80 },
    { category: 'Transport', limit: 5000, threshold: 80 },
    { category: 'Bills', limit: 26000, threshold: 90 },
    { category: 'Healthcare', limit: 4000, threshold: 80 },
  ];

  const budgetStmt = targetDb.prepare(`
    INSERT INTO budgets (id, user_id, category, limit_amount, period, alert_threshold, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'monthly', ?, ?, ?)
  `);

  for (const b of budgets) {
    budgetStmt.run(`b-${crypto.randomUUID()}`, userId, b.category, b.limit, b.threshold, now, now);
  }

  // 5. Insert Transactions
  const transactions = [
    { type: 'income', amount: 85000, category: 'Salary', paymentMode: 'Net Banking', date: `${currentYM}-01`, desc: 'Monthly Software Engineer Salary' },
    { type: 'income', amount: 18000, category: 'Freelance', paymentMode: 'UPI', date: `${currentYM}-05`, desc: 'Mobile App UI/UX Design Project' },
    { type: 'expense', amount: 22000, category: 'Bills', paymentMode: 'Net Banking', date: `${currentYM}-02`, desc: 'Apartment Monthly Rent & Maintenance' },
    { type: 'expense', amount: 7850, category: 'Food', paymentMode: 'UPI', date: `${currentYM}-04`, desc: 'Monthly Groceries at Nature Basket' },
    { type: 'expense', amount: 4200, category: 'Food', paymentMode: 'UPI', date: `${currentYM}-10`, desc: 'Swiggy & Weekend Dinner with Friends' },
    { type: 'expense', amount: 2800, category: 'Bills', paymentMode: 'UPI', date: `${currentYM}-08`, desc: 'Electricity & Broadband Bill' },
    { type: 'expense', amount: 2400, category: 'Transport', paymentMode: 'UPI', date: `${currentYM}-12`, desc: 'Metro Card Recharge & Uber Commutes' },
    { type: 'expense', amount: 6500, category: 'Shopping', paymentMode: 'Credit Card', date: `${currentYM}-14`, desc: 'Amazon Festival Electronics & Accessories' },
    { type: 'expense', amount: 2500, category: 'Healthcare', paymentMode: 'UPI', date: `${currentYM}-06`, desc: 'Gym Membership & Whey Protein' },
    { type: 'expense', amount: 1199, category: 'Entertainment', paymentMode: 'Credit Card', date: `${currentYM}-03`, desc: 'Netflix Premium, Spotify & Prime' },
    { type: 'expense', amount: 1800, category: 'Entertainment', paymentMode: 'UPI', date: `${currentYM}-18`, desc: 'IMAX Movie Tickets & Snacks' },
    { type: 'expense', amount: 3500, category: 'Education', paymentMode: 'Debit Card', date: `${currentYM}-15`, desc: 'AI & Machine Learning Certifications Course' },
    { type: 'expense', amount: 10000, category: 'Investments', paymentMode: 'Net Banking', date: `${currentYM}-07`, desc: 'Nifty 50 Index Mutual Fund SIP' },
  ];

  const txStmt = targetDb.prepare(`
    INSERT INTO transactions (id, user_id, type, amount, category, payment_mode, date, description, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const t of transactions) {
    txStmt.run(
      `tx-${crypto.randomUUID()}`,
      userId,
      t.type,
      t.amount,
      t.category,
      t.paymentMode,
      t.date,
      t.desc,
      now,
      now
    );
  }
}
