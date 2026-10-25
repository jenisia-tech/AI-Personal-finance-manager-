# AI Personal Finance Manager 💸🤖
### Advanced AI-Driven Personal Finance Platform Demonstrating Course Outcomes CO1, CO2, CO4, and CO5 with Full-Stack Authentication, Database Persistence & Workflow Integration

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B%20%7C%20v25-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.3.0-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-Native%20DatabaseSync-003B57?logo=sqlite&logoColor=white)](https://nodejs.org/api/sqlite.html)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.21-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Theme](https://img.shields.io/badge/Theme-Bubblegum_%26_Lace-FF5E97)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-88_Tests_Passed-4BB543?logo=vitest&logoColor=white)](https://vitest.dev/)
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
3. [Integration of Course Outcomes (CO1, CO2, CO4, CO5) in Normal Workflow](#-integration-of-course-outcomes-co1-co2-co4-co5-in-normal-workflow)
   - [CO1: Intelligent Agent on Dashboard & AI Advisor](#co1-intelligent-agent-on-dashboard--ai-advisor)
   - [CO2: Search-Based Milestone Planning in Savings Goals](#co2-search-based-milestone-planning-in-savings-goals)
   - [CO4: Forward-Chaining Rules & Monte Carlo in Budget Planner](#co4-forward-chaining-rules--monte-carlo-in-budget-planner)
   - [CO5: Machine Learning Spending Prediction on Dashboard & Dedicated View](#co5-machine-learning-spending-prediction-on-dashboard--dedicated-view)
4. [Academic Course Outcomes (CO1, CO2, CO4, CO5) in Dedicated AI Lab](#-academic-course-outcomes-co1-co2-co4-co5-in-dedicated-ai-lab)
   - [CO1: Intelligent Agent Models & Goal-Based Problem Solving](#co1-intelligent-agent-models--goal-based-problem-solving)
   - [CO2: Uninformed & Informed Search Techniques](#co2-uninformed--informed-search-techniques)
   - [CO4: Reasoning Under Uncertainty (Rules & Probabilities)](#co4-reasoning-under-uncertainty-rules--probabilities)
   - [CO5: Machine Learning for Intelligent Decision-Making (Linear Regression)](#co5-machine-learning-for-intelligent-decision-making-linear-regression)
5. [Complete System Architecture & Directory Map](#-complete-system-architecture--directory-map)
6. [Database Schema & Migrations](#-database-schema--migrations)
7. [API Specification](#-api-specification)
8. [Environment Configuration](#-environment-configuration)
9. [Automated Verification & Unit Test Suite (88 Tests)](#-automated-verification--unit-test-suite-88-tests)
10. [Getting Started (Run Locally)](#-getting-started-run-locally)
11. [Step-by-Step Academic Evaluation Demonstration Script](#-step-by-step-academic-evaluation-demonstration-script)

---

## 🌟 Executive Summary

**AI Personal Finance Manager** is a production-grade, secure financial engineering web application tailored for Indian users (students, salaried professionals, and families). Built with an **Express + Node.js** backend, a **Native SQLite (`node:sqlite`)** persistent database, and a **React 18 + TypeScript + Vite + Tailwind CSS** frontend styled with an elegant **Bubblegum & Lace** visual theme, it combines comprehensive accounting capabilities with **transparent, deterministic, explainable Artificial Intelligence**.

Unlike simple expense trackers, this application doubles as an interactive **AI Algorithms Laboratory** and seamlessly integrates academic AI concepts into everyday financial management:
- **CO1, CO2, and CO4 in Daily Workflow:** Autonomous agent recommendations on the Dashboard, heuristic search roadmaps in Savings Goals, and forward-chaining rules with Monte Carlo risk simulation in the Budget Planner.
- **Dedicated Academic AI Algorithms Lab:** An educational workbench to compare BFS vs. Best-First Search traces, test agent counterfactuals with spending sliders, and inspect stochastic distribution quantiles.
- **100% Deterministic & Offline AI:** Mathematical agent cycles, state-space search with visited-node pruning, forward-chaining deduction, and seeded Monte Carlo stochastic simulations.
- **Strict Multi-Tenant Security:** Every user has an isolated workspace protected by bcrypt password hashing, JWT authentication stored in HttpOnly cookies, and strict server-side authorization.
- **Zero Hallucinated / Default Financial Data:** Fresh accounts open with clean, empty states. No fake transactions, budgets, or balances are generated automatically.
- **Bubblegum & Lace Design System:** A delightful, modern palette featuring Bubblegum Pink (`#FF5E97`), Sweet Mint (`#10B981`), Peach Lace (`#FB923C`), warm lace backgrounds (`#FFF9FA`), and high-contrast dark mode.
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

## ⚡ Integration of Course Outcomes (CO1, CO2, CO4, CO5) in Normal Workflow

Rather than existing only inside an isolated laboratory, CO1, CO2, CO4, and CO5 are integrated directly into the daily user workflow:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                            DAILY USER WORKFLOW AI INTEGRATION                               │
├──────────────────────────┬──────────────────────────┬───────────────────────┬───────────────┤
│     DASHBOARD (CO1)      │   SAVINGS GOALS (CO2)    │  BUDGET PLANNER (CO4) │ SPEND ML(CO5) │
├──────────────────────────┼──────────────────────────┼───────────────────────┼───────────────┤
│ • Auto & Manual Advice   │ • Goal Roadmap Generator │ • Real-Time Rule      │ • OLS Linear  │
│ • Active Goal Switcher   │ • Uninformed: BFS Plan   │   Engine Diagnostics  │   Regression  │
│ • Counterfactual Metrics │ • Informed: Best-First   │ • On-Demand Monte     │ • Next-Month  │
│ • 5-Stage Agent Pipeline │ • Preview in Goal Modal  │   Carlo Risk (N=1000) │   Forecast    │
│ • ML Spend Summary Card  │                          │                       │ • Holdout MAE │
└──────────────────────────┴──────────────────────────┴───────────────────────┴───────────────┘
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

### CO5: Machine Learning Spending Prediction on Dashboard & Dedicated View
- **Dashboard Spending Forecast Widget:** Displays predicted next-month expenditure, delta relative to recent month ($+₹\dots$ / $-₹\dots$), direction badge, and budget compliance status directly on the user's home screen.
- **Dedicated Spending Prediction Page (`/prediction`):**
  - **KPI Cards:** Next Month Predicted Expenses, Recent Actual Total, Variance (Rupees and %), Dataset Size ($n$ Months) and Goodness of Fit ($R^2$).
  - **Recharts Visualization:** Composed bar and line chart displaying verified historical expenses alongside the highlighted machine learning extrapolation.
  - **Chronological Holdout Model Evaluation:** Measures Mean Absolute Error (MAE) by training strictly on earlier months and evaluating on holdout un-seen months.
  - **Intelligent Budget Decision-Making:** Compares projected spending against active category budget limits, warning users in advance if an expenditure overrun is forecast.
  - **Explainable AI (XAI) & Disclaimer:** Plain-language interpretation with explicit mathematical disclosures ($y = mx + c$) and probabilistic disclaimers.

---

## 🔬 Academic Course Outcomes (CO1, CO2, CO4, CO5) in Dedicated AI Lab

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

### CO5: Machine Learning for Intelligent Decision-Making (Linear Regression)

#### Academic Relevance & Syllabus Mapping
Course Outcome 5 (CO5) states: **“Solve different machine learning techniques for the intelligent decision-making problems.”**
In FinIntel AI, this is achieved by modeling monthly personal financial expenditures as a continuous time-series regression task. The machine learning model identifies expenditure trajectories and produces an intelligent decision comparing expected next-month liabilities against monthly budget caps.

#### Why Linear Regression?
1. **Supervised Learning on Historical Records:** The model learns directly from ground-truth observed expenditure points $(x_i, y_i)$.
2. **Interpretable Closed-Form Analytic Solution:** Unlike black-box neural networks or stochastic gradient descent models, Ordinary Least Squares (OLS) has an exact closed-form solution with zero random variance.
3. **No External APIs or Cloud Dependencies:** 100% offline, privacy-preserving, and executed locally on the server/client without API keys or telemetry.
4. **Transparent Decision Boundary:** The slope $m$ directly quantifies whether spending is expanding ($m > 0$), contracting ($m < 0$), or steady ($m \approx 0$).

#### Mathematical Formulation (Ordinary Least Squares)
Given $n$ historical calendar month expense points $(x_0, y_0), (x_1, y_1), \dots, (x_{n-1}, y_{n-1})$ where:
- $x_i \in \{0, 1, \dots, n-1\}$ represents the chronological calendar month index.
- $y_i > 0$ represents the total recorded expense amount in Indian Rupees (₹) for month $x_i$.

The model fits the linear hypothesis:
$$\hat{y} = m \cdot x + c$$

The parameters are computed by minimizing the residual sum of squares:
$$S(m, c) = \sum_{i=0}^{n-1} (y_i - (m \cdot x_i + c))^2$$

Taking partial derivatives and solving the normal equations yields:
$$\bar{x} = \frac{1}{n}\sum_{i=0}^{n-1} x_i, \quad \bar{y} = \frac{1}{n}\sum_{i=0}^{n-1} y_i$$
$$SS_{xx} = \sum_{i=0}^{n-1} (x_i - \bar{x})^2, \quad SS_{xy} = \sum_{i=0}^{n-1} (x_i - \bar{x})(y_i - \bar{y}), \quad SS_{yy} = \sum_{i=0}^{n-1} (y_i - \bar{y})^2$$

The optimal slope $m$ and y-intercept $c$ are:
$$m = \frac{SS_{xy}}{SS_{xx}}, \quad c = \bar{y} - m \cdot \bar{x}$$

The next calendar month corresponds to index $x = n$:
$$\hat{y}_{\text{next}} = \max(0, m \cdot n + c)$$

#### Zero Variance and Boundary Safeguards
- **Zero Variance ($SS_{yy} = 0$):** When all observed monthly expenses are identical ($y_i = C$), $m = 0$ and $c = C$. The model accurately predicts $\hat{y} = C$ with $R^2 = 1.0$.
- **Non-Negative Expense Bound:** Since expenditures cannot be negative, predictions are clamped to $\max(0, \hat{y})$.
- **Strict Data Threshold ($n \ge 3$):** A minimum of 3 distinct monthly observations is strictly required before fitting. For $n < 3$, the system returns `hasEnoughData: false` with an explanatory message.

#### Model Evaluation: Chronological Holdout Validation & MAE
Standard $K$-fold cross-validation or random data splitting causes **lookahead bias / temporal data leakage** in time-series forecasting.
FinIntel AI implements a strict **chronological holdout split** when $n \ge 4$:
1. The earliest $k = n - 1$ or $n - 2$ months form the training set.
2. The remaining most recent observed months form the un-seen holdout test set.
3. The model is trained strictly on earlier months and evaluated on later months.
4. Generalization error is measured via **Mean Absolute Error (MAE)**:
$$\text{MAE} = \frac{1}{T} \sum_{j=1}^{T} |y_j - \hat{y}_j|$$
MAE is reported in Indian Rupees (₹), providing an intuitive measure of average prediction deviation.

#### Intelligent Decision-Making: Budget Comparison
The ML prediction is linked directly with personal financial governance:
- If $\hat{y}_{\text{next}} > \text{Budget}$: Emits an **Overrun Warning** indicating the estimated excess $(\hat{y}_{\text{next}} - \text{Budget})$ in ₹ and percentage. Recommends trimming discretionary spending.
- If $\hat{y}_{\text{next}} \le \text{Budget}$: Confirms **Budget Adherence** and calculates the projected surplus buffer $(\text{Budget} - \hat{y}_{\text{next}})$.
- If no budget is set: Informs the user that establishing a budget in Budget Planner unlocks automated variance comparisons.

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
│   ├── services/
│   │   └── linearRegressionService.ts # [CO5] OLS regression, holdout MAE, budget comparison
│   ├── routes/
│   │   ├── auth.ts              # /api/auth/register, /login, /logout, /me
│   │   ├── transactions.ts      # /api/transactions CRUD with user isolation
│   │   ├── budgets.ts           # /api/budgets CRUD with user isolation
│   │   ├── goals.ts             # /api/goals CRUD + /deposit and /withdraw actions
│   │   ├── user.ts              # /api/user/profile update
│   │   ├── data.ts              # /api/data/dev-seed, /export, /import
│   │   └── prediction.ts        # [CO5] /api/prediction/spending authenticated endpoint
│   └── tests/
│       ├── authAndIsolation.test.ts  # 19 automated integration tests (Supertest)
│       ├── comprehensiveSuite.test.ts# 25 full integration & security tests
│       └── linearRegression.test.ts  # [CO5] 14 machine learning & isolation tests
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
│   │   │   ├── DashboardView.tsx          # Master dashboard screen
│   │   │   ├── AdvisorSummaryCard.tsx     # [CO1] Live Agent Card with manual triggers
│   │   │   ├── PredictionSummaryWidget.tsx# [CO5] Spending forecast summary widget
│   │   │   └── BudgetOverviewWidget.tsx   # [CO4] Budget widget with rule alerts
│   │   ├── prediction/
│   │   │   └── SpendingPredictionView.tsx # [CO5] Full prediction dashboard & Recharts
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
│   │   ├── ai-lab/              # CO1, CO2, CO4, CO5 dedicated interactive panels
│   │   │   └── LinearRegressionPanel.tsx # [CO5] Interactive OLS regression lab
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
| `limit_amount` | REAL | NOT NULL CHECK(limit_amount >= 0) | Spending cap amount |
| `period` | TEXT | DEFAULT 'monthly' | Budget cycle period |
| `alert_threshold` | REAL | DEFAULT 80 | Threshold percentage for early warnings |
| `start_date` | TEXT | - | Period start date |
| `end_date` | TEXT | - | Period end date |
| `created_at` | TEXT | NOT NULL | ISO-8601 timestamp |
| `updated_at` | TEXT | NOT NULL | ISO-8601 timestamp |

#### 4. `savings_goals`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | TEXT | PRIMARY KEY | Unique goal ID |
| `user_id` | TEXT | NOT NULL, FK `users(id)` | Record owner |
| `title` | TEXT | NOT NULL | Milestone goal title |
| `target_amount` | REAL | NOT NULL CHECK(target_amount > 0) | Target savings amount |
| `current_amount`| REAL | DEFAULT 0 CHECK(current_amount >= 0) | Accumulated savings balance |
| `target_date` | TEXT | NOT NULL | Target deadline (YYYY-MM-DD) |
| `category` | TEXT | DEFAULT 'General' | Goal classification category |
| `icon` | TEXT | DEFAULT '🎯' | Emoji icon indicator |
| `color` | TEXT | DEFAULT '#34C759' | Hex color badge indicator |
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

### Spending Prediction Endpoints (CO5 Machine Learning)
- `GET /api/prediction/spending` — Authenticated endpoint returning Ordinary Least Squares Linear Regression next-month spending projection, chronological holdout MAE evaluation, and budget variance comparisons.
- Query Parameter (optional): `referenceDate=YYYY-MM-DD` (bounds training data to prevent future data leakage during simulations).

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

## 🧪 Automated Verification & Unit Test Suite (88 Tests)

The application includes **88 automated unit and integration tests** across six suites, running with deterministic file serialization (`--fileParallelism=false`) to ensure 100% reliable execution against the native SQLite database:

```bash
npm test
```

### Test Suite Breakdown:

#### 1. Comprehensive Verification Suite (`server/tests/comprehensiveSuite.test.ts` — 25 tests)
- **Section 3 Auth & Multi-Tenant Isolation:**
  - Registration rejection of invalid emails, short passwords, missing fields.
  - Multi-tenant registration for User A and User B with zero initial records.
  - Duplicate email collision rejection (`409 Conflict`).
  - Login failure on invalid password (`401 Unauthorized`) and success with JWT cookie.
  - User A creates ₹30,000 income, ₹2,500 expense, a Food budget, and an Emergency Reserve goal.
  - User B sees empty workspace and ZERO data belonging to User A.
  - Cross-user attacks (`PUT /api/transactions/:id`, `DELETE /api/budgets/:id`, `POST /api/goals/:id/withdraw` using User A IDs) are strictly rejected with `404 Not Found`.
  - User A re-authenticates and verifies data remains untouched.
- **Section 4 Exact Persistence & Edge Cases:**
  - Direct database queries confirm exact ₹30,000 income and ₹2,500 expense storage in SQLite (zero random overrides).
  - Net surplus calculation ($₹30,000 - ₹2,500 = ₹27,500$) and savings rate ($92\%$).
  - Decimal precision verification (paise normalization e.g. `₹1,234.567` $\rightarrow$ `₹1,234.57`).
  - High financial limits (e.g. ₹50,00,000 Lakhs/Crores).
  - Validation rejections for ₹0 and negative amounts (`400 Bad Request`).
  - Update and delete operations update database records and totals accurately.
- **Section 5 CO1 Intelligent Agent Pipeline:**
  - Stage 1 Perceive, Stage 2 Analyze, Stage 3 Decide, Stage 4 Act, Stage 5 Evaluate.
  - Counterfactual evaluation demonstrates simulated savings rate improvement without altering database records.
  - Seamless switching across all 4 agent goals (`avoid_budget_breach`, `reach_savings_goal`, `maintain_emergency_fund`, `reduce_discretionary`).
- **Section 6 CO2 Search Techniques on Savings Goals:**
  - Handles already achieved goal at root node (0 months, 1 state explored).
  - Handles ₹0 initial savings producing feasible monthly contribution sequences.
  - Safely reports unreachable goals within planning horizon.
  - Verifies BFS minimum-depth guarantee and Greedy Best-First Search heuristic distance $h(n) = \max(0, \text{Target} - S_n)$.
- **Section 7 CO4 Forward-Chaining Rules & Monte Carlo:**
  - Tests all 7 production rules individually against premises, conclusions, and actions.
  - Monte Carlo simulation verifies statistical quantiles ($P_{10} \le P_{50} \le P_{90}$) and probability bounds ($0\% - 100\%$).
  - Responds accurately to low-spending ($0\%$ breach) vs. high-spending ($100\%$ breach) scenarios.
  - Mulberry32 seeded pseudo-random generator produces $100\%$ deterministic reproducibility across consecutive runs.

#### 2. Workflow Integration: Normal Daily Workflow Tests (`src/tests/workflowIntegration.test.ts` — 11 tests)
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

#### 3. Academic AI Algorithms Lab Tests (`src/tests/aiAlgorithms.test.ts` — 12 tests)
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

#### 4. Backend Authentication, Multi-Tenant Isolation & Persistence (`server/tests/authAndIsolation.test.ts` — 19 tests)
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

#### 5. Financial Calculations & Cash Flow (`src/tests/financialCalculations.test.ts` — 7 tests)
- Income calculation sums only income transactions.
- Expense calculation sums only expense transactions.
- Goal deposits and withdrawals are accurately aggregated.
- Net savings formula correctly evaluates `Income - Expenses + Withdrawals - Deposits`.
- Health score evaluation behaves predictably on zero, low, and high savings.
- Currency formatter formats numbers with Indian grouping (`₹1,00,000.00`).
- AI Reasoning engine handles empty transaction facts safely without crashing.

#### 6. CO5 Machine Learning: Linear Regression & Isolation Tests (`server/tests/linearRegression.test.ts` — 14 tests)
- **1. Known Linear Trend Prediction:** Deterministic test with points $(0, 10000), (1, 12000), (2, 14000), (3, 16000)$ confirming $m=2000, c=10000, R^2=1.0$ and next-month prediction $\hat{y}_4 = 18000$.
- **2. Insufficient Observations Safeguard:** Verifies $n < 3$ returns `hasEnoughData: false` with explanatory guidance rather than generating misleading or overfitted extrapolations.
- **3. Zero-Variance Safety:** Confirms that constant historical expenses ($y_i = 15000$) yield $m = 0$, $c = 15000$, and exact prediction $15000$ without division-by-zero errors.
- **4. Missing Calendar Months:** Confirms distinct historical calendar months are aggregated chronologically without silently inventing fake records.
- **5. Income Transaction Exclusion:** Confirms `income` and `deposit` transactions are strictly excluded from expense training sets.
- **6. Future-Dated Transaction Exclusion:** Excludes transactions dated beyond reference date to prevent lookahead bias.
- **7. User-Specific Scope:** Authenticated User A's prediction trains strictly on User A's SQLite records.
- **8. Cross-Tenant Protection:** Confirms User B cannot view User A's predictions or transactions; User B sees 0 records and `hasEnoughData: false`.
- **9. Chronological Holdout Evaluation:** Validates time-ordered split ($n \ge 4$) training on earlier months and testing on holdout months without future data leakage.
- **10. MAE Precision:** Confirms Mean Absolute Error (MAE) calculation against manual ground truth.
- **11. Budget Overrun & Buffer Comparison:** Verifies warnings when projected expenses exceed active budget, and surplus buffer when within budget.
- **12. Graceful Absence of Budget:** Informs user when no category budget exists without crashing.
- **13. Empty Transaction History:** Empty accounts receive a clear, helpful informational message.
- **14. Unauthenticated Rejection:** Protects `/api/prediction/spending` endpoint against unauthenticated requests (`401 Unauthorized`).

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

### Step 1: Authentication, Exact Persistence & Multi-Tenant Isolation
1. Open `http://localhost:3000`. You will be directed to the **Login** screen.
2. Click **Create an account** and register **User A** (`alex@testbank.com`, password `Password123!`).
3. Notice that the dashboard opens in an **Empty State** with ₹0.00 Income, ₹0.00 Expenses, ₹0.00 Net Savings, and no transactions.
4. Click **+ Add Income** and record a Salary transaction:
   - Type: `Income`
   - Amount: `30000`
   - Category: `Salary`
   - Payment Mode: `Net Banking`
   - Description: `Primary Monthly Salary`
5. Observe the dashboard update instantly: Total Inflows **₹30,000.00**, Net Surplus **₹30,000.00**.
6. Click **+ Add Expense** and record an expense transaction:
   - Type: `Expense`
   - Amount: `2500`
   - Category: `Food`
   - Payment Mode: `UPI`
   - Description: `Weekly Groceries`
7. Observe the dashboard update: Total Inflows **₹30,000.00**, Outflows **₹2,500.00**, and Net Surplus **₹27,500.00**.
8. **Reload the page (`F5`).** Confirm that the amounts remain exactly **₹30,000.00** and **₹2,500.00** (no random changes or mock resets).
9. **Multi-Tenant Isolation Check:**
   - Click the **Logout** icon at the top right.
   - Register **User B** (`priya@testbank.com`, password `Password456!`).
   - Notice User B's dashboard is completely empty (₹0.00 balance, zero transactions). User A's data is completely invisible.
   - Log out and log back in as **User A** (`alex@testbank.com`). Verify all records and the ₹27,500 surplus remain perfectly preserved.

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
5. **CO5 Tab:** Review live regression parameters or switch to **Academic Viva Mode** to demonstrate manual OLS derivations, zero-variance handling, and chronological holdout MAE.

### Step 6: CO5 Machine Learning Spending Prediction & Intelligent Decision Demonstration
1. **Empty / Insufficient History Check:**
   - Log into a fresh account or view an account with fewer than 3 months of recorded expense data.
   - Click **Spending Prediction (CO5 ML)** in the navigation sidebar.
   - Observe the clear, helpful message: *"Insufficient Historical Data for ML Training"*.
   - Notice the progress bar showing how many months have been recorded vs. the 3-month requirement ($n < 3$), with mathematical reasoning explaining why 3 points are required for degrees of freedom ($df = n - 2 \ge 1$).
2. **Sufficient History & Prediction Check:**
   - Add expense transactions across 3 distinct calendar months (e.g. Jan 2026: ₹10,000, Feb 2026: ₹12,000, Mar 2026: ₹14,000).
   - Return to **Spending Prediction**:
     - The system fits the Ordinary Least Squares model ($m = 2000, c = 10000, R^2 = 1.0$).
     - The summary card displays the predicted next-month expenditure: **₹16,000**.
     - The variance card shows $+₹2,000 (+14.3\%)$ with an "Increasing Trend" badge.
     - The Recharts composed visualization clearly distinguishes solid historical bars from the purple projection marker.
3. **Model Evaluation via Chronological Holdout (MAE):**
   - Add a 4th month of expenses (e.g. Apr 2026: ₹16,000).
   - Observe the **Model Evaluation** card automatically activate: it trains on the first 3 months and tests on the un-seen 4th month.
   - It displays the Mean Absolute Error (MAE): `₹0.00` confirming that zero temporal data leakage occurred.
4. **Intelligent Financial Decision (Budget Comparison):**
   - In **Budget Planner**, set an overall monthly budget (e.g., ₹15,000).
   - Return to **Spending Prediction** to observe the real-time alert: *"Warning: Projected next-month expenses (₹16,000) exceed your monthly budget limit of ₹15,000 by ₹1,000 (7%)"*.
   - Adjust the budget to ₹20,000 and verify the status flips to: *"Healthy Margin: Projected expenses remain within your monthly budget, leaving a projected buffer of ₹4,000"*.
5. **AI Algorithms Lab Viva Testbench:**
   - Click **AI Algorithms Lab** $\rightarrow$ **CO5: ML Prediction**.
   - Switch to **Academic Demonstration / Viva Testbench**.
   - Toggle presets (Known Linear Trend, Zero Variance, Seasonal Variance) and inspect the step-by-step table displaying $\bar{x}, \bar{y}, SS_{xx}, SS_{xy}, SS_{yy}$, proving complete algorithmic transparency to academic examiners.

---

## 📄 License
This project was developed for educational and academic evaluation purposes.
