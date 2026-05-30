import { Hono } from 'hono'
import { cors } from 'hono/cors'
import authRouter from './routes/auth'
import quizzesRouter from './routes/quizzes'
import attemptsRouter from './routes/attempts'
import leaderboardRouter from './routes/leaderboard'
import adminRouter from './routes/admin'
import { logger } from 'hono/logger'

const app = new Hono()
app.use(logger());

app.use(
  '*',
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  })
)

app.route('/api/auth', authRouter)
app.route('/api/quizzes', quizzesRouter)
app.route('/api/attempts', attemptsRouter)
app.route('/api/leaderboard', leaderboardRouter)
app.route('/api/admin', adminRouter)

app.get('/', (c) => {
  return c.text('Hello QuizForge API!')
})


// export default {
//   port: 5000,
//   fetch: app.fetch
// }
export default app;
