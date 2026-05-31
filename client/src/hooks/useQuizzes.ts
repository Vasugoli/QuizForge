import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { Quiz } from '@/types'

const useQuizzes = () => {
  const queryClient = useQueryClient()

  const listQuery = useQuery({
    queryKey: ['quizzes'],
    queryFn: async () => {
      const response = await api.get<{ quizzes: Quiz[] }>('/quizzes')
      return response.data.quizzes
    },
  })

  const createMutation = useMutation({
    mutationFn: async (newQuiz: Omit<Quiz, 'id' | 'isPublished'>) => {
      const response = await api.post<{ quiz: Quiz }>('/quizzes', newQuiz)
      return response.data.quiz
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] })
    },
  })

  return {
    quizzes: listQuery.data || [],
    isLoading: listQuery.isLoading,
    error: listQuery.error,
    createQuiz: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  }
}

export default useQuizzes
