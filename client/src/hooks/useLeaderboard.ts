import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios'

export interface LeaderboardEntry {
  id: string
  score: string | null
  timeTaken: number | null
  submittedAt: string | null
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'TIMED_OUT'
  user: {
    id: string
    name: string
    avatarUrl: string | null
  }
  quiz: {
    id: string
    title: string
  }
}

const useLeaderboard = (quizId?: string) => {
  return useQuery({
    queryKey: ['leaderboard', quizId],
    queryFn: async () => {
      const url = quizId ? `/leaderboard?quizId=${quizId}` : '/leaderboard'
      const response = await api.get<{ leaderboard: LeaderboardEntry[] }>(url)
      return response.data.leaderboard
    },
  })
}

export default useLeaderboard
