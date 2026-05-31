import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { Attempt, Quiz } from '@/types'

export interface PopulatedAttempt extends Attempt {
  quiz: Quiz | null
}

const useAttempt = () => {
  const queryClient = useQueryClient()

  const listQuery = useQuery({
    queryKey: ['attempts'],
    queryFn: async () => {
      const response = await api.get<{ attempts: PopulatedAttempt[] }>('/attempts')
      return response.data.attempts
    },
  })

  const startMutation = useMutation({
    mutationFn: async (quizId: string) => {
      const response = await api.post<{ attempt: Attempt; message: string }>('/attempts/start', {
        quizId,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attempts'] })
    },
  })

  const saveAnswerMutation = useMutation({
    mutationFn: async (payload: {
      attemptId: string;
      questionId: string;
      optionId: string | null;
    }) => {
      await api.put(`/attempts/${payload.attemptId}/answer`, {
        questionId: payload.questionId,
        optionId: payload.optionId,
      })
    },
  })

  const submitMutation = useMutation({
    mutationFn: async (payload: {
      attemptId: string;
      answers: { questionId: string; optionId: string | null }[];
    }) => {
      const response = await api.post<{ attempt: Attempt; message: string; results: any }>(
        `/attempts/${payload.attemptId}/submit`,
        { answers: payload.answers }
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attempts'] })
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
    },
  })

  return {
    attempts: listQuery.data || [],
    isAttemptsLoading: listQuery.isLoading,
    refetchAttempts: listQuery.refetch,
    startAttempt: startMutation.mutateAsync,
    isStarting: startMutation.isPending,
    saveAnswer: saveAnswerMutation.mutateAsync,
    submitAttempt: submitMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
  }
}

export default useAttempt
