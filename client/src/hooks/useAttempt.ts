import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/axios'
import type { Attempt } from '../types'

const useAttempt = () => {
  const queryClient = useQueryClient()

  const startMutation = useMutation({
    mutationFn: async (quizId: string) => {
      const response = await api.post<{ attempt: Attempt; message: string }>('/attempts/start', {
        quizId,
      })
      return response.data
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
    },
  })

  return {
    startAttempt: startMutation.mutateAsync,
    isStarting: startMutation.isPending,
    saveAnswer: saveAnswerMutation.mutateAsync,
    submitAttempt: submitMutation.mutateAsync,
    isSubmitting: submitMutation.isPending,
  }
}

export default useAttempt
