import { Hono } from 'hono'
import { db } from '../db'
import { attempts, quizzes, questions, options, answers } from '../db/schema'
import { eq, and } from 'drizzle-orm'
import auth from '../middleware/auth'
import AttemptValidator from '../validators/attempt'
import calculateScore from '../lib/score'

const attemptsRouter = new Hono<{
  Variables: {
    user: { userId: string; role: string }
  }
}>()

attemptsRouter.use('*', auth)

// 1. Start a new attempt
attemptsRouter.post('/start', async (c) => {
  const user = c.get('user')
  const body = await c.req.json()
  const result = AttemptValidator.start.safeParse(body)
  if (!result.success) {
    return c.json({ error: result.error.issues[0]?.message || 'Validation error' }, 400)
  }

  const { quizId } = result.data

  const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId)).limit(1)
  if (!quiz) {
    return c.json({ error: 'Quiz not found' }, 404)
  }

  if (!quiz.isPublished && user.role !== 'ADMIN') {
    return c.json({ error: 'Cannot attempt an unpublished quiz' }, 403)
  }

  // Check if there is an existing in-progress attempt for this user on this quiz
  const [existingInProgress] = await db
    .select()
    .from(attempts)
    .where(
      and(
        eq(attempts.userId, user.userId),
        eq(attempts.quizId, quizId),
        eq(attempts.status, 'IN_PROGRESS')
      )
    )
    .limit(1)

  if (existingInProgress) {
    return c.json({
      message: 'Resuming active attempt',
      attempt: existingInProgress,
    })
  }

  const [newAttempt] = await db
    .insert(attempts)
    .values({
      userId: user.userId,
      quizId,
      status: 'IN_PROGRESS',
    })
    .returning()

  return c.json(
    {
      message: 'Attempt started successfully',
      attempt: newAttempt,
    },
    201
  )
})

// 2. Save intermediate answer
attemptsRouter.put('/:id/answer', async (c) => {
  const attemptId = c.req.param('id')
  const user = c.get('user')
  const body = await c.req.json()

  const result = AttemptValidator.saveAnswer.safeParse(body)
  if (!result.success) {
    return c.json({ error: result.error.issues[0]?.message || 'Validation error' }, 400)
  }

  const { questionId, optionId } = result.data

  const [attempt] = await db.select().from(attempts).where(eq(attempts.id, attemptId)).limit(1)
  if (!attempt) {
    return c.json({ error: 'Attempt record not found' }, 404)
  }

  if (attempt.userId !== user.userId) {
    return c.json({ error: 'Forbidden: You do not own this attempt' }, 403)
  }

  if (attempt.status !== 'IN_PROGRESS') {
    return c.json({ error: 'Cannot save answers on an inactive or finalized attempt' }, 400)
  }

  const [question] = await db
    .select()
    .from(questions)
    .where(and(eq(questions.id, questionId), eq(questions.quizId, attempt.quizId)))
    .limit(1)

  if (!question) {
    return c.json({ error: 'Question does not belong to this quiz assessment' }, 400)
  }

  // Upsert the answer
  const [existingAnswer] = await db
    .select()
    .from(answers)
    .where(and(eq(answers.attemptId, attemptId), eq(answers.questionId, questionId)))
    .limit(1)

  if (existingAnswer) {
    await db
      .update(answers)
      .set({ optionId })
      .where(eq(answers.id, existingAnswer.id))
  } else {
    await db.insert(answers).values({
      attemptId,
      questionId,
      optionId,
    })
  }

  return c.json({ message: 'Answer saved successfully' })
})

// 3. Finalize and Submit Attempt
attemptsRouter.post('/:id/submit', async (c) => {
  const attemptId = c.req.param('id')
  const user = c.get('user')
  const body = await c.req.json()

  const result = AttemptValidator.submit.safeParse(body)
  if (!result.success) {
    return c.json({ error: result.error.issues[0]?.message || 'Validation error' }, 400)
  }

  const { answers: submittedAnswers } = result.data

  const [attempt] = await db.select().from(attempts).where(eq(attempts.id, attemptId)).limit(1)
  if (!attempt) {
    return c.json({ error: 'Attempt not found' }, 404)
  }

  if (attempt.userId !== user.userId) {
    return c.json({ error: 'Forbidden' }, 403)
  }

  if (attempt.status !== 'IN_PROGRESS') {
    return c.json({ error: 'Quiz has already been finalized' }, 400)
  }

  const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, attempt.quizId)).limit(1)
  if (!quiz) {
    return c.json({ error: 'Associated quiz not found' }, 404)
  }

  // Server time-tampering limit validation
  const now = new Date()
  const startedAt = new Date(attempt.startedAt)
  const elapsedSeconds = Math.round((now.getTime() - startedAt.getTime()) / 1000)
  const allowedSeconds = quiz.durationMinutes * 60 + 15 // 15s grace window

  let status: 'SUBMITTED' | 'TIMED_OUT' = 'SUBMITTED'
  if (elapsedSeconds > allowedSeconds) {
    status = 'TIMED_OUT'
  }

  const dbQuestions = await db.select().from(questions).where(eq(questions.quizId, quiz.id))

  const questionIds = dbQuestions.map((q) => q.id)
  const dbOptions: { id: string; questionId: string; text: string; isCorrect: boolean }[] = []
  for (const qId of questionIds) {
    const opts = await db.select().from(options).where(eq(options.questionId, qId))
    dbOptions.push(...opts)
  }

  const mappedAnswers = submittedAnswers.map((ans) => ({
    questionId: ans.questionId,
    optionId: ans.optionId ?? null,
  }))

  const scoreDetails = calculateScore(
    quiz.negativeMarks,
    dbQuestions,
    dbOptions,
    mappedAnswers
  )

  const finalizedAttempt = await db.transaction(async (tx) => {
    // Write choice responses atomically
    for (const ans of submittedAnswers) {
      const [existing] = await tx
        .select()
        .from(answers)
        .where(and(eq(answers.attemptId, attemptId), eq(answers.questionId, ans.questionId)))
        .limit(1)

      const opt = dbOptions.find((o) => o.id === ans.optionId)
      const isCorrect = opt ? opt.isCorrect : false
      const q = dbQuestions.find((qu) => qu.id === ans.questionId)

      let marksEarned = '0.00'
      if (ans.optionId) {
        if (isCorrect && q) {
          marksEarned = q.marks.toFixed(2)
        } else {
          marksEarned = (-parseFloat(quiz.negativeMarks)).toFixed(2)
        }
      }

      if (existing) {
        await tx
          .update(answers)
          .set({ optionId: ans.optionId, isCorrect, marksEarned })
          .where(eq(answers.id, existing.id))
      } else {
        await tx.insert(answers).values({
          attemptId,
          questionId: ans.questionId,
          optionId: ans.optionId,
          isCorrect,
          marksEarned,
        })
      }
    }

    // Update attempt details
    const [updatedAttempt] = await tx
      .update(attempts)
      .set({
        status,
        score: scoreDetails.score,
        timeTaken: Math.min(elapsedSeconds, quiz.durationMinutes * 60),
        submittedAt: now,
        totalMarks: quiz.totalMarks,
      })
      .where(eq(attempts.id, attemptId))
      .returning()

    return updatedAttempt
  })

  return c.json({
    message: status === 'TIMED_OUT' ? 'Quiz attempt timed out' : 'Quiz submitted successfully',
    attempt: finalizedAttempt,
    results: scoreDetails,
  })
})

// 4. View Attempt Details & Full Grading Breakdown
attemptsRouter.get('/:id/result', async (c) => {
  const attemptId = c.req.param('id')
  const user = c.get('user')

  const [attempt] = await db.select().from(attempts).where(eq(attempts.id, attemptId)).limit(1)
  if (!attempt) {
    return c.json({ error: 'Attempt not found' }, 404)
  }

  if (attempt.userId !== user.userId && user.role !== 'ADMIN') {
    return c.json({ error: 'Forbidden: You do not own this attempt record' }, 403)
  }

  const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, attempt.quizId)).limit(1)
  const dbQuestions = await db.select().from(questions).where(eq(questions.quizId, attempt.quizId))
  const dbAnswers = await db.select().from(answers).where(eq(answers.attemptId, attemptId))

  const answersBreakdown = []
  for (const q of dbQuestions) {
    const dbOptions = await db.select().from(options).where(eq(options.questionId, q.id))
    const userAns = dbAnswers.find((a) => a.questionId === q.id)

    answersBreakdown.push({
      question: q,
      options: dbOptions,
      userAnswer: userAns || null,
    })
  }

  return c.json({
    attempt,
    quiz,
    breakdown: answersBreakdown,
  })
})

// 5. Get List of User's Past Attempts
attemptsRouter.get('/', async (c) => {
  const user = c.get('user')
  const userAttempts = await db.select().from(attempts).where(eq(attempts.userId, user.userId))

  const populatedAttempts = []
  for (const att of userAttempts) {
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, att.quizId)).limit(1)
    populatedAttempts.push({
      ...att,
      quiz: quiz || null,
    })
  }

  return c.json({ attempts: populatedAttempts })
})

export default attemptsRouter
