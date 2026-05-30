import { create } from 'zustand'

export interface Question {
  id: string
  quizId: string
  text: string
  marks: number
  orderIndex: number
  options: {
    id: string
    text: string
  }[]
}

interface QuizSessionState {
  attemptId: string | null
  quizId: string | null
  quizTitle: string
  negativeMarks: string
  questions: Question[]
  answers: Record<string, string | null>
  timeLeft: number // in seconds
  isActive: boolean
  setSession: (
    attemptId: string,
    quizId: string,
    quizTitle: string,
    negativeMarks: string,
    questions: Question[],
    durationMinutes: number
  ) => void
  setAnswer: (questionId: string, optionId: string | null) => void
  tick: () => void
  clearSession: () => void
}

const quizSessionStore = create<QuizSessionState>((set) => ({
  attemptId: null,
  quizId: null,
  quizTitle: '',
  negativeMarks: '0.00',
  questions: [],
  answers: {},
  timeLeft: 0,
  isActive: false,

  setSession: (attemptId, quizId, quizTitle, negativeMarks, questions, durationMinutes) => {
    const initialAnswers: Record<string, string | null> = {}
    questions.forEach((q) => {
      initialAnswers[q.id] = null
    })
    set({
      attemptId,
      quizId,
      quizTitle,
      negativeMarks,
      questions,
      answers: initialAnswers,
      timeLeft: durationMinutes * 60,
      isActive: true,
    })
  },

  setAnswer: (questionId, optionId) =>
    set((state) => ({
      answers: {
        ...state.answers,
        [questionId]: optionId,
      },
    })),

  tick: () =>
    set((state) => {
      if (state.timeLeft <= 1) {
        return { timeLeft: 0, isActive: false }
      }
      return { timeLeft: state.timeLeft - 1 }
    }),

  clearSession: () =>
    set({
      attemptId: null,
      quizId: null,
      questions: [],
      answers: {},
      timeLeft: 0,
      isActive: false,
    }),
}))

export default quizSessionStore
