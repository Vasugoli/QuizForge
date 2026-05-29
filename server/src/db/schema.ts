import { pgTable, uuid, text, integer, boolean, timestamp, decimal } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  role: text('role').default('USER').notNull(), // 'USER' | 'ADMIN'
  avatarUrl: text('avatar_url'),
  isBlocked: boolean('is_blocked').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const quizzes = pgTable('quizzes', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category'),
  difficulty: text('difficulty').default('MEDIUM').notNull(), // 'EASY' | 'MEDIUM' | 'HARD'
  durationMinutes: integer('duration_minutes').notNull(),
  totalMarks: integer('total_marks').notNull(),
  passMarks: integer('pass_marks'),
  negativeMarks: decimal('negative_marks', { precision: 3, scale: 2 }).default('0.00').notNull(),
  isPublished: boolean('is_published').default(false).notNull(),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const questions = pgTable('questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  quizId: uuid('quiz_id').references(() => quizzes.id, { onDelete: 'cascade' }).notNull(),
  text: text('text').notNull(),
  marks: integer('marks').default(1).notNull(),
  orderIndex: integer('order_index').default(0).notNull(),
})

export const options = pgTable('options', {
  id: uuid('id').primaryKey().defaultRandom(),
  questionId: uuid('question_id').references(() => questions.id, { onDelete: 'cascade' }).notNull(),
  text: text('text').notNull(),
  isCorrect: boolean('is_correct').default(false).notNull(),
})

export const attempts = pgTable('attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  quizId: uuid('quiz_id').references(() => quizzes.id).notNull(),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  submittedAt: timestamp('submitted_at'),
  score: decimal('score', { precision: 6, scale: 2 }),
  totalMarks: integer('total_marks'),
  timeTaken: integer('time_taken'), // in seconds
  status: text('status').default('IN_PROGRESS').notNull(), // 'IN_PROGRESS' | 'SUBMITTED' | 'TIMED_OUT'
})

export const answers = pgTable('answers', {
  id: uuid('id').primaryKey().defaultRandom(),
  attemptId: uuid('attempt_id').references(() => attempts.id, { onDelete: 'cascade' }).notNull(),
  questionId: uuid('question_id').references(() => questions.id).notNull(),
  optionId: uuid('option_id').references(() => options.id), // Null if skipped
  isCorrect: boolean('is_correct'),
  marksEarned: decimal('marks_earned', { precision: 4, scale: 2 }).default('0.00').notNull(),
})
