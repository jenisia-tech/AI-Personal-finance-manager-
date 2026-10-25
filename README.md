# AI Personal Finance Manager 💸🤖
### Advanced AI-Driven Personal Finance Platform Demonstrating Course Outcomes CO1, CO2, and CO4 with Full-Stack Authentication, Database Persistence & Workflow Integration

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B%20%7C%20v25-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21.2-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-Native%20DatabaseSync-003B57?logo=sqlite&logoColor=white)](https://nodejs.org/api/sqlite.html)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.21-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-49_Tests_Passed-4BB543?logo=vitest&logoColor=white)](https://vitest.dev/)
[![Currency](https://img.shields.io/badge/Currency-₹_INR-FF9933)](https://en.wikipedia.org/wiki/Indian_rupee)
[![Security](https://img.shields.io/badge/Auth-JWT_%2B_Bcrypt_%2B_HttpOnly-red)](#)

---

## 📋 Table of Contents
1. [Executive Summary](#-executive-summary)
2. [Key Enhancements & Bug Fixes](#-key-enhancements--bug-fixes)
   - [Financial Amount Persistence Bug Resolution](#financial-amount-persistence-bug-resolution)
   - [Full-Stack Authentication & Session Management](#full-stack-authentication--session-management)
   - [Persistent SQLite Database Architecture](#persistent-sqlite-database-architecture)
   - [Multi-Tenant User Workspace Isolation](#multi-tenant-user-workspace-isolation)
   - [Zero Default/Invented Data Policy](#zero-defaultinvented-data-policy)
3. [Integration of Course Outcomes (CO1, CO2, CO4) in Normal Workflow](#-integration-of-course-outcomes-co1-co2-co4-in-normal-workflow)
   - [CO1: Intelligent Agent on Dashboard & AI Advisor](#co1-intelligent-agent-on-dashboard--ai-advisor)
   - [CO2: Search-Based Milestone Planning in Savings Goals](#co2-search-based-milestone-planning-in-savings-goals)
   - [CO4: Forward-Chaining Rules & Monte Carlo in Budget Planner](#co4-forward-chaining-rules--monte-carlo-in-budget-planner)
4. [Academic Course Outcomes (CO1, CO2, CO4) in Dedicated AI Lab](#-academic-course-outcomes-co1-co2-co4-in-dedicated-ai-lab)
   - [CO1: Intelligent Agent Models & Goal-Based Problem Solving](#co1-intelligent-agent-models--goal-based-problem-solving)
   - [CO2: Uninformed & Informed Search Techniques](#co2-uninformed--informed-search-techniques)
   - [CO4: Reasoning Under Uncertainty (Rules & Probabilities)](#co4-reasoning-under-uncertainty-rules--probabilities)
5. [Complete System Architecture & Directory Map](#-complete-system-architecture--directory-map)
6. [Database Schema & Migrations](#-database-schema--migrations)
7. [API Specification](#-api-specification)
8. [Environment Configuration](#-environment-configuration)
9. [Automated Verification & Unit Test Suite (49 Tests)](#-automated-verification--unit-test-suite-49-tests)
10. [Getting Started (Run Locally)](#-getting-started-run-locally)
11. [Step-by-Step Academic Evaluation Demonstration Script](#-step-by-step-academic-evaluation-demonstration-script)

---

## 🌟 Executive Summary

**AI Personal Finance Manager** is a production-grade, secure financial engineering web application tailored for Indian users (students, salaried professionals, and families). Built with an **Express + Node.js** backend, a **Native SQLite (`node:sqlite`)** persistent database, and a **React 18 + TypeScript + Vite + Tailwind CSS** frontend, it combines comprehensive accounting capabilities with **transparent, deterministic, explainable Artificial Intelligence**.

Unlike simple expense trackers, this application doubles as an interactive **AI Algorithms Laboratory** and seamlessly integrates academic AI concepts into everyday financial management:
- **CO1, CO2, and CO4 in Daily Workflow:** Autonomous agent recommendations on the Dashboard, heuristic search roadmaps in Savings Goals, and forward-chaining rules with Monte Carlo risk simulation in the Budget Planner.
- **Dedicated Academic AI Algorithms Lab:** An educational workbench to compare BFS vs. Best-First Search traces, test agent counterfactuals with spending sliders, and inspect stochastic distribution quantiles.
- **100% Deterministic & Offline AI:** Mathematical agent cycles, state-space search with visited-node pruning, forward-chaining deduction, and seeded Monte Carlo stochastic simulations.
- **Strict Multi-Tenant Security:** Every user has an isolated workspace protected by bcrypt password hashing, JWT authentication stored in HttpOnly cookies, and strict server-side authorization.
- **Zero Hallucinated / Default Financial Data:** Fresh accounts open with clean, empty states. No fake transactions, budgets, or balances are generated automatically.
- **Strict Indian Financial Context:** All amounts represented in Indian Rupees (`₹`), formatted in the Indian numbering system (Lakhs & Crores), featuring domestic payment modes (`UPI`, `Net Banking`, `Debit/Credit Card`, `Cash`).

---

## 🔧 Key Enhancements & Bug Fixes

### Financial Amount Persistence Bug Resolution
- **Root Cause 1 (`Math.max` clamping):** Previously, `DashboardView`, `Sidebar`, `AdvisorSummaryCard`, and AI services calculated income using `Math.max(calculateTotalIncome(...), userProfile.monthlyIncome)` where `userProfile.monthlyIncome` defaulted to ₹1,03,000. As a result, entering ₹30,000 salary was overridden visually by ₹1,03,000.
  - *Fix:* Removed artificial income clamping. Totals are derived directly and strictly from user-entered, validated transaction records.
- **Root Cause 2 (`storageService` fallback overwrite):** Any parse error or initial load condition in localStorage previously wiped out user state and re-injected hardcoded mock data.
  - *Fix:* Replaced client-side localStorage fallback mechanisms with server-side database persistence. User records are stored in SQLite and queried by authenticated user ID.
- **Root Cause 3 (Fake chart fallback generation):** `IncomeExpenseChart` previously contained fallback expressions (`|| 95000`, `|| (58000 + idx * 1500)`) that injected random numbers whenever a month had no entries.
  - *Fix:* Replaced all mock generators with real transaction aggregation across historical months.
- **Root Cause 4 (Goal deposit/withdraw cash flow omission):** Savings goal deposits modified goal balances in isolation without affecting transactions or cash-flow balances.
  - *Fix:* Savings goal deposits and withdrawals now atomically record linked transactions (`deposit` / `withdrawal`) affecting net savings consistently.
- **Exact Numeric Validation:** Financial amounts are validated to ensure `amount > 0`, sanitized against NaN, and rounded to exact 2-decimal paise precision (`Math.round(amount * 100) / 100`).

### Full-Stack Authentication & Session Management
- **Registration (`/api/auth/register`):** Normalized email addresses, name validation, password confirmation, minimum length enforcement (8+ characters), and bcrypt hashing (10 salt rounds).
- **Login (`/api/auth/login`):** Validates credentials, issues a signed JSON Web Token (JWT) with 7-day expiration, and sets a secure `HttpOnly`, `SameSite=Lax` cookie while returning user profile metadata.
- **Logout (`/api/auth/logout`):** Clears the auth cookie on the server and resets client state.
- **Session Verification (`/api/auth/me`):** Authenticates the session cookie or `Authorization: Bearer <token>` header on app initialization.
- **Rate Limiting:** Protects `/api/auth` endpoints against brute-force attacks (15-minute window, max 20 attempts).
- **Protected Routing:** Unauthenticated users are redirected to the Login/Registration views. All financial pages (`Dashboard`, `Transactions`, `Budgets`, `Goals`, `Analytics`, `Advisor`, `AI Lab`, `Settings`) require authentication.

### Persistent SQLite Database Architecture
- Implemented with Node's native synchronous SQLite engine (`node:sqlite` / `DatabaseSync`), supported natively in Node.js v22+ and v25 without requiring external C++ compiler tools or `node-gyp`.
- Automatic table creation, foreign key constraints (`ON DELETE CASCADE`), indexes on `user_id`, and Write-Ahead Logging (WAL) for high concurrency and zero corruption.
- Server runs on port `5001` (configured via `.env`), while Vite dev server runs on port `3000` with `/api` reverse proxying.

### Multi-Tenant User Workspace Isolation
- **Server-Side Enforcement:** Every query (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) enforces `WHERE user_id = ?` using `req.user.id` extracted from the validated server-side JWT session.
- **Zero Client Trust:** Client-supplied `user_id` values in request bodies or parameters are completely ignored.
- **Cross-User Protection:** Attempting to fetch, update, delete, or export another user's records yields `404 Not Found` or `403 Forbidden`.
- **Verified via Automated Tests and Browser Agent:** Two separate user accounts (e.g., Alex Sharma and Priya Patel) have completely distinct financial records, transactions, budgets, and goals with zero cross-tenant leakage.

### Zero Default/Invented Data Policy
- When a new user registers:
  - Total Income: ₹0.00
  - Total Expenses: ₹0.00
  - Net Savings: ₹0.00
  - Transactions: Empty list
  - Budgets: Empty list
  - Savings Goals: Empty list
- Clean, welcoming empty-state prompts guide users to add their first real transaction.
- Development demo data is strictly relegated to an explicit, manual seed utility (`/api/data/dev-seed` in Settings) and is never invoked automatically for new registrations.

---

## ⚡ Integration of Course Outcomes (CO1, CO2, CO4) in Normal Workflow

Rather than existing only inside the laboratory, CO1, CO2, and CO4 are integrated directly into the daily user workflow:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DAILY USER WORKFLOW AI INTEGRATION                       │
├──────────────────────────┬──────────────────────────┬───────────────────────┤
│     DASHBOARD (CO1)      │   SAVINGS GOALS (CO2)    │  BUDGET PLANNER (CO4) │
├──────────────────────────┼──────────────────────────┼───────────────────────┤
│ • Auto & Manual Advice   │ • Goal Roadmap Generator │ • Real-Time Rule      │
│ • Active Goal Switcher   │ • Uninformed: BFS Plan   │   Engine Diagnostics  │
│ • Counterfactual Metrics │ • Informed: Best-First   │ • On-Demand Monte     │
│ • 5-Stage Agent Pipeline │ • Preview in Goal Modal  │   Carlo Risk (N=1000) │
└──────────────────────────┴──────────────────────────┴───────────────────────┘
```

### CO1: Intelligent Agent on Dashboard & AI Advisor
- **Live Environmental Perception:** Automatically perceives latest saved income, expenses, daily burn rate, and category distributions using `useMemo`.
- **On-Demand Manual Trigger:** A prominent **"Request Advice"** button allows users to manually re-analyze their finances on demand with tactile feedback and timestamp indicators.
- **Goal Selection in Normal View:** Users can toggle between active agent goals directly on the Dashboard:
  - `Avoid Budget Breaches`: Identifies near-breach and breached categories.
  - `Accelerate Savings Targets`: Optimizes monthly surplus allocation for milestone goals.
  - `Maintain Emergency Safety Net`: Preserves 3–6 months of liquid defensive runway.
  - `Trim Discretionary Outflows`: Caps shopping and entertainment allocations.
- **Counterfactual Evaluation:** Displays predicted before vs. after metrics (e.g., $+15\%$ savings rate improvement) directly in the card.
- **5-Stage Pipeline Inspector:** Expandable drawer displays the formal Perceive $\rightarrow$ Analyze $\rightarrow$ Decide $\rightarrow$ Act $\rightarrow$ Evaluate cycle.

### CO2: Search-Based Milestone Planning in Savings Goals
- **Savings Goal Card Integration:** Every goal card features a **"🧭 AI Plan"** button opening the **Goal Plan Modal**.
- **Dual Search Techniques:**
  - **BFS (Breadth-First Search):** Uninformed layer-by-layer exploration guaranteeing minimal planning months.
  - **Greedy Best-First Search:** Informed search guided by admissible heuristic $h(n) = \max(0, \text{Target} - S_n)$.
- **Roadmap Visualization:** Displays month-by-month contribution roadmap ($M_1, M_2, \dots$), cumulative savings progress, states explored, and execution time in milliseconds.
- **Goal Creation Preview:** Integrated directly into `GoalFormModal`, allowing users to preview roadmap feasibility before saving the goal.

### CO4: Forward-Chaining Rules & Monte Carlo in Budget Planner
- **Forward-Chaining Rule Diagnostics:** Real-time expert inference engine evaluates 7 domain rules against working memory facts. Displays active warnings, condition premises, conclusions, and remediation actions.
- **On-Demand Monte Carlo Budget Risk Simulation:** On every budget card, a **"🎲 Simulate Risk (CO4)"** action triggers $N=1,000$ iterations using the Mulberry32 PRNG and Gaussian daily spending variance.
  - Computes breach probability ($0\% - 100\%$) and risk category (Low, Moderate, High).
  - Calculates statistical quantiles: $P_{10}$ (best-case), $P_{50}$ (median), $P_{90}$ (stress test).
  - Emits actionable daily spending curbs to ensure budget adherence.
- **Zero Performance Overhead:** Simulations run strictly on demand, avoiding heavy repeated calculations on unrelated re-renders.

---

## 🔬 Academic Course Outcomes (CO1, CO2, CO4) in Dedicated AI Lab

The **AI Algorithms Lab** (`src/components/ai-lab/`) remains fully preserved as an educational demonstration workbench sharing the exact same underlying services.

### CO1: Intelligent Agent Models & Goal-Based Problem Solving
- 5-Stage Agentic Loop (`src/services/financialAgentService.ts`).
- Interactive What-If Simulation: Adjust spending spike sliders (₹0 to ₹25,000) on any category in real time to observe instant agent re-evaluation.

### CO2: Uninformed & Informed Search Techniques
- State-space formulation $(m, S_m)$ reaching savings target $T$ within horizon $H$.
- BFS FIFO Queue vs. Greedy Best-First Priority Queue with $h(n)$.
- Algorithm comparator with state exploration ratios, max frontier size, and complete expansion trace table.

### CO4: Reasoning Under Uncertainty (Rules & Probabilities)
- Forward-Chaining Rule Engine evaluating working memory facts against inference rules.
- Seeded Monte Carlo Simulation with Box-Muller Gaussian daily volatility and quantile spectrum chart.

---

## 🛠️ Complete System Architecture & Directory Map

```
AI-Personal-finance-manager-/
├── package.json                 # Dependencies (express, bcryptjs, jsonwebtoken, etc.)
├── tsconfig.json                # Strict TypeScript configuration
├── tsconfig.server.json         # Node.js server TypeScript configuration
├── vite.config.ts               # Bundler configuration (Port 3000, /api proxy to 5001)
├── tailwind.config.js           # Design tokens, dark mode & slate palette
├── .env.example                 # Environment configuration template
├── .env                         # Local runtime environment secrets
├── data/
│   └── finance.db               # SQLite database file (WAL mode, auto-created)
│
├── server/                      # Express + SQLite Backend Architecture
│   ├── index.ts                 # Server entry point (starts listener on port 5001)
│   ├── app.ts                   # Express app setup, CORS, cookies, routes
│   ├── db/
│   │   ├── database.ts          # Native DatabaseSync SQLite connection & schema DDL
│   │   └── seed.ts              # Explicit dev-only demo seed utility
│   ├── middleware/
│   │   ├── auth.ts              # JWT authentication & session verification middleware
│   │   └── rateLimiter.ts       # Auth rate limiter (bypassed in test mode)
│   ├── routes/
│   │   ├── auth.ts              # /api/auth/register, /login, /logout, /me
│   │   ├── transactions.ts      # /api/transactions CRUD with user isolation
│   │   ├── budgets.ts           # /api/budgets CRUD with user isolation
│   │   ├── goals.ts             # /api/goals CRUD + /deposit and /withdraw actions
│   │   ├── user.ts              # /api/user/profile update
│   │   └── data.ts              # /api/data/dev-seed, /export, /import
│   └── tests/
│       └── authAndIsolation.test.ts # 19 automated integration tests (Supertest)
│
├── src/                         # React 18 + TypeScript Frontend Architecture
│   ├── main.tsx                 # React DOM mount point
│   ├── App.tsx                  # Root layout, router, Auth gating
│   ├── context/
│   │   ├── AuthContext.tsx      # Auth state (user, login, register, logout, init)
│   │   └── FinanceContext.tsx   # Financial state synced with backend API
│   ├── services/
│   │   ├── api.ts               # Fetch client with credentials and token support
│   │   ├── financialAgentService.ts     # [CO1] 5-Stage Agent Loop
│   │   ├── financialSearchService.ts    # [CO2] BFS & Best-First Search
│   │   ├── financialReasoningService.ts # [CO4] Rule Engine & Monte Carlo
│   │   └── aiAdvisorService.ts          # FinBot conversational reasoning
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx    # Clean, responsive sign-in interface
│   │   │   └── RegisterPage.tsx # Registration with password confirmation
│   │   ├── common/
│   │   │   ├── Header.tsx       # Dynamic month selector, sign out, greeting
│   │   │   ├── Sidebar.tsx      # Navigation with net surplus preview & user badge
│   │   │   └── EmptyState.tsx   # Professional empty states for zero-data
│   │   ├── dashboard/
│   │   │   ├── DashboardView.tsx       # Master dashboard screen
│   │   │   ├── AdvisorSummaryCard.tsx  # [CO1] Live Agent Card with manual triggers
│   │   │   └── BudgetOverviewWidget.tsx# [CO4] Budget widget with rule alerts
│   │   ├── transactions/        # Transaction list, modal form, filter tabs
│   │   ├── budget/
│   │   │   ├── BudgetPlannerView.tsx   # [CO4] Budget planner with Rule Diagnostics
│   │   │   ├── BudgetCard.tsx          # Category card with [CO4] Simulate Risk button
│   │   │   ├── BudgetRiskModal.tsx     # [CO4] Monte Carlo simulation modal
│   │   │   └── BudgetFormModal.tsx     # Budget limit modal
│   │   ├── goals/
│   │   │   ├── SavingsGoalsView.tsx    # Savings goals grid & summary
│   │   │   ├── SavingsGoalCard.tsx     # Milestone card with [CO2] AI Plan button
│   │   │   ├── GoalPlanModal.tsx       # [CO2] BFS & Best-First roadmap modal
│   │   │   └── GoalFormModal.tsx       # Goal modal with [CO2] plan preview
│   │   ├── analytics/           # 5 Recharts visualizations
│   │   ├── advisor/             # FinBot AI chat assistant
│   │   ├── ai-lab/              # CO1, CO2, CO4 dedicated interactive panels
│   │   └── settings/            # Profile, backup/restore, dev seed
│   ├── utils/
│   │   ├── calculations.ts      # Pure financial math (cash flows, health score)
│   │   └── formatters.ts        # formatINR (₹ Lakhs & Crores), dates
│   └── tests/
│       ├── aiAlgorithms.test.ts         # 12 Vitest tests for AI Lab (CO1, CO2, CO4)
│       ├── workflowIntegration.test.ts  # 11 Vitest tests for workflow integration
│       └── financialCalculations.test.ts# 7 Vitest tests for financial math
```

---

## 🗄️ Database Schema & Migrations

The database is automatically initialized on backend startup in [`server/db/database.ts`](file:///c:/Users/haeue/OneDrive/Desktop/Jenoi/College/MP/AI-Personal-finance-manager-/server/db/database.ts).

### Tables:

#### 1. `users`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | TEXT | PRIMARY KEY | Unique user ID (UUID v4) |
| `name` | TEXT | NOT NULL | User's full name |
| `email` | TEXT | UNIQUE NOT NULL | Normalized lowercase email |
| `password_hash` | TEXT | NOT NULL | Bcrypt salt & hash (10 rounds) |
| `monthly_income` | REAL | DEFAULT 0 | Target monthly income |
| `currency` | TEXT | DEFAULT 'INR' | User's preferred currency |
| `theme` | TEXT | DEFAULT 'dark' | UI theme preference |
| `created_at` | TEXT | NOT NULL | ISO-8601 timestamp |
| `updated_at` | TEXT | NOT NULL | ISO-8601 timestamp |

#### 2. `transactions`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | TEXT | PRIMARY KEY | Unique transaction ID |
| `user_id` | TEXT | NOT NULL, FK `users(id)` | Record owner |
| `type` | TEXT | NOT NULL | `income`, `expense`, `deposit`, `withdrawal` |
| `amount` | REAL | NOT NULL | Monetary amount (> 0, 2 decimals) |
| `category` | TEXT | NOT NULL | Category name |
| `description` | TEXT | - | Optional description note |
| `date` | TEXT | NOT NULL | Transaction date (YYYY-MM-DD) |
| `payment_mode` | TEXT | DEFAULT 'UPI' | UPI, Credit Card, Debit Card, Cash, etc. |
| `goal_id` | TEXT | FK `savings_goals(id)` | Linked goal for deposits/withdrawals |
| `created_at` | TEXT | NOT NULL | ISO-8601 timestamp |
| `updated_at` | TEXT | NOT NULL | ISO-8601 timestamp |

#### 3. `budgets`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | TEXT | PRIMARY KEY | Unique budget ID |
| `user_id` | TEXT | NOT NULL, FK `users(id)` | Record owner |
| `category` | TEXT | NOT NULL | Budget category |
| `amount` | REAL | NOT NULL | Spending cap amount (> 0) |
| `period` | TEXT | DEFAULT 'monthly' | Budget cycle period |
| `start_date` | TEXT | - | Period start date |
| `end_date` | TEXT | - | Period end date |
| `created_at` | TEXT | NOT NULL | ISO-8601 timestamp |
| `updated_at` | TEXT | NOT NULL | ISO-8601 timestamp |

#### 4. `savings_goals`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | TEXT | PRIMARY KEY | Unique goal ID |
| `user_id` | TEXT | NOT NULL, FK `users(id)` | Record owner |
| `name` | TEXT | NOT NULL | Goal name |
| `target_amount` | REAL | NOT NULL | Target savings amount (> 0) |
| `current_amount`| REAL | DEFAULT 0 | Accumulated balance |
| `target_date` | TEXT | NOT NULL | Target deadline (YYYY-MM-DD) |
| `category` | TEXT | - | Goal classification category |
| `icon` | TEXT | - | Emoji icon indicator |
| `created_at` | TEXT | NOT NULL | ISO-8601 timestamp |
| `updated_at` | TEXT | NOT NULL | ISO-8601 timestamp |

---

## 📡 API Specification

All `/api/*` endpoints (except `/api/auth/register`, `/api/auth/login`, and `/api/health`) require authentication via HttpOnly session cookie or `Authorization: Bearer <token>` header.

### Authentication Endpoints
- `POST /api/auth/register` — Creates user, returns JWT and user profile.
- `POST /api/auth/login` — Authenticates user credentials, sets session cookie.
- `POST /api/auth/logout` — Invalidates session cookie.
- `GET /api/auth/me` — Returns current authenticated user profile.

### Transactions Endpoints
- `GET /api/transactions` — Returns all transactions for the authenticated user.
- `POST /api/transactions` — Creates a new transaction with validation.
- `PUT /api/transactions/:id` — Updates an existing transaction (enforces ownership).
- `DELETE /api/transactions/:id` — Deletes an existing transaction (enforces ownership).

### Budgets Endpoints
- `GET /api/budgets` — Returns all category budgets for the authenticated user.
- `POST /api/budgets` — Creates or updates a category budget.
- `PUT /api/budgets/:id` — Modifies budget parameters.
- `DELETE /api/budgets/:id` — Deletes budget.

### Savings Goals Endpoints
- `GET /api/goals` — Returns savings goals for the authenticated user.
- `POST /api/goals` — Creates a new savings goal.
- `PUT /api/goals/:id` — Updates goal parameters.
- `DELETE /api/goals/:id` — Deletes goal and cascades unlinked associations.
- `POST /api/goals/:id/deposit` — Adds money to goal and records linked transaction.
- `POST /api/goals/:id/withdraw` — Withdraws money from goal and records linked transaction.

### Data & Backup Endpoints
- `GET /api/data/export` — Downloads user-isolated JSON snapshot of all records.
- `POST /api/data/import` — Securely imports records, assigning `user_id = req.user.id`.
- `POST /api/data/dev-seed` — Explicit development-only action to seed sample Indian records.

---

## ⚙️ Environment Configuration

Configuration is managed via environment variables. Create a `.env` file in the project root based on `.env.example`:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database Settings
DATABASE_FILE=./data/finance.db

# Authentication Secrets (Replace with a strong secret in production!)
JWT_SECRET=your-super-secret-jwt-key-replace-in-production-min-32-chars
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

---

## 🧪 Automated Verification & Unit Test Suite (49 Tests)

The application includes **49 automated unit and integration tests** across four suites:

```bash
npm test
```

### Test Suite Breakdown:

#### 1. Workflow Integration: Normal Daily Workflow Tests (`src/tests/workflowIntegration.test.ts` — 11 tests)
- **CO1:** Uses latest saved database transactions and budgets to perceive environment.
- **CO1:** Identifies budget conditions and selects appropriate action on `avoid_budget_breach` goal.
- **CO1:** Adapts advice when user switches active goal in normal workflow (`avoid_budget_breach`, `reach_savings_goal`, `maintain_emergency_fund`).
- **CO1:** Produces counterfactual evaluation showing predicted improvement.
- **CO2:** Generates a step-by-step roadmap for a specific savings goal using BFS.
- **CO2:** Generates a roadmap for a specific savings goal using Greedy Best-First Search with heuristic $h(n)$.
- **CO2:** Correctly reports failure when horizon or choices cannot satisfy goal.
- **CO4:** Evaluates forward-chaining rules on saved user data and triggers budget overrun rule.
- **CO4:** Evaluates near-breach rule when category utilization is $\ge 90\%$.
- **CO4:** Runs Monte Carlo budget risk simulation on-demand for a category budget.
- **CO4:** Produces $100\%$ deterministic Monte Carlo simulation results with the same random seed.

#### 2. Academic AI Algorithms Lab Tests (`src/tests/aiAlgorithms.test.ts` — 12 tests)
- **CO1:** Intelligent agent changes recommendation when financial state changes.
- **CO1:** Separates Perceive, Analyze, Decide, Act, Evaluate stages cleanly.
- **CO2:** BFS finds a valid plan for a reachable savings target.
- **CO2:** Search algorithms report failure correctly when no goal state is reachable.
- **CO2:** Search does not explore the same state repeatedly (`Set` tracking).
- **CO2:** Best-First Search orders its frontier according to heuristic $h(n)$.
- **CO2:** Compares BFS and Best-First Search on identical problem definitions.
- **CO4:** Rule-based reasoning fires correct rules for valid input conditions.
- **CO4:** Reasoning engine handles multiple simultaneously triggered rules.
- **CO4:** Probability estimator produces reproducible results with a fixed seed.
- **Robustness:** Zero budget, empty transactions, or missing income does not crash app.
- **Formatting:** Financial calculations and Indian formatting (`₹`) handle edge cases.

#### 3. Backend Authentication, Multi-Tenant Isolation & Persistence (`server/tests/authAndIsolation.test.ts` — 19 tests)
- User registration with valid credentials.
- Duplicate email registration rejection (`409 Conflict`).
- Rejection of short passwords and missing fields.
- Login with correct password issuance of JWT and HttpOnly cookie.
- Rejection of incorrect password (`401 Unauthorized`).
- Logout and session clearance.
- Authentication requirement for protected `/api/transactions` endpoint.
- Registration creates 0 default transactions for new user accounts.
- Transaction amount exact persistence (no random numbers).
- Decimal paise precision preservation.
- Full CRUD operations with user isolation.
- Cross-tenant security: User A cannot read User B's transactions (`404 Not Found`).
- Cross-tenant security: User A cannot update User B's transactions (`404 Not Found`).
- Cross-tenant security: User A cannot delete User B's transactions (`404 Not Found`).
- Budgets CRUD and user isolation.
- Savings goals CRUD and user isolation.
- Goal deposits atomically create linked transactions.
- Data export isolates user records strictly.
- Data import assigns ownership to the authenticated user.

#### 4. Financial Calculations & Cash Flow (`src/tests/financialCalculations.test.ts` — 7 tests)
- Income calculation sums only income transactions.
- Expense calculation sums only expense transactions.
- Goal deposits and withdrawals are accurately aggregated.
- Net savings formula correctly evaluates `Income - Expenses + Withdrawals - Deposits`.
- Health score evaluation behaves predictably on zero, low, and high savings.
- Currency formatter formats numbers with Indian grouping (`₹1,00,000.00`).
- AI Reasoning engine handles empty transaction facts safely without crashing.

---

## 🚀 Getting Started (Run Locally)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher; v22+ or v25 recommended)
- `npm`

### Installation & Launch

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd AI-Personal-finance-manager-
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

4. **Run the full test suite:**
   ```bash
   npm test
   ```

5. **Start frontend and backend concurrently:**
   ```bash
   npm run dev
   ```
   - Frontend starts on: `http://localhost:3000`
   - Backend API starts on: `http://localhost:5001`

6. **Build for production:**
   ```bash
   npm run build
   ```

---

## 🎓 Step-by-Step Academic Evaluation Demonstration Script

Follow this structured script when demonstrating the platform for evaluation or viva:

### Step 1: Authentication & Multi-Tenant Isolation
1. Open `http://localhost:3000`. You will be directed to the **Login** screen.
2. Click **Create an account** and register **User A** (`alex@testbank.com`, password `Password123!`).
3. Notice that the dashboard opens in an **Empty State** with ₹0.00 Income, ₹0.00 Expenses, ₹0.00 Net Savings, and no transactions.
4. Click **+ Add Income** and record a Salary transaction:
   - Type: `Income`
   - Amount: `30000`
   - Category: `Salary`
   - Description: `Primary Monthly Salary`
5. Observe the dashboard update instantly: Total Inflows **₹30,000.00**, Net Surplus **₹30,000.00**.
6. **Reload the page (`F5`).** Confirm that the amount remains exactly **₹30,000.00** (no random changes or mock resets).

### Step 2: CO1 in Normal Workflow (Dashboard & AI Advisor)
1. On the Dashboard, review the **FinBot Intelligence & Health Score** card.
2. Click the **Request Advice** button. Notice the dynamic refresh indicator and timestamp (`Refreshed at ...`).
3. Switch active goals directly on the card by clicking `Accelerate Savings Targets` or `Maintain Emergency Net`. Notice how the agent's recommended action and counterfactual metric change in real time.
4. Click **Inspect 5-Stage Agent Pipeline (CO1)** to reveal the breakdown across Perceive, Analyze, Decide, Act, and Evaluate.

### Step 3: CO4 in Normal Workflow (Budget Planner)
1. Navigate to **Budget Planner** in the sidebar.
2. Review the **CO4 Forward-Chaining Rule Diagnostics** banner. Click **Inspect Rules** to see how formal IF-THEN rules evaluate live working memory facts.
3. If no budget exists, click **+ Set Category Budget** (e.g. Food, Limit: `₹15,000`).
4. On the Food budget card, click **🎲 Simulate Risk (CO4)**.
5. In the **Budget Risk Simulation Modal**, observe the calculated breach probability, P10/P50/P90 quantiles, and the specific mitigation directive generated by the Monte Carlo engine.

### Step 4: CO2 in Normal Workflow (Savings Goals)
1. Navigate to **Savings Goals** in the sidebar.
2. On any goal card (or click **+ New Savings Target** to create one), click **🧭 AI Plan**.
3. In the **AI Savings Plan Modal**, switch between **Greedy Best-First** (heuristic distance) and **BFS (Minimal Steps)**.
4. Observe the step-by-step monthly contribution roadmap ($M_1, M_2, \dots$) and the search execution metrics (states explored, execution time).

### Step 5: Dedicated AI Algorithms Lab Demonstration
1. Click **AI Algorithms Lab** in the navigation sidebar.
2. **CO1 Tab:** Demonstrate the formal 5-stage agent cycle and use the **What-If Expense Spike Slider** to test counterfactual reasoning.
3. **CO2 Tab:** Run **Compare Both Algorithms** to compare BFS against Best-First Search on explored states, max frontier, and search trace table.
4. **CO4 Tab:** Inspect working memory facts, fired inference rules, and execute the full **Monte Carlo Budget Risk Simulator** ($N=1,000$, seed: `42`).

---

## 📄 License
This project was developed for educational and academic evaluation purposes.
