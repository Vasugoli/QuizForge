# 🧠 QuizForge — Online Quiz & Assessment Platform

> A blazing-fast, full-stack MCQ-based assessment platform built with React, Hono, Bun, Zustand, and React Query. Designed for educators, trainers, and organizations to conduct secure, timed, and auto-graded quizzes at scale.

---

## 📌 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Bulk Question Upload Format](#bulk-question-upload-format)
- [Scoring Logic](#scoring-logic)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

**QuizForge** is a production-ready Online Quiz & Assessment Platform that automates the entire assessment lifecycle — from quiz creation and participant registration to real-time scoring, leaderboards, and admin analytics.

Built as a submission for the **Round 2 Assignment Challenge** under the *Website Development* domain.

### Problem It Solves

Traditional paper-based or spreadsheet-driven assessments are slow, error-prone, and impossible to scale. QuizForge replaces that with a digital-first experience — instant results, anti-cheat timers, bulk question management, and analytics dashboards — all accessible from any device.

---

## Features

### 👤 Participant Side
- **Secure Authentication** — JWT-based login and registration with bcrypt-hashed passwords
- **Quiz Discovery** — Browse and filter available quizzes by category, difficulty, and duration
- **Timed Quiz Engine** — Per-quiz countdown timer with auto-submit on expiry
- **Negative Marking Support** — Configurable penalty for wrong answers per quiz
- **Instant Results** — Score, rank, accuracy, and time-taken displayed immediately after submission
- **Attempt History** — View past quiz attempts with detailed answer breakdowns
- **Leaderboard** — Global and per-quiz leaderboards ranked by score, then time taken
- **Profile Dashboard** — Personal stats, average score, quiz history, and performance trend

### 🛠️ Admin Side
- **Admin Panel** — Protected dashboard to manage all platform data
- **Quiz Management** — Create, edit, publish, and archive quizzes with full configuration
- **Question Bank** — Add questions individually or via bulk CSV/JSON upload
- **Participant Management** — View all users, their attempts, scores, and block/unblock accounts
- **Analytics Dashboard** — Visual charts for attempt distribution, score trends, question-level difficulty analysis, and pass/fail rates
- **Result Export** — Download results per quiz as CSV

### ⚙️ Platform
- **Fully Responsive** — Optimized for desktop, tablet, and mobile
- **Dark Mode** — System-preference-aware dark/light theme toggle via shadcn/ui
- **Role-Based Access Control** — Separate `USER` and `ADMIN` roles with Hono middleware-protected routes
- **Anti-Cheat Measures** — Tab-switch detection, copy-paste disabled in quiz mode, timer synced with server
- **Optimistic UI** — React Query caching and Zustand for instant, snappy interactions

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| [React 19](https://react.dev) | UI framework |
| [Vite](https://vitejs.dev) | Build tool & dev server |
| [TypeScript](https://www.typescriptlang.org) | Type safety |
| [shadcn/ui](https://ui.shadcn.com) | Component library |
| [Tailwind CSS](https://tailwindcss.com) v4 | Styling |
| [Zustand](https://zustand-demo.pmnd.rs) | Client-side state management |
| [TanStack React Query](https://tanstack.com/query) | Server state, caching & data fetching |
| [React Router v7](https://reactrouter.com) | Client-side routing |
| [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) | Form handling & validation |
| [Recharts](https://recharts.org) | Analytics charts |
| [Lucide React](https://lucide.dev) | Icons |
| [Papa Parse](https://www.papaparse.com) | CSV parsing for bulk upload |

### Backend
| Technology | Purpose |
|---|---|
| [Bun](https://bun.sh) v1.x | JavaScript runtime & package manager |
| [Hono](https://hono.dev) | Web framework (runs natively on Bun) |
| [Drizzle ORM](https://orm.drizzle.team) | Type-safe ORM |
| [PostgreSQL](https://www.postgresql.org) | Primary database |
| [Zod](https://zod.dev) | Request validation |
| [Jose](https://github.com/panva/jose) | JWT signing & verification |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | Password hashing |

---

## System Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    FRONTEND (Vite + React)                │
│                                                          │
│  React Query ──► API calls (fetch)                       │
│  Zustand      ──► Auth state, quiz session, UI state     │
│  shadcn/ui    ──► Component library                      │
└──────────────────────────┬───────────────────────────────┘
                           │ HTTP REST (JSON)
                           │ Port 3001
┌──────────────────────────▼───────────────────────────────┐
│                  BACKEND (Hono on Bun)                    │
│                                                          │
│  /api/auth     ──► JWT auth middleware                   │
│  /api/quizzes  ──► Quiz CRUD                             │
│  /api/attempts ──► Quiz attempt lifecycle                │
│  /api/admin    ──► Admin-only routes (role guard)        │
└──────────────────────────┬───────────────────────────────┘
                           │ Drizzle ORM
┌──────────────────────────▼───────────────────────────────┐
│                      POSTGRESQL                           │
│  users · quizzes · questions · options · attempts ·      │
│  answers                                                  │
└──────────────────────────────────────────────────────────┘
```

### State Management Strategy

```
┌──────────────────────────────────────────────────────────┐
│                      STATE LAYERS                        │
├──────────────────────────────────────────────────────────┤
│  React Query  → Server state (quizzes, leaderboard,      │
│                 results) — cached, auto-refetched        │
├──────────────────────────────────────────────────────────┤
│  Zustand      → Client state (auth token, current user,  │
│                 active quiz session, timer, theme)       │
├──────────────────────────────────────────────────────────┤
│  Local State  → Form inputs, modal open/close,           │
│  (useState)     UI toggles                               │
└──────────────────────────────────────────────────────────┘
```

### Quiz Attempt Flow

```
User clicks "Start Quiz"
  → POST /api/attempts/start       (server locks start_time)
  → GET  /api/attempts/:id/questions
  → Zustand stores { attemptId, questions, answers, timer }
  → PUT  /api/attempts/:id/answer  (on each answer — React Query mutation)
  → POST /api/attempts/:id/submit  (on submit or timer expiry)
  → React Query invalidates leaderboard + attempt history
  → Navigate to /results/:attemptId
```

---

## Database Schema

```sql
-- Users
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,              -- bcrypt hashed
  role        TEXT DEFAULT 'USER',        -- 'USER' | 'ADMIN'
  avatar_url  TEXT,
  is_blocked  BOOLEAN DEFAULT false,
  created_at  TIMESTAMP DEFAULT now()
);

-- Quizzes
CREATE TABLE quizzes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  description      TEXT,
  category         TEXT,
  difficulty       TEXT DEFAULT 'MEDIUM',  -- 'EASY' | 'MEDIUM' | 'HARD'
  duration_minutes INT NOT NULL,
  total_marks      INT NOT NULL,
  pass_marks       INT,
  negative_marks   NUMERIC(3,2) DEFAULT 0, -- e.g. 0.25 per wrong answer
  is_published     BOOLEAN DEFAULT false,
  created_by       UUID REFERENCES users(id),
  created_at       TIMESTAMP DEFAULT now()
);

-- Questions
CREATE TABLE questions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id     UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  marks       INT DEFAULT 1,
  order_index INT DEFAULT 0
);

-- Options (answer choices per question)
CREATE TABLE options (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  is_correct  BOOLEAN DEFAULT false
);

-- Attempts (one row per user per quiz attempt)
CREATE TABLE attempts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id),
  quiz_id      UUID REFERENCES quizzes(id),
  started_at   TIMESTAMP DEFAULT now(),
  submitted_at TIMESTAMP,
  score        NUMERIC(6,2),
  total_marks  INT,
  time_taken   INT,                        -- seconds
  status       TEXT DEFAULT 'IN_PROGRESS'  -- 'IN_PROGRESS' | 'SUBMITTED' | 'TIMED_OUT'
);

-- Answers (one row per question per attempt)
CREATE TABLE answers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id   UUID REFERENCES attempts(id) ON DELETE CASCADE,
  question_id  UUID REFERENCES questions(id),
  option_id    UUID REFERENCES options(id),  -- NULL if skipped
  is_correct   BOOLEAN,
  marks_earned NUMERIC(4,2) DEFAULT 0
);
```

---

## Project Structure

```
quizforge/
├── frontend/                        # Vite + React app
│   ├── src/
│   │   ├── api/                     # API call functions (used by React Query)
│   │   │   ├── auth.ts
│   │   │   ├── quizzes.ts
│   │   │   ├── attempts.ts
│   │   │   ├── leaderboard.ts
│   │   │   └── admin.ts
│   │   ├── components/
│   │   │   ├── ui/                  # shadcn/ui auto-generated
│   │   │   ├── quiz/
│   │   │   │   ├── QuizCard.tsx
│   │   │   │   ├── QuizTimer.tsx
│   │   │   │   ├── QuestionCard.tsx
│   │   │   │   ├── ProgressBar.tsx
│   │   │   │   └── ResultSummary.tsx
│   │   │   ├── admin/
│   │   │   │   ├── StatsCard.tsx
│   │   │   │   ├── QuizForm.tsx
│   │   │   │   ├── QuestionForm.tsx
│   │   │   │   ├── BulkUploadModal.tsx
│   │   │   │   └── AnalyticsCharts.tsx
│   │   │   ├── leaderboard/
│   │   │   │   └── LeaderboardTable.tsx
│   │   │   └── shared/
│   │   │       ├── Navbar.tsx
│   │   │       ├── Sidebar.tsx
│   │   │       ├── ProtectedRoute.tsx
│   │   │       └── ThemeToggle.tsx
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   └── RegisterPage.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── DashboardPage.tsx
│   │   │   ├── quizzes/
│   │   │   │   ├── QuizzesPage.tsx       # Browse quizzes
│   │   │   │   ├── QuizDetailPage.tsx    # Info + start
│   │   │   │   └── QuizAttemptPage.tsx   # Timed attempt engine
│   │   │   ├── results/
│   │   │   │   ├── ResultsPage.tsx       # Attempt history
│   │   │   │   └── ResultDetailPage.tsx  # Full breakdown
│   │   │   ├── leaderboard/
│   │   │   │   └── LeaderboardPage.tsx
│   │   │   ├── profile/
│   │   │   │   └── ProfilePage.tsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboardPage.tsx
│   │   │       ├── AdminQuizzesPage.tsx
│   │   │       ├── AdminQuizFormPage.tsx
│   │   │       ├── AdminQuestionsPage.tsx
│   │   │       ├── AdminUsersPage.tsx
│   │   │       └── AdminAnalyticsPage.tsx
│   │   ├── store/                   # Zustand stores
│   │   │   ├── authStore.ts         # JWT token, current user, login/logout
│   │   │   ├── quizSessionStore.ts  # Active attempt, answers, timer state
│   │   │   └── themeStore.ts        # Dark/light mode
│   │   ├── hooks/                   # React Query hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useQuizzes.ts
│   │   │   ├── useAttempt.ts
│   │   │   ├── useLeaderboard.ts
│   │   │   └── useAdmin.ts
│   │   ├── lib/
│   │   │   ├── queryClient.ts       # TanStack Query client config
│   │   │   ├── axios.ts             # Axios instance with auth interceptor
│   │   │   └── utils.ts
│   │   ├── types/
│   │   │   └── index.ts             # Shared TypeScript interfaces
│   │   ├── App.tsx                  # Router setup
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── components.json              # shadcn config
│   └── package.json
│
├── backend/                         # Hono on Bun
│   ├── src/
│   │   ├── index.ts                 # Hono app entry, route mounting
│   │   ├── db/
│   │   │   ├── index.ts             # Drizzle client
│   │   │   └── schema.ts            # All table definitions
│   │   ├── middleware/
│   │   │   ├── auth.ts              # JWT verification middleware
│   │   │   └── adminGuard.ts        # Role = ADMIN check
│   │   ├── routes/
│   │   │   ├── auth.ts              # POST /register, /login, /me
│   │   │   ├── quizzes.ts           # Quiz CRUD
│   │   │   ├── questions.ts         # Question management
│   │   │   ├── attempts.ts          # Attempt lifecycle
│   │   │   ├── leaderboard.ts       # Leaderboard queries
│   │   │   └── admin/
│   │   │       ├── users.ts         # User management
│   │   │       ├── analytics.ts     # Analytics aggregations
│   │   │       ├── bulk.ts          # Bulk question upload
│   │   │       └── export.ts        # CSV export
│   │   ├── validators/
│   │   │   ├── auth.ts              # Zod schemas for auth
│   │   │   ├── quiz.ts
│   │   │   └── attempt.ts
│   │   └── lib/
│   │       ├── jwt.ts               # Sign & verify with jose
│   │       ├── hash.ts              # bcrypt helpers
│   │       └── score.ts             # Scoring calculation logic
│   ├── drizzle/
│   │   └── migrations/              # Auto-generated by drizzle-kit
│   ├── drizzle.config.ts
│   └── package.json
│
└── README.md
```

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.0+ — `curl -fsSL https://bun.sh/install | bash`
- [PostgreSQL](https://www.postgresql.org/download/) v15+ running locally or hosted ([Neon](https://neon.tech), [Supabase](https://supabase.com))

### 1. Clone the repository

```bash
git clone https://github.com/your-username/quizforge.git
cd quizforge
```

### 2. Install dependencies

```bash
# Backend
cd backend && bun install

# Frontend
cd ../frontend && bun install
```

### 3. Configure environment variables

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

See [Environment Variables](#environment-variables) for required values.

### 4. Set up the database

```bash
cd backend

# Push Drizzle schema to PostgreSQL
bun run db:push

# Seed with sample quizzes, questions, and admin user
bun run db:seed
```

### 5. Run the development servers

```bash
# Terminal 1 — Backend (Hono on Bun, port 3001)
cd backend && bun run dev

# Terminal 2 — Frontend (Vite, port 5173)
cd frontend && bun run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 6. Admin credentials (after seeding)

- **Email:** `admin@quizforge.dev`
- **Password:** `admin123`

---

## Environment Variables

### `backend/.env`

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/quizforge"

# JWT
JWT_SECRET="your-super-secret-32-char-string"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
FRONTEND_URL="http://localhost:5173"
```

### `frontend/.env`

```env
VITE_API_URL="http://localhost:3001/api"
```

---

## API Reference

### Auth — `/api/auth`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user | Public |
| `POST` | `/api/auth/login` | Login, returns JWT | Public |
| `GET` | `/api/auth/me` | Get current user | User |

### Quizzes — `/api/quizzes`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/quizzes` | List all published quizzes | User |
| `GET` | `/api/quizzes/:id` | Get quiz details | User |
| `POST` | `/api/quizzes` | Create quiz | Admin |
| `PATCH` | `/api/quizzes/:id` | Update quiz | Admin |
| `DELETE` | `/api/quizzes/:id` | Delete quiz | Admin |
| `GET` | `/api/quizzes/:id/questions` | Get questions for attempt | User |

### Attempts — `/api/attempts`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/attempts/start` | Start a new attempt | User |
| `PUT` | `/api/attempts/:id/answer` | Save a single answer | User |
| `POST` | `/api/attempts/:id/submit` | Submit attempt & get score | User |
| `GET` | `/api/attempts/:id/result` | Get full result breakdown | User |
| `GET` | `/api/attempts` | Get user's attempt history | User |

### Leaderboard — `/api/leaderboard`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/leaderboard` | Global leaderboard | User |
| `GET` | `/api/leaderboard?quizId=:id` | Per-quiz leaderboard | User |

### Admin — `/api/admin`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/admin/users` | List all users | Admin |
| `PATCH` | `/api/admin/users/:id/block` | Block/unblock user | Admin |
| `GET` | `/api/admin/analytics` | Platform analytics data | Admin |
| `POST` | `/api/admin/questions/bulk` | Bulk upload questions | Admin |
| `GET` | `/api/admin/export/:quizId` | Export results as CSV | Admin |

---

## Bulk Question Upload Format

**CSV format:**

```csv
question_text,option_a,option_b,option_c,option_d,correct_option,marks
"What is 2 + 2?","3","4","5","6","B",1
"Capital of France?","London","Berlin","Paris","Rome","C",1
```

**JSON format:**

```json
[
  {
    "text": "What is 2 + 2?",
    "marks": 1,
    "options": [
      { "text": "3", "is_correct": false },
      { "text": "4", "is_correct": true },
      { "text": "5", "is_correct": false },
      { "text": "6", "is_correct": false }
    ]
  }
]
```

---

## Scoring Logic

```
Final Score = (Correct Answers × Marks per Question)
            − (Wrong Answers × Negative Marking Value)

Minimum Score = 0  (score is never negative)
```

**Example:** 10 questions × 1 mark, negative marking = 0.25
- 8 correct, 2 wrong → `(8 × 1) − (2 × 0.25)` = **7.5 / 10**

---

## Roadmap

- [ ] Email notifications on quiz completion
- [ ] OAuth login (Google, GitHub)
- [ ] Quiz access codes for private quizzes
- [ ] PDF result certificates
- [ ] Question-level time limits
- [ ] Proctoring mode (webcam snapshot)

---

## License

MIT License © 2026 — Built for the Round 2 Assignment Challenge.
