import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const dbPath = process.env.DATABASE_FILE || './data/finance.db';

// Ensure data directory exists
const dbDir = path.dirname(path.resolve(dbPath));
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export function createDatabaseConnection(customPath?: string): DatabaseSync {
  const targetPath = customPath || path.resolve(dbPath);
  const db = new DatabaseSync(targetPath);

  // Enable foreign keys and WAL mode for performance and integrity
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA journal_mode = WAL;');

  // Initialize Schema
  initSchema(db);

  return db;
}

function initSchema(db: DatabaseSync): void {
  // 1. Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      currency TEXT NOT NULL DEFAULT 'INR',
      monthly_income REAL NOT NULL DEFAULT 0,
      theme TEXT NOT NULL DEFAULT 'light',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `);

  // 2. Savings Goals Table (created before transactions so transactions can reference goals)
  db.exec(`
    CREATE TABLE IF NOT EXISTS savings_goals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      target_amount REAL NOT NULL CHECK(target_amount > 0),
      current_amount REAL NOT NULL DEFAULT 0 CHECK(current_amount >= 0),
      target_date TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'General',
      icon TEXT NOT NULL DEFAULT '🎯',
      color TEXT NOT NULL DEFAULT '#34C759',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_goals_user ON savings_goals(user_id);
  `);

  // 3. Transactions Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense', 'deposit', 'withdrawal')),
      amount REAL NOT NULL CHECK(amount > 0),
      category TEXT NOT NULL,
      payment_mode TEXT NOT NULL,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      goal_id TEXT REFERENCES savings_goals(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date);
  `);

  // 4. Budgets Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      category TEXT NOT NULL,
      limit_amount REAL NOT NULL CHECK(limit_amount >= 0),
      period TEXT NOT NULL DEFAULT 'monthly',
      alert_threshold REAL NOT NULL DEFAULT 80,
      start_date TEXT,
      end_date TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(user_id, category)
    );
    CREATE INDEX IF NOT EXISTS idx_budgets_user ON budgets(user_id);
  `);
}

// Singleton database instance
export const db = createDatabaseConnection();
