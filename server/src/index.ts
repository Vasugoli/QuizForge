import { Hono } from 'hono'
import { cors } from 'hono/cors'
import authRouter from './routes/auth'
import quizzesRouter from './routes/quizzes'
import attemptsRouter from './routes/attempts'
import leaderboardRouter from './routes/leaderboard'
import adminRouter from './routes/admin'
import { logger } from 'hono/logger'
import { db } from './db'
import { sql } from 'drizzle-orm'

const app = new Hono()
app.use(logger());

app.use(
  '*',
  cors({
    origin: Bun.env.FRONTEND_URL || 'http://localhost:5173',
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  })
)

app.get('/', (c) => {
  return c.text('Hello QuizForge API!')
})
app.get("/health", async (c) => {
  try {
    await db.execute(sql`SELECT 1`);
    return c.json({
      status: "success",
      message: "QuizForge API is running",
      timestamp: new Date().toISOString(),
      dbStatus: "connected",
    })
  } catch (error) {
    return c.json({
      status: "error",
      message: "QuizForge API is running but database is unreachable",
      timestamp: new Date().toISOString(),
      dbStatus: "disconnected",
    }, 500)
  }
})

app.route('/api/auth', authRouter)
app.route('/api/quizzes', quizzesRouter)
app.route('/api/attempts', attemptsRouter)
app.route('/api/leaderboard', leaderboardRouter)
app.route('/api/admin', adminRouter)
// Assign the port to the Hono app instance so Bun's auto-serve mechanism uses port 5000
const server = Object.assign(app, { port: 5000 })

export default server
