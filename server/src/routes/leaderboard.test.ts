import { describe, it, expect, mock } from 'bun:test'
import app from '../index'
import JwtService from '../lib/jwt'

// A flexible thenable mock chain to simulate Drizzle ORM queries
const mockChain = (resolvedValue: any) => {
  const chain: any = {
    from: () => chain,
    innerJoin: () => chain,
    where: () => chain,
    orderBy: () => chain,
    limit: () => chain,
    then: (resolve: any) => resolve(resolvedValue),
  }
  return chain
}

const mockLeaderboard = [
  {
    id: 'attempt-1',
    score: '5.00',
    timeTaken: 120,
    submittedAt: new Date(),
    status: 'SUBMITTED',
    user: { id: 'user-1', name: 'John Doe', avatarUrl: null },
    quiz: { id: 'quiz-1', title: 'JS Basics' },
  },
]

mock.module('../db', () => {
  return {
    db: {
      select: () => mockChain(mockLeaderboard),
    },
  }
})

describe('Leaderboard Router Endpoints', () => {
  it('GET /api/leaderboard - fails without auth token', async () => {
    const res = await app.request('/api/leaderboard', {
      method: 'GET',
    })

    expect(res.status).toBe(401)
  })

  it('GET /api/leaderboard - returns leaderboard rankings when authenticated', async () => {
    const token = await JwtService.sign({ userId: 'user-1', role: 'USER' })
    const res = await app.request('/api/leaderboard', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.leaderboard).toBeArray()
    expect(data.leaderboard[0].user.name).toBe('John Doe')
  })
})
