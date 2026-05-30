import { describe, it, expect, mock, beforeEach } from 'bun:test'
import app from '../index'
import JwtService from '../lib/jwt'

// A flexible thenable mock chain to simulate Drizzle ORM queries
const mockChain = (resolvedValue: any) => {
  const chain: any = {
    from: () => chain,
    where: () => chain,
    limit: () => chain,
    values: () => chain,
    set: () => chain, // Added to support update().set() operations
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

const mockQuiz = {
  id: '8b5cf612-7c3a-4eed-87c3-aed7c3aed7c3',
  title: 'CSS Tricks',
  negativeMarks: '0.25',
  durationMinutes: 10,
  totalMarks: 5,
  isPublished: true,
  userId: '8b5cf612-7c3a-4eed-87c3-aed7c3aed7c5', // Matches token userId!
}

const mockAttempt = {
  id: '8b5cf612-7c3a-4eed-87c3-aed7c3aed7c4',
  userId: '8b5cf612-7c3a-4eed-87c3-aed7c3aed7c5', // Matches token userId!
  quizId: '8b5cf612-7c3a-4eed-87c3-aed7c3aed7c3',
  status: 'IN_PROGRESS',
  startedAt: new Date(),
}

let selectCallCount = 0
let isSubmitTest = false

beforeEach(() => {
  selectCallCount = 0
  isSubmitTest = false
})

mock.module('../db', () => {
  return {
    db: {
      select: () => {
        selectCallCount++
        if (isSubmitTest) {
          const merged = {
            ...mockQuiz,
            ...mockAttempt,
            text: 'CSS Option text',
            isCorrect: true,
          }
          return mockChain([merged])
        } else {
          // For POST /start
          if (selectCallCount === 2) {
            return mockChain([])
          }
          return mockChain([mockQuiz])
        }
      },
      insert: () => mockChain([mockAttempt]),
      transaction: (callback: any) =>
        callback({
          select: () => mockChain([]),
          update: () =>
            mockChain([
              {
                id: '8b5cf612-7c3a-4eed-87c3-aed7c3aed7c4',
                status: 'SUBMITTED',
                score: '3.75',
              },
            ]),
          insert: () => mockChain([]),
        }),
    },
  }
})

describe('Attempts Router Endpoints', () => {
  it('POST /api/attempts/start - successfully creates attempt', async () => {
    isSubmitTest = false
    const token = await JwtService.sign({
      userId: '8b5cf612-7c3a-4eed-87c3-aed7c3aed7c5',
      role: 'USER',
    })
    const res = await app.request('/api/attempts/start', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        quizId: '8b5cf612-7c3a-4eed-87c3-aed7c3aed7c3',
      }),
    })

    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.attempt.status).toBe('IN_PROGRESS')
  })

  it('POST /api/attempts/:id/submit - scores attempt inside transaction', async () => {
    isSubmitTest = true
    const token = await JwtService.sign({
      userId: '8b5cf612-7c3a-4eed-87c3-aed7c3aed7c5',
      role: 'USER',
    })
    const res = await app.request(
      '/api/attempts/8b5cf612-7c3a-4eed-87c3-aed7c3aed7c4/submit',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: [
            {
              questionId: '8b5cf612-7c3a-4eed-87c3-aed7c3aed7c6',
              optionId: '8b5cf612-7c3a-4eed-87c3-aed7c3aed7c7',
            },
          ],
        }),
      }
    )

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.attempt.status).toBe('SUBMITTED')
  })
})
