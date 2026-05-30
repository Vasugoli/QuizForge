import { z } from 'zod'

const QuizValidator = {
  create: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional().nullable(),
    category: z.string().optional().nullable(),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
    durationMinutes: z.number().int().positive('Duration must be a positive integer'),
    totalMarks: z.number().int().positive('Total marks must be a positive integer'),
    passMarks: z.number().int().positive().optional().nullable(),
    negativeMarks: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid decimal format').default('0.00'),
    isPublished: z.boolean().default(false),
  }),

  update: z.object({
    title: z.string().min(3).optional(),
    description: z.string().optional().nullable(),
    category: z.string().optional().nullable(),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
    durationMinutes: z.number().int().positive().optional(),
    totalMarks: z.number().int().positive().optional(),
    passMarks: z.number().int().positive().optional().nullable(),
    negativeMarks: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
    isPublished: z.boolean().optional(),
  }),

  question: z.object({
    text: z.string().min(1, 'Question text is required'),
    marks: z.number().int().positive().default(1),
    orderIndex: z.number().int().nonnegative().default(0),
    options: z
      .array(
        z.object({
          text: z.string().min(1, 'Option text is required'),
          isCorrect: z.boolean().default(false),
        })
      )
      .min(2, 'At least 2 options are required'),
  }),
}

export default QuizValidator
