import { Hono } from 'hono'
import { db } from '../db'
import { quizzes, questions, options } from '../db/schema'
import { eq } from 'drizzle-orm'
import auth from '../middleware/auth'
import adminGuard from '../middleware/adminGuard'
import QuizValidator from '../validators/quiz'

const quizzesRouter = new Hono<{
  Variables: {
    user: { userId: string; role: string }
  }
}>()

// Apply authentication middleware to all quiz routes
quizzesRouter.use('*', auth)

// List all quizzes. If ADMIN, list all. If USER, only list published!
quizzesRouter.get('/', async (c) => {
  const user = c.get('user')
  let resultList
  if (user.role === 'ADMIN') {
    resultList = await db.select().from(quizzes)
  } else {
    resultList = await db.select().from(quizzes).where(eq(quizzes.isPublished, true))
  }
  return c.json({ quizzes: resultList })
})

// Get quiz detail by ID
quizzesRouter.get('/:id', async (c) => {
  const id = c.req.param('id')
  const user = c.get('user')

  const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, id)).limit(1)
  if (!quiz) {
    return c.json({ error: 'Quiz not found' }, 404)
  }

  if (user.role !== 'ADMIN' && !quiz.isPublished) {
    return c.json({ error: 'Forbidden: Quiz is not published' }, 403)
  }

  return c.json({ quiz })
})

// Create a new quiz (ADMIN only)
quizzesRouter.post('/', adminGuard, async (c) => {
  const user = c.get('user')
  const body = await c.req.json()
  const result = QuizValidator.create.safeParse(body)
  if (!result.success) {
    return c.json({ error: result.error.issues[0]?.message || 'Validation error' }, 400)
  }

  const [newQuiz] = await db
    .insert(quizzes)
    .values({
      ...result.data,
      createdBy: user.userId,
    })
    .returning()

  return c.json({ quiz: newQuiz }, 201)
})

// Update quiz details (ADMIN only)
quizzesRouter.patch('/:id', adminGuard, async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const result = QuizValidator.update.safeParse(body)
  if (!result.success) {
    return c.json({ error: result.error.issues[0]?.message || 'Validation error' }, 400)
  }

  const [existing] = await db.select().from(quizzes).where(eq(quizzes.id, id)).limit(1)
  if (!existing) {
    return c.json({ error: 'Quiz not found' }, 404)
  }

  const [updatedQuiz] = await db
    .update(quizzes)
    .set(result.data)
    .where(eq(quizzes.id, id))
    .returning()

  return c.json({ quiz: updatedQuiz })
})

// Delete quiz (ADMIN only)
quizzesRouter.delete('/:id', adminGuard, async (c) => {
  const id = c.req.param('id')
  const [existing] = await db.select().from(quizzes).where(eq(quizzes.id, id)).limit(1)
  if (!existing) {
    return c.json({ error: 'Quiz not found' }, 404)
  }

  await db.delete(quizzes).where(eq(quizzes.id, id))
  return c.json({ message: 'Quiz deleted successfully' })
})

// Get quiz questions for attempt. Hides option correct state if USER to prevent cheating!
quizzesRouter.get('/:id/questions', async (c) => {
  const id = c.req.param('id')
  const user = c.get('user')

  const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, id)).limit(1)
  if (!quiz) {
    return c.json({ error: 'Quiz not found' }, 404)
  }

  if (user.role !== 'ADMIN' && !quiz.isPublished) {
    return c.json({ error: 'Forbidden: Quiz is not published' }, 403)
  }

  // Fetch all questions for this quiz
  const dbQuestions = await db.select().from(questions).where(eq(questions.quizId, id))

  const quizQuestions = []
  for (const q of dbQuestions) {
    const dbOptions = await db.select().from(options).where(eq(options.questionId, q.id))

    // Scrub isCorrect value if user is not an administrator
    const sanitizedOptions = dbOptions.map((opt) => ({
      id: opt.id,
      text: opt.text,
      ...(user.role === 'ADMIN' ? { isCorrect: opt.isCorrect } : {}),
    }))

    quizQuestions.push({
      ...q,
      options: sanitizedOptions,
    })
  }

  return c.json({ questions: quizQuestions })
})

// Add question to quiz (ADMIN only)
quizzesRouter.post('/:id/questions', adminGuard, async (c) => {
  const quizId = c.req.param('id')
  const body = await c.req.json()
  const result = QuizValidator.question.safeParse(body)
  if (!result.success) {
    return c.json({ error: result.error.issues[0]?.message || 'Validation error' }, 400)
  }

  const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId)).limit(1)
  if (!quiz) {
    return c.json({ error: 'Quiz not found' }, 404)
  }

  const { text, marks, orderIndex, options: questionOptions } = result.data

  const newQuestionData = await db.transaction(async (tx) => {
    const [newQuestion] = await tx
      .insert(questions)
      .values({
        quizId,
        text,
        marks,
        orderIndex,
      })
      .returning()

    const newOptions = []
    for (const opt of questionOptions) {
      const [newOpt] = await tx
        .insert(options)
        .values({
          questionId: newQuestion.id,
          text: opt.text,
          isCorrect: opt.isCorrect,
        })
        .returning()
      newOptions.push(newOpt)
    }

    return {
      ...newQuestion,
      options: newOptions,
    }
  })

  return c.json({ question: newQuestionData }, 201)
})

export default quizzesRouter
