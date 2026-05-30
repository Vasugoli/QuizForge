import { z } from 'zod'

const AttemptValidator = {
  start: z.object({
    quizId: z.string().uuid('Invalid quiz ID format'),
  }),

  saveAnswer: z.object({
    questionId: z.string().uuid('Invalid question ID format'),
    optionId: z.string().uuid('Invalid option ID format').nullable().optional(),
  }),

  submit: z.object({
    answers: z
      .array(
        z.object({
          questionId: z.string().uuid('Invalid question ID format'),
          optionId: z.string().uuid('Invalid option ID format').nullable().optional(),
        })
      )
      .min(1, 'Submission must contain at least one answer record'),
  }),
}

export default AttemptValidator
