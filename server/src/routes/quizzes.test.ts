import { describe, it, expect, mock } from 'bun:test'
import app from '@/index'
import JwtService from '@/lib/jwt'

// A flexible thenable mock chain to simulate Drizzle ORM queries
const mockChain = (resolvedValue: any) => {
  const chain: any = {
    from: () => chain,
    where: () => chain,
    limit: () => chain,
    values: () => chain,
    returning: () => {
      const returningChain: any = {
        then: (resolve: any) => resolve(resolvedValue),
      }
      return returningChain
    },
    then: (resolve: any) => resolve(resolvedValue),
  }
  return chain
}

const mockQuizzes = [
  {
    id: 'quiz-1',
    title: 'JavaScript Fundamentals',
    description: 'Basic JS constructs',
    category: 'Programming',
    difficulty: 'EASY',
    durationMinutes: 10,
    totalMarks: 10,
    isPublished: true,
  },
]

mock.module('../db', () => {
  return {
    db: {
      select: () => mockChain(mockQuizzes),
      insert: () => mockChain([mockQuizzes[0]]),
      delete: () => mockChain([]),
      update: () => mockChain([mockQuizzes[0]]),
    },
  }
})

describe('Quizzes Router Endpoints', () => {
  it('GET /api/quizzes - fails without authentication token', async () => {
    const res = await app.request('/api/quizzes', {
      method: 'GET',
    })

    expect(res.status).toBe(401)
  })

  it('GET /api/quizzes - returns quiz array when authenticated', async () => {
    const token = await JwtService.sign({ userId: 'user-1', role: 'USER' })
    const res = await app.request('/api/quizzes', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.quizzes).toBeArray()
    expect(data.quizzes[0].title).toBe('JavaScript Fundamentals')
  })

  it('POST /api/quizzes - blocks non-admin users from creating quiz', async () => {
    const token = await JwtService.sign({ userId: 'user-1', role: 'USER' })
    const res = await app.request('/api/quizzes', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'New HTML Quiz',
        durationMinutes: 15,
        totalMarks: 15,
      }),
    })

    expect(res.status).toBe(403)
  })
})
