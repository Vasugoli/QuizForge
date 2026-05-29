import { describe, it, expect, mock } from 'bun:test'
import app from '../index'

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

mock.module('../db', () => {
  return {
    db: {
      select: () => mockChain([]), // Default behavior: no users found
      insert: () =>
        mockChain([
          {
            id: '1234-5678-90ab-cdef',
            name: 'Test User',
            email: 'test@example.com',
            password: 'hashed-password',
            role: 'ADMIN',
            isBlocked: false,
            avatarUrl: null,
            createdAt: new Date(),
          },
        ]),
    },
  }
})

describe('Auth Router Endpoints', () => {
  it('POST /api/auth/register - succeeds with valid inputs', async () => {
    const res = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      }),
    })

    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data).toHaveProperty('token')
    expect(data.user.name).toBe('Test User')
    expect(data.user.email).toBe('test@example.com')
    expect(data.user.role).toBe('ADMIN')
  })

  it('POST /api/auth/register - fails with validation error for short password', async () => {
    const res = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: '123',
      }),
    })

    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Password must be at least 6 characters')
  })

  it('POST /api/auth/login - fails with validation error for invalid email', async () => {
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'invalid-email',
        password: 'password123',
      }),
    })

    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Invalid email address')
  })

  it('GET /api/auth/me - blocks requests without token', async () => {
    const res = await app.request('/api/auth/me', {
      method: 'GET',
    })

    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data.error).toContain('Unauthorized')
  })
})
