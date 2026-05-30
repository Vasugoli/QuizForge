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
