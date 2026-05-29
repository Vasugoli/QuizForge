import { Hono } from 'hono'
import { db } from '../db'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'
import HashService from '../lib/hash'
import JwtService from '../lib/jwt'
import AuthValidator from '../validators/auth'
import auth from '../middleware/auth'

const authRouter = new Hono<{
  Variables: {
    user: { userId: string; role: string }
  }
}>()

authRouter.post('/register', async (c) => {
  const body = await c.req.json()
  const result = AuthValidator.register.safeParse(body)
  if (!result.success) {
    const errorMsg = result.error.issues[0]?.message || 'Validation error'
    return c.json({ error: errorMsg }, 400)
  }

  const { name, email, password, avatarUrl } = result.data

  // Check unique email
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (existing.length > 0) {
    return c.json({ error: 'Email already registered' }, 400)
  }

  const hashedPassword = await HashService.hash(password)

  // First user registration is automatically ADMIN, next are USER
  const allUsersCount = await db.select().from(users).limit(1)
  const role = allUsersCount.length === 0 ? 'ADMIN' : 'USER'

  const [newUser] = await db
    .insert(users)
    .values({
      name,
      email,
      password: hashedPassword,
      avatarUrl,
      role,
    })
    .returning()

  const token = await JwtService.sign({ userId: newUser.id, role: newUser.role })

  return c.json(
    {
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatarUrl: newUser.avatarUrl,
        isBlocked: newUser.isBlocked,
      },
    },
    201
  )
})

authRouter.post('/login', async (c) => {
  const body = await c.req.json()
  const result = AuthValidator.login.safeParse(body)
  if (!result.success) {
    const errorMsg = result.error.issues[0]?.message || 'Validation error'
    return c.json({ error: errorMsg }, 400)
  }

  const { email, password } = result.data

  const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (!existingUser) {
    return c.json({ error: 'Invalid email or password' }, 401)
  }

  if (existingUser.isBlocked) {
    return c.json({ error: 'Your account has been blocked by an administrator' }, 403)
  }

  const matches = await HashService.compare(password, existingUser.password)
  if (!matches) {
    return c.json({ error: 'Invalid email or password' }, 401)
  }

  const token = await JwtService.sign({
    userId: existingUser.id,
    role: existingUser.role,
  })

  return c.json({
    token,
    user: {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
      role: existingUser.role,
      avatarUrl: existingUser.avatarUrl,
      isBlocked: existingUser.isBlocked,
    },
  })
})

authRouter.get('/me', auth, async (c) => {
  const contextUser = c.get('user')
  const [dbUser] = await db.select().from(users).where(eq(users.id, contextUser.userId)).limit(1)
  if (!dbUser) {
    return c.json({ error: 'User profile not found' }, 404)
  }

  if (dbUser.isBlocked) {
    return c.json({ error: 'Your account is blocked' }, 403)
  }

  return c.json({
    user: {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      avatarUrl: dbUser.avatarUrl,
      isBlocked: dbUser.isBlocked,
    },
  })
})

export default authRouter
