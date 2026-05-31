# 🧠 QuizForge — Timed Online Quiz & Assessment Platform

[![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh)
[![React 19](https://img.shields.io/badge/React_19-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://react.dev)
[![Hono](https://img.shields.io/badge/Hono-%23E36026.svg?style=for-the-badge&logo=hono&logoColor=white)](https://hono.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Neon](https://img.shields.io/badge/Neon_DB-%2300E599.svg?style=for-the-badge&logo=neon&logoColor=black)](https://neon.tech)

A blazing-fast, robust, full-stack timed assessment platform featuring automated grading, negative marking, comprehensive participant dashboards, detailed admin consoles, and secure proctoring capabilities. Built using a high-performance modern stack: **React 19**, **Hono**, **Bun**, **Zustand**, and **TanStack React Query** over a **PostgreSQL** database managed with **Drizzle ORM**.

---

## 📌 Table of Contents

- [🎯 Project Objective](#-project-objective)
- [✨ Core Features](#-core-features)
  - [👤 Participant Workspace](#-participant-workspace)
  - [🛠️ Administrative Panel](#-administrative-panel)
  - [🛡️ Anti-Cheat & Security Operations](#%EF%B8%8F-anti-cheat--security-operations)
- [💻 Tech Stack](#-tech-stack)
- [🏗️ System Architecture](#%EF%B8%8F-system-architecture)
  - [1. Server-Client Topology](#1-server-client-topology)
  - [2. Client State Architecture](#2-client-state-architecture)
  - [3. Interactive Quiz Attempt Lifecycle](#3-interactive-quiz-attempt-lifecycle)
- [🗄️ Database Schema](#%EF%B8%8F-database-schema)
- [📂 Project Directory Layout](#-project-directory-layout)
- [🚀 Setup & Getting Started](#-setup--getting-started)
  - [Prerequisites](#prerequisites)
  - [Step 1: Clone the Repository](#step-1-clone-the-repository)
  - [Step 2: Environment Configuration](#step-2-environment-configuration)
  - [Step 3: Setup Dependencies](#step-3-setup-dependencies)
  - [Step 4: Establish the Database & Seed Mock Data](#step-4-establish-the-database--seed-mock-data)
  - [Step 5: Spin Up Development Servers](#step-5-spin-up-development-servers)
  - [Default Credentials](#default-credentials)
- [☁️ Migrating to Neon Cloud DB](#%EF%B8%8F-migrating-to-neon-cloud-db)
- [⚖️ Grading & Scoring Logic](#%EF%B8%8F-grading--scoring-logic)
- [📤 Bulk Question Formats](#-bulk-question-formats)
- [🔌 Full API Reference](#-full-api-reference)
- [🗺️ Future Development Roadmap](#%EF%B8%8F-future-development-roadmap)
- [📄 License](#-license)

---

## 🎯 Project Objective

Traditional digital testing tools often suffer from slow responses, layout failures, high hosting costs, and vulnerable scoring logic. **QuizForge** addresses these challenges by offering a fast, highly secure, and elegant web experience.

Developed as a premium solution for the **Round 2 Assignment Challenge** under the *Website Development* domain, QuizForge automates the entire assessment lifecycle:
- Dynamic quiz creation, categorization, and scaling.
- Seamless, secure user registration and role management.
- Real-time anti-cheat monitoring and synced countdown timers.
- Instant server-side grading, detailed results visualization, and leaderboard metrics.
- Comprehensive administrator analytics panels showing attempt trends and question analytics.

---

## ✨ Core Features

### 👤 Participant Workspace
* **Secure Authentication** — Token-based registration & login featuring state-synced JWT sessions.
* **Smart Quiz Explorer** — Interactive catalog enabling filtering and search by category, difficulty level (`EASY`, `MEDIUM`, `HARD`), and assessment duration.
* **Timed Quiz Engine** — High-precision timer that automatically commits and submits choices on expiration.
* **Real-time Performance Gauge** — Personal metrics dashboard displaying visual stats: total tests attempted, cumulative average score, accuracy metrics, and visual performance trend lines.
* **Interactive Attempt Records** — Detailed visual review of previous attempts highlighting chosen answers, skipped questions, and correct choices.
* **Live Leaderboards** — Real-time competition tables sorted globally or per-quiz, ordered dynamically by absolute score, then total speed (time taken).

### 🛠️ Administrative Panel
* **Comprehensive Metrics Console** — Admin dashboard summarizing cumulative platform indicators: total active assessments, total users, global attempts, and overall average scores.
* **Interactive Quiz & Question Builder** — Create, modify, publish, or delete quizzes with configuration options (negative marking parameters, passing scores, total marks, categories).
* **Question Bank Upload Console** — Add questions one-by-one or in batches using clean **CSV** or **JSON** files.
* **Participant Audit & Security Controls** — Block or restore accounts, audit individual user histories, and oversee attempt databases.
* **Advanced Analytics Dashboard** — Recharts-powered graphs analyzing pass/fail distribution, scores spread, attempt counts, and question difficulty indexes.
* **Exportable Data Sheets** — Instantly download quiz assessment attempts and performance data as standardized CSV sheets.

### 🛡️ Anti-Cheat & Security Operations
* **Tab-Switching Guard** — Detects when a participant leaves the active tab during a quiz, showing alert warnings and auto-submitting the attempt if a warning threshold is breached.
* **Integrity Control** — Context right-click menus, copy-paste inputs, and hotkey shortcuts are disabled inside the quiz screen.
* **Server-Validated Timers** — Quiz start and submission times are recorded server-side to prevent client-side timer manipulation.
* **Zero Data Leakage** — Correct answers and question keys are kept strictly in the database and omitted from the active quiz payload sent to the client, preventing inspection-based cheating.

---

## 💻 Tech Stack

### Frontend Client
| Technology | Description / Usage |
|---|---|
| **React 19** | Dynamic view components and optimized modern UI rendering. |
| **Vite** | Hyper-fast build system, ESModules loader, and Hot Module Replacement (HMR). |
| **TypeScript** | Strict compile-time type-safety across all components, API requests, and data models. |
| **Tailwind CSS v4** | Modern CSS-first design engine utilizing fluid layouts, variables, and responsive utility styling. |
| **shadcn/ui & Radix UI** | Accessible, unstyled primitives decorated with custom styles (Modals, Dialogs, Selects, Dropdowns). |
| **Zustand** | Snappy, lightweight client state stores for authorization tokens, timer states, and user preferences. |
| **TanStack React Query v5** | Declarative asynchronous server state sync, mutation triggers, caching, and auto-refetch handlers. |
| **React Router v7** | Single-Page Application client routing, protective auth filters, and route boundaries. |
| **React Hook Form + Zod** | Secure, schema-validated frontend forms (auth forms, quiz configs, question builders). |
| **Recharts** | Fluid, interactive SVG-based charts visualizing analytics data. |
| **Papa Parse** | Fast, browser-side CSV parser enabling instant file validation for bulk uploads. |

### Backend Server
| Technology | Description / Usage |
|---|---|
| **Bun v1.x** | Fast JavaScript engine, package manager, and local development runner. |
| **Hono** | Lightweight, high-performance web framework running natively on Bun's fast HTTP core. |
| **Drizzle ORM** | Type-safe, SQL-like ORM for PostgreSQL with migrations, relationship maps, and schemas. |
| **PostgreSQL** | Relational database (compatible with Supabase, Neon Cloud, or local engines). |
| **Jose** | Cryptographically secure JWT tokens utilizing signing algorithms. |
| **BcryptJS** | Secure cryptographic password hashing on registration and login checks. |

---

## 🏗️ System Architecture

### 1. Server-Client Topology
```mermaid
graph TD
    classDef client fill:#eef2ff,stroke:#6366f1,stroke-width:2px;
    classDef server fill:#fff7ed,stroke:#ea580c,stroke-width:2px;
    classDef db fill:#f0fdf4,stroke:#16a34a,stroke-width:2px;

    C[React Client]:::client -->|HTTPS REST Request| S[Hono API Server on Bun]:::server
    S -->|JWT Authentication Middleware| A[Route Handlers]:::server
    A -->|Drizzle ORM Queries| D[(PostgreSQL Database)]:::db
    D -->|Relational Data Rowsets| A
    A -->|JSON response payload| C
```

### 2. Client State Architecture
```mermaid
flowchart TD
    subgraph Zustand [Zustand Stores - Client-only State]
        A[Auth Store: Tokens & Active User Info]
        B[Quiz Session Store: Quiz ID, Active Option Maps, Real-time Countdown Timer]
        C[Theme Store: System preference theme syncing]
    end

    subgraph ReactQuery [React Query - Cached Server State]
        D[Quizzes Catalog Data]
        E[Leaderboard tables]
        F[Historical attempt records]
        G[Admin metrics analytics]
    end

    Zustand -->|Synchronizes client views| UI[Interactive React 19 UI Components]
    ReactQuery -->|Fetches & caches database records| UI
```

### 3. Interactive Quiz Attempt Lifecycle
```mermaid
sequenceDiagram
    autonumber
    actor User as Participant
    participant Client as React Client (Zustand & React Query)
    participant Server as Hono Backend Server
    participant DB as PostgreSQL Database

    User->>Client: Clicks "Start Assessment"
    Client->>Server: POST /api/attempts/start { quizId }
    Server->>DB: Insert into attempts (status = IN_PROGRESS, started_at = NOW)
    DB-->>Server: Return attemptId & started_at
    Server->>Client: Response 201 Created (attemptId)

    Client->>Server: GET /api/attempts/:attemptId/questions
    Server->>DB: Fetch questions and options (omitting correct options)
    DB-->>Server: Return sanitized questions payload
    Server->>Client: Response 200 OK (sanitized questions array)
    Note over Client: Zustand initializes countdown timer<br/>Disables context menus & copy/paste<br/>Sets up tab switch listeners

    loop Option Selection
        User->>Client: Selects an option
        Client->>Server: PUT /api/attempts/:attemptId/answer { questionId, optionId }
        Server->>DB: Save/update chosen option in answers table
        Server-->>Client: Response 200 OK
    end

    alt Tab Switching Violation (Count > 3) or Time Limit Reached
        Client->>Client: Trigger automatic submission
    else Normal Action
        User->>Client: Clicks "Submit Attempt"
    end

    Client->>Server: POST /api/attempts/:attemptId/submit
    Note over Server: Single DB transaction:<br/>1. Mark attempt status = SUBMITTED, submitted_at = NOW<br/>2. Retrieve correct options from database<br/>3. Calculate marks earned minus negative marking penalties<br/>4. Write final score, status, and duration
    Server->>DB: Commit submission status & final grades
    DB-->>Server: Success
    Server-->>Client: Response 200 OK (Submission completed)

    Client->>Client: Clear Zustand quiz state, reset anti-cheat listeners
    Client->>Server: GET /api/attempts/:attemptId/result
    Server->>DB: Query attempt details, selected answers, and correct statuses
    DB-->>Server: Complete attempt logs
    Server-->>Client: Response 200 OK (detailed results)
    Client->>User: Displays interactive Results Screen with detailed graphs
```

---

## 🗄️ Database Schema

Here is the underlying database schema representing the relational tables inside the system. Primary keys are configured as standard UUIDs with `gen_random_uuid()` to prevent ID guessing attacks.

```sql
-- 1. Users Table
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,              -- bcrypt cryptographic hash
  role        TEXT DEFAULT 'USER',        -- Role authorization: 'USER' | 'ADMIN'
  avatar_url  TEXT,
  is_blocked  BOOLEAN DEFAULT false,
  created_at  TIMESTAMP DEFAULT now()
);

-- 2. Quizzes Table
CREATE TABLE quizzes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  description      TEXT,
  category         TEXT,
  difficulty       TEXT DEFAULT 'MEDIUM',  -- Assessment level: 'EASY' | 'MEDIUM' | 'HARD'
  duration_minutes INT NOT NULL,
  total_marks      INT NOT NULL,
  pass_marks       INT,
  negative_marks   NUMERIC(3,2) DEFAULT 0, -- Penalty deduction, e.g. 0.25 per wrong answer
  is_published     BOOLEAN DEFAULT false,
  created_by       UUID REFERENCES users(id),
  created_at       TIMESTAMP DEFAULT now()
);

-- 3. Questions Table
CREATE TABLE questions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id     UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  marks       INT DEFAULT 1,
  order_index INT DEFAULT 0
);

-- 4. Options Table
CREATE TABLE options (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  is_correct  BOOLEAN DEFAULT false
);

-- 5. Quiz Attempts Table
CREATE TABLE attempts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id),
  quiz_id      UUID REFERENCES quizzes(id),
  started_at   TIMESTAMP DEFAULT now(),
  submitted_at TIMESTAMP,
  score        NUMERIC(6,2),
  total_marks  INT,
  time_taken   INT,                        -- Duration in seconds
  status       TEXT DEFAULT 'IN_PROGRESS'  -- Lifecycle status: 'IN_PROGRESS' | 'SUBMITTED' | 'TIMED_OUT'
);

-- 6. Individual Answers Table
CREATE TABLE answers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id   UUID REFERENCES attempts(id) ON DELETE CASCADE,
  question_id  UUID REFERENCES questions(id),
  option_id    UUID REFERENCES options(id),  -- Nullable if question is skipped
  is_correct   BOOLEAN,
  marks_earned NUMERIC(4,2) DEFAULT 0
);
```

---

## 📂 Project Directory Layout

The codebase is organized as a clean mono-repo structure split into frontend `client` and backend `server` folders:

```
QuizForge/
├── client/                           # React Single-Page Application (Vite-powered)
│   ├── src/
│   │   ├── api/                      # Axios HTTP Request Interfaces (called by React Query)
│   │   │   ├── auth.ts               # Login / Registration routes
│   │   │   ├── quizzes.ts            # Quiz exploration APIs
│   │   │   ├── attempts.ts           # Attempt execution flow endpoints
│   │   │   ├── leaderboard.ts        # Performance ranking queries
│   │   │   └── admin.ts              # Administrative CRUD & export interfaces
│   │   ├── components/
│   │   │   ├── ui/                   # Decoupled Tailwind UI primitives (shadcn/ui)
│   │   │   ├── quiz/                 # Attempt views, countdown progress bars, timers
│   │   │   ├── admin/                # Stats grids, analytics charts, CSV uploads
│   │   │   ├── leaderboard/          # Global scoreboard tables
│   │   │   └── shared/               # Universal Navbars, Sidebars, Route Protectors
│   │   ├── pages/
│   │   │   ├── auth/                 # Login & Registration views
│   │   │   ├── dashboard/            # Participant overview and analytics
│   │   │   ├── quizzes/              # Assessment directories & info detail guides
│   │   │   ├── results/              # Historical summaries & answers breakdown
│   │   │   ├── leaderboard/          # Visual rankings scoreboard
│   │   │   └── admin/                # Global configurations console
│   │   ├── store/                    # Zustand Store definitions
│   │   │   ├── authStore.ts          # Auth state manager (local-sync)
│   │   │   ├── quizSessionStore.ts   # Client-side timer & selected options map
│   │   │   └── themeStore.ts         # User interface light/dark settings
│   │   ├── hooks/                    # TanStack React Query custom hooks
│   │   ├── lib/                      # Base configurations (Axios clients, helpers)
│   │   ├── App.tsx                   # Central router definition
│   │   └── main.tsx                  # Client bootstrap script
│   ├── package.json                  # Frontend packages configuration
│   └── tsconfig.json                 # Client TypeScript specifications
│
├── server/                           # Backend Hono API Application (Bun-powered)
│   ├── src/
│   │   ├── index.ts                  # Application starter script & routes registration
│   │   ├── db/
│   │   │   ├── index.ts              # Drizzle PostgreSQL Client connector
│   │   │   └── schema.ts             # Relational data schema mappings
│   │   ├── middleware/
│   │   │   ├── auth.ts               # Jose JWT verify security filter
│   │   │   └── adminGuard.ts         # Admin role validation route protector
│   │   ├── routes/                   # Module routing endpoints
│   │   │   ├── auth.ts               # Registration, Login, and Profile APIs
│   │   │   ├── quizzes.ts            # Assessment configurations endpoints
│   │   │   ├── attempts.ts           # Timed attempt lifecycle controllers
│   │   │   ├── leaderboard.ts        # Ranking score aggregates
│   │   │   └── admin/                # Auditing, analytic data generators, CSV downloaders
│   │   ├── validators/               # Zod validation schemas
│   │   └── lib/                      # Cryptography wrappers & scoring formulas
│   ├── drizzle/                      # Autogenerated Drizzle database migrations
│   ├── drizzle.config.ts             # Drizzle configuration specs
│   └── package.json                  # Backend packages configuration
│
├── README.md                         # Main repository documentation
```

---

## 🚀 Setup & Getting Started

### Prerequisites
* **Bun Runtime** (v1.0+) installed on your machine. Install via:
  ```bash
  # macOS/Linux
  curl -fsSL https://bun.sh/install | bash

  # Windows (Powershell)
  powershell -c "irm bun.sh/install.ps1 | iex"
  ```
* **PostgreSQL Engine** (v15+) or a Cloud database instance hosted on [Neon](https://neon.tech) / [Supabase](https://supabase.com).

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/Vasugoli/QuizForge.git
cd QuizForge
```

---

### Step 2: Environment Configuration

Create a `.env` file in the root of the `server/` directory:

```bash
# Duplicate the template
cp server/.env.example server/.env
```

Modify the environment variables inside `server/.env` with your database credentials and configurations:

```env
# Relational Database Connection (Format for Local or Cloud DB)
DATABASE_URL="postgresql://postgres:password@localhost:5432/quizforge?sslmode=disable"

# Cryptographic JSON Web Token Security
JWT_SECRET="generate-a-strong-32-char-random-string-here"
JWT_EXPIRES_IN="7d"

# Server Port Configuration
PORT=5000

# CORS Whitelist Settings
FRONTEND_URL="http://localhost:5173"
```

> [!NOTE]
> The frontend client in `client/` is configured to connect to `http://localhost:5000/api` by default. If you run your server on a custom port or domain, you can configure it by creating a `client/.env` file with `VITE_API_URL="your-custom-url/api"`.

---

### Step 3: Setup Dependencies

Install packages in both directories using Bun:

```bash
# Install server dependencies
cd server
bun install

# Install client dependencies
cd ../client
bun install
```

---

### Step 4: Establish the Database & Seed Mock Data

Run the database migration and seeding scripts from the `server/` directory:

```bash
cd ../server

# Generate database tables in your database
bun run db:push

# Populate database with rich demo users, mock metrics, and sample quizzes
bun run db:seed
```

---

### Step 5: Spin Up Development Servers

Run the development command in separate terminal windows:

#### Terminal 1: Spin up Server API (`http://localhost:5000`)
```bash
cd server
bun run dev
```

#### Terminal 2: Spin up Client SPA (`http://localhost:5173`)
```bash
cd client
bun run dev
```

Open your browser and navigate to **`http://localhost:5173`** to test the platform.

---

### Default Credentials
After running the `bun run db:seed` script, you can log in immediately using these credentials:

| Role | Email | Password | Description |
|---|---|---|---|
| **Admin** | `admin@quizforge.dev` | `admin123` | Full administrative controls, builders, analytics, user lists. |
| **User** | `user@quizforge.dev` | `user123` | Participant profile, explore active quizzes, timers, leaderboards. |

---

## ☁️ Migrating to Neon Cloud DB

To move your storage from a local PostgreSQL database to your Cloud Neon Database:

1. **Get Connection String**: Copy your cloud connection URL from the Neon Console.
2. **Apply Connection Config**: Edit `server/.env` and replace `DATABASE_URL` with your Neon URL. Ensure it contains `?sslmode=require` at the end:
   ```env
   DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-glorious-water-a5e2abc9.us-east-2.aws.neon.tech/quizforge?sslmode=require"
   ```
3. **Synchronize Schema**: Build the tables on Neon using the push script:
   ```bash
   cd server
   bun run db:push
   ```
4. **Seed (Optional)**: Populates your cloud database with the default admin and initial sample quizzes:
   ```bash
   bun run db:seed
   ```

---

## ⚖️ Grading & Scoring Logic

QuizForge uses a secure server-side scoring algorithm to calculate participant grades. It supports **negative marking** per incorrect option to maintain strict grading guidelines:

$$\text{Final Score} = \max\Big(0, \ \ (\text{Correct Answers} \times \text{Marks per Question}) - (\text{Incorrect Answers} \times \text{Negative Marking Penalty})\Big)$$

* **No Negative Totals**: If incorrect answer penalties exceed correct answer marks, the score defaults to `0.00` to prevent negative totals.
* **Skipped Questions**: Skipped questions score `0` marks and do not trigger negative marking deductions.

### 📝 Example Walkthrough
Consider a quiz consisting of **10 questions** where each correct choice yields **1 mark**, and incorrect options carry a **0.25 mark penalty**.
* **Scenario**: A participant answers **8 questions correctly**, gets **2 questions incorrect**, and skips **0**.
* **Result Calculation**:
  $$\text{Correct Score} = 8 \times 1.00 = 8.00$$
  $$\text{Incorrect Penalty} = 2 \times 0.25 = 0.50$$
  $$\text{Final Grade} = 8.00 - 0.50 = 7.50\text{ out of }10.00\text{ marks}$$

---

## 📤 Bulk Question Formats

Admin users can batch-import large sets of questions into existing quizzes using either **CSV** or **JSON** configurations.

### 1. CSV Format
Create a spreadsheet formatted as shown below and save it as a standard `.csv` file. The headers must match exactly:

```csv
question_text,option_a,option_b,option_c,option_d,correct_option,marks
"Which HTML element is used for the largest heading?","<h6>","<head>","<h1>","<heading>","C",1
"Which programming language is typically used for client-side web scripting?","Python","Java","C++","JavaScript","D",2
"Which database uses Drizzle ORM natively?","MongoDB","Redis","PostgreSQL","Neo4j","C",1
```

> [!TIP]
> The `correct_option` field must correspond to a single uppercase character matching the correct choice: **`A`**, **`B`**, **`C`**, or **`D`**.

### 2. JSON Format
Upload a JSON file containing a structured array of questions:

```json
[
  {
    "text": "What is the correct declaration for a modern styling variable in Tailwind CSS v4?",
    "marks": 2,
    "options": [
      { "text": "@theme { --color-primary: #123456; }", "is_correct": true },
      { "text": "tailwind.config.js primary color override", "is_correct": false },
      { "text": "$primary-color: #123456;", "is_correct": false },
      { "text": "theme: { extend: { colors: ... } }", "is_correct": false }
    ]
  }
]
```

---

## 🔌 Full API Reference

### 1. Authentication Services — `/api/auth`
| Method | Endpoint | Description | Guard / Protection |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user account. | Public |
| `POST` | `/api/auth/login` | Log in and return a JWT access token. | Public |
| `GET` | `/api/auth/me` | Fetch active user credentials and role attributes. | JWT Verification |

### 2. Quiz Management — `/api/quizzes`
| Method | Endpoint | Description | Guard / Protection |
|---|---|---|---|
| `GET` | `/api/quizzes` | List published quizzes. | JWT Verification |
| `GET` | `/api/quizzes/:id` | Fetch the metadata and configuration details of a quiz. | JWT Verification |
| `POST` | `/api/quizzes` | Create a new quiz template config. | Admin Guard |
| `PATCH` | `/api/quizzes/:id` | Modify quiz configuration parameters. | Admin Guard |
| `DELETE` | `/api/quizzes/:id` | Remove a quiz and its questions from the database. | Admin Guard |
| `GET` | `/api/quizzes/:id/questions` | Fetch sanitized questions for an active quiz attempt. | JWT Verification |

### 3. Quiz Attempts Service — `/api/attempts`
| Method | Endpoint | Description | Guard / Protection |
|---|---|---|---|
| `POST` | `/api/attempts/start` | Start a new attempt session and record start time. | JWT Verification |
| `PUT` | `/api/attempts/:id/answer` | Persist or update the chosen option for a question. | JWT Verification |
| `POST` | `/api/attempts/:id/submit` | Submit the quiz session, score answers, and calculate results. | JWT Verification |
| `GET` | `/api/attempts/:id/result` | Fetch the graded result breakdown. | JWT Verification |
| `GET` | `/api/attempts` | Fetch the current user's past attempt records. | JWT Verification |

### 4. Competitive Leaderboards — `/api/leaderboard`
| Method | Endpoint | Description | Guard / Protection |
|---|---|---|---|
| `GET` | `/api/leaderboard` | Get global platform participant score rankings. | JWT Verification |
| `GET` | `/api/leaderboard?quizId=:id` | Get rankings for a specific quiz. | JWT Verification |

### 5. Administrative Dashboard Console — `/api/admin`
| Method | Endpoint | Description | Guard / Protection |
|---|---|---|---|
| `GET` | `/api/admin/users` | List all registered user accounts. | Admin Guard |
| `PATCH` | `/api/admin/users/:id/block` | Toggle user block status. | Admin Guard |
| `GET` | `/api/admin/analytics` | Fetch aggregated platform metrics and charts. | Admin Guard |
| `POST` | `/api/admin/questions/bulk` | Batch-upload questions using a JSON payload. | Admin Guard |
| `GET` | `/api/admin/export/:quizId` | Stream CSV records of quiz attempts. | Admin Guard |

---

## 🗺️ Future Development Roadmap

- [ ] **Multi-OAuth Integrations** — Enable quick login via Google and GitHub accounts.
- [ ] **Custom Assessment Invites** — Allow private quiz rooms with invite codes.
- [ ] **Automated Certificates** — PDF completion certificates signed by organizers.
- [ ] **Advanced Webcam Proctoring** — AI tab proctoring with periodic webcam snapshots.
- [ ] **Question-Specific Timers** — Restrict time limits per-question instead of per-quiz.
- [ ] **Audio/Visual Questions** — Support images and sound files in questions.

---

## 📄 License

Distributed under the **MIT License**. See standard licensing details within the repository for terms of use.

---

<p align="center">
  Built with 💖 for the Round 2 Assignment Challenge under the Website Development Domain.
</p>
