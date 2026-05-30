export interface User {
  id: string
  name: string
  email: string
  role: string
  avatarUrl?: string | null
  isBlocked: boolean
}

export interface Quiz {
  id: string
  title: string
  description?: string | null
  category?: string | null
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  durationMinutes: number
  totalMarks: number
  passMarks?: number | null
  negativeMarks: string
  isPublished: boolean
}

export interface Attempt {
  id: string
  userId: string
  quizId: string
  startedAt: string
  submittedAt?: string | null
  score?: string | null
  totalMarks?: number | null
  timeTaken?: number | null
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'TIMED_OUT'
}
