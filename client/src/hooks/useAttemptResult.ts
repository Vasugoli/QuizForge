import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { Attempt, Quiz } from '@/types'

export interface AttemptBreakdownItem {
  question: {
    id: string
    quizId: string
    text: string
    marks: number
    createdAt: string
  }
  options: {
    id: string
    questionId: string
    text: string
    isCorrect: boolean
  }[]
  userAnswer: {
    id: string
    attemptId: string
    questionId: string
    optionId: string | null
    isCorrect: boolean
    marksEarned: string
    createdAt: string
  } | null
}

export interface AttemptResultData {
  attempt: Attempt
  quiz: Quiz
  breakdown: AttemptBreakdownItem[]
}

const useAttemptResult = (attemptId: string | null) => {
  return useQuery({
    queryKey: ['attempts', attemptId],
    queryFn: async () => {
      if (!attemptId) return null
      const response = await api.get<AttemptResultData>(`/attempts/${attemptId}/result`)
      return response.data
    },
    enabled: !!attemptId,
  })
}

export default useAttemptResult
