import { Hono } from 'hono'
import { db } from '../db'
import { attempts, users, quizzes } from '../db/schema'
import { eq, desc, asc, and } from 'drizzle-orm'
import auth from '../middleware/auth'

const leaderboardRouter = new Hono()

leaderboardRouter.get('/', auth, async (c) => {
  const quizId = c.req.query('quizId')

  const queryBuilder = db
    .select({
      id: attempts.id,
      score: attempts.score,
      timeTaken: attempts.timeTaken,
      submittedAt: attempts.submittedAt,
      status: attempts.status,
      user: {
        id: users.id,
        name: users.name,
        avatarUrl: users.avatarUrl,
      },
      quiz: {
        id: quizzes.id,
        title: quizzes.title,
      },
    })
    .from(attempts)
    .innerJoin(users, eq(attempts.userId, users.id))
    .innerJoin(quizzes, eq(attempts.quizId, quizzes.id))

  let query
  if (quizId) {
    query = queryBuilder.where(
      and(eq(attempts.quizId, quizId), eq(attempts.status, 'SUBMITTED'))
    )
  } else {
    query = queryBuilder.where(eq(attempts.status, 'SUBMITTED'))
  }

  const list = await query.orderBy(desc(attempts.score), asc(attempts.timeTaken)).limit(20)

  return c.json({ leaderboard: list })
})

export default leaderboardRouter
