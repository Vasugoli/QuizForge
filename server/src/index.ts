import { Hono } from 'hono'
import { cors } from 'hono/cors'
import authRouter from './routes/auth'

const app = new Hono()

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

app.get('/', (c) => {
  return c.text('Hello QuizForge API!')
})

export default app
