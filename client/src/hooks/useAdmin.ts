import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'

export interface AdminMetrics {
  totalUsers: number
  totalQuizzes: number
  totalAttempts: number
  averageScore: string
  passCount: number
  failCount: number
}

export interface QuizPerformance {
  id: string
  title: string
  category: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  attemptsCount: number
  averageScore: string
  totalMarks: number
}

export interface AdminAnalyticsData {
  metrics: AdminMetrics
  quizBreakdown: QuizPerformance[]
}

export interface AdminUserItem {
  id: string
  name: string
  email: string
  role: string
  isBlocked: boolean
  createdAt: string
}

export interface BulkUploadResponse {
  message: string
  insertedCount: number
}

const useAdmin = () => {
  const queryClient = useQueryClient()

  // 1. Platform Analytics Query
  const analyticsQuery = useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: async () => {
      const response = await api.get<AdminAnalyticsData>('/admin/analytics')
      return response.data
    },
  })

  // 2. Users Query
  const usersQuery = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const response = await api.get<{ users: AdminUserItem[] }>('/admin/users')
      return response.data.users
    },
  })

  // 3. Bulk Question Upload Mutation
  const bulkUploadMutation = useMutation({
    mutationFn: async (payload: {
      quizId: string
      questions: Array<{
        text: string
        marks?: number
        options: Array<{ text: string; isCorrect: boolean }>
      }>
    }) => {
      const response = await api.post<BulkUploadResponse>('/admin/questions/bulk', payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] })
    },
  })

  // 4. Toggle User Block Mutation
  const toggleBlockMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.put<{ message: string; user: any }>(`/admin/users/${userId}/block`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'analytics'] })
    },
  })

  // 5. CSV results export helper
  const exportResultsCSV = async (quizId: string, quizTitle: string) => {
    try {
      const response = await api.get(`/admin/export/${quizId}`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `results-${quizTitle.toLowerCase().replace(/\s+/g, '-')}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      throw new Error('Failed to export CSV results.', { cause: err })
    }
  }

  return {
    analytics: analyticsQuery.data || null,
    isAnalyticsLoading: analyticsQuery.isLoading,
    refetchAnalytics: analyticsQuery.refetch,

    users: usersQuery.data || [],
    isUsersLoading: usersQuery.isLoading,
    refetchUsers: usersQuery.refetch,

    bulkUpload: bulkUploadMutation.mutateAsync,
    isUploading: bulkUploadMutation.isPending,

    toggleUserBlock: toggleBlockMutation.mutateAsync,
    isTogglingBlock: toggleBlockMutation.isPending,

    exportResultsCSV,
  }
}

export default useAdmin
