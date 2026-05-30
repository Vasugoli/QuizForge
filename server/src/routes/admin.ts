import { Hono } from 'hono'
import { db } from '../db'
import { users, quizzes, attempts, questions, options } from '../db/schema'
import { eq, and, not, desc } from 'drizzle-orm'
import auth from '../middleware/auth'
import adminGuard from '../middleware/adminGuard'

const adminRouter = new Hono<{
  Variables: {
    user: { userId: string; role: string }
  }
}>()

adminRouter.use('*', auth, adminGuard)

// 1. Get Platform Analytics
adminRouter.get('/analytics', async (c) => {
  const dbUsers = await db.select().from(users)
  const dbQuizzes = await db.select().from(quizzes)
  const dbAttempts = await db.select().from(attempts)

  const activeAttempts = dbAttempts.filter((a) => a.status === 'SUBMITTED' || a.status === 'TIMED_OUT')
  
  // Calculate aggregate stats
  const totalUsers = dbUsers.length
  const totalQuizzes = dbQuizzes.length
  const totalAttempts = dbAttempts.length

  const sumScores = activeAttempts.reduce((sum, a) => sum + parseFloat(a.score || '0'), 0)
  const avgScore = activeAttempts.length > 0 ? (sumScores / activeAttempts.length).toFixed(2) : '0.00'

  // Pass / Fail Ratio
  let passCount = 0
  let failCount = 0

  for (const att of activeAttempts) {
    const quiz = dbQuizzes.find((q) => q.id === att.quizId)
    const scoreVal = parseFloat(att.score || '0')
    const passMarks = quiz?.passMarks ?? (quiz ? quiz.totalMarks * 0.5 : 5)
    
    if (scoreVal >= passMarks) {
      passCount++
    } else {
      failCount++
    }
  }

  // Quiz-by-quiz performance breakdown
  const quizBreakdown = []
  for (const q of dbQuizzes) {
    const qAttempts = activeAttempts.filter((a) => a.quizId === q.id)
    const qSumScore = qAttempts.reduce((sum, a) => sum + parseFloat(a.score || '0'), 0)
    const qAvgScore = qAttempts.length > 0 ? (qSumScore / qAttempts.length).toFixed(2) : '0.00'
    
    quizBreakdown.push({
      id: q.id,
      title: q.title,
      category: q.category || 'General',
      difficulty: q.difficulty,
      attemptsCount: qAttempts.length,
      averageScore: qAvgScore,
      totalMarks: q.totalMarks,
    })
  }

  return c.json({
    metrics: {
      totalUsers,
      totalQuizzes,
      totalAttempts,
      averageScore: avgScore,
      passCount,
      failCount,
    },
    quizBreakdown,
  })
})

// 2. Get All Users (for block management)
adminRouter.get('/users', async (c) => {
  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isBlocked: users.isBlocked,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))

  return c.json({ users: allUsers })
})

// 3. Toggle User Block State
adminRouter.put('/users/:id/block', async (c) => {
  const userId = c.req.param('id')

  const [userRecord] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (!userRecord) {
    return c.json({ error: 'User not found' }, 404)
  }

  if (userRecord.role === 'ADMIN') {
    return c.json({ error: 'Forbidden: Admins cannot be blocked' }, 400)
  }

  const newBlockState = !userRecord.isBlocked

  const [updatedUser] = await db
    .update(users)
    .set({ isBlocked: newBlockState })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      isBlocked: users.isBlocked,
    })

  return c.json({
    message: newBlockState ? 'User successfully blocked' : 'User successfully unblocked',
    user: updatedUser,
  })
})

// 4. CSV Results Export
adminRouter.get('/export/:quizId', async (c) => {
  const quizId = c.req.param('quizId')

  const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId)).limit(1)
  if (!quiz) {
    return c.json({ error: 'Quiz not found' }, 404)
  }

  const quizAttempts = await db
    .select({
      id: attempts.id,
      score: attempts.score,
      timeTaken: attempts.timeTaken,
      status: attempts.status,
      submittedAt: attempts.submittedAt,
      user: {
        name: users.name,
        email: users.email,
      },
    })
    .from(attempts)
    .innerJoin(users, eq(attempts.userId, users.id))
    .where(and(eq(attempts.quizId, quizId), not(eq(attempts.status, 'IN_PROGRESS'))))

  // Construct CSV String
  let csvContent = 'Name,Email,Score,Total Marks,Time Taken (seconds),Status,Submitted At\n'
  for (const att of quizAttempts) {
    const name = `"${att.user.name.replace(/"/g, '""')}"`
    const email = `"${att.user.email.replace(/"/g, '""')}"`
    const score = att.score || '0.00'
    const totalMarks = quiz.totalMarks
    const timeTaken = att.timeTaken || 0
    const status = att.status
    const submittedAt = att.submittedAt ? new Date(att.submittedAt).toISOString() : 'N/A'
    
    csvContent += `${name},${email},${score},${totalMarks},${timeTaken},${status},${submittedAt}\n`
  }

  c.header('Content-Type', 'text/csv')
  c.header('Content-Disposition', `attachment; filename="results-${quiz.title.toLowerCase().replace(/\s+/g, '-')}.csv"`)
  
  return c.text(csvContent)
})

// 5. Bulk Upload Questions
adminRouter.post('/questions/bulk', async (c) => {
  const body = await c.req.json()
  const { quizId, questions: uploadQuestions } = body

  if (!quizId || !Array.isArray(uploadQuestions) || uploadQuestions.length === 0) {
    return c.json({ error: 'Invalid parameters: quizId and non-empty questions array are required' }, 400)
  }

  const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId)).limit(1)
  if (!quiz) {
    return c.json({ error: 'Target quiz not found' }, 404)
  }

  try {
    const insertedCount = await db.transaction(async (tx) => {
      let qCount = 0
      for (const q of uploadQuestions) {
        if (!q.text || !Array.isArray(q.options) || q.options.length < 2) {
          throw new Error('Question must contain text and at least 2 options')
        }

        const [newQuestion] = await tx
          .insert(questions)
          .values({
            quizId,
            text: q.text,
            marks: q.marks ?? 1,
            orderIndex: qCount,
          })
          .returning()

        for (const opt of q.options) {
          await tx.insert(options).values({
            questionId: newQuestion.id,
            text: opt.text,
            isCorrect: !!opt.isCorrect,
          })
        }

        qCount++
      }
      return qCount
    })

    return c.json(
      {
        message: 'Bulk questions upload completed successfully',
        insertedCount,
      },
      201
    )
  } catch (err: any) {
    return c.json({ error: err.message || 'Transaction error during bulk questions seeding' }, 400)
  }
})

export default adminRouter
