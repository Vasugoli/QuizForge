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
    orderBy: () => chain,
    innerJoin: () => chain,
    set: () => chain,
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

const mockUsers = [
  {
    id: 'user-1',
    name: 'Vasu Goli',
    email: 'vasu@test.com',
    role: 'USER',
    isBlocked: false,
    createdAt: new Date(),
  },
  {
    id: 'admin-1',
    name: 'Admin Forge',
    email: 'admin@test.com',
    role: 'ADMIN',
    isBlocked: false,
    createdAt: new Date(),
  },
]

const mockAttempts = [
  {
    id: 'attempt-1',
    userId: 'user-1',
    quizId: 'quiz-1',
    score: '8.00',
    totalMarks: 10,
    timeTaken: 120,
    status: 'SUBMITTED',
    submittedAt: new Date(),
  },
]

const mockQuizzes = [
  {
    id: 'quiz-1',
    title: 'HTML & CSS Intro',
    totalMarks: 10,
    passMarks: 5,
    difficulty: 'EASY',
    category: 'Programming',
  },
]

mock.module('../db', () => {
  return {
    db: {
      select: () => mockChain(mockUsers),
      insert: () => mockChain([{ id: 'question-1' }]),
      update: () => mockChain([{ id: 'user-1', isBlocked: true }]),
      transaction: (callback: any) => callback({
        insert: () => mockChain([{ id: 'question-2' }]),
        select: () => mockChain([]),
      }),
    },
  }
})

describe('Admin Router Endpoints', () => {
  it('GET /api/admin/analytics - blocks non-admins', async () => {
    const token = await JwtService.sign({ userId: 'user-1', role: 'USER' })
    const res = await app.request('/api/admin/analytics', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })

    expect(res.status).toBe(403)
  })

  it('GET /api/admin/analytics - returns platforms metrics for admin', async () => {
    const token = await JwtService.sign({ userId: 'admin-1', role: 'ADMIN' })
    const res = await app.request('/api/admin/analytics', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.metrics).toBeObject()
    expect(data.quizBreakdown).toBeArray()
  })

  it('GET /api/admin/users - returns users list for admin', async () => {
    const token = await JwtService.sign({ userId: 'admin-1', role: 'ADMIN' })
    const res = await app.request('/api/admin/users', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.users).toBeArray()
  })

  it('PUT /api/admin/users/:id/block - toggles blocking state', async () => {
    const token = await JwtService.sign({ userId: 'admin-1', role: 'ADMIN' })
    const res = await app.request('/api/admin/users/user-1/block', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    })

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.message).toBeString()
    expect(data.user.isBlocked).toBeTrue()
  })
})
