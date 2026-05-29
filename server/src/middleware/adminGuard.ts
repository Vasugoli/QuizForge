import { createMiddleware } from 'hono/factory'

const adminGuard = createMiddleware<{
  Variables: {
    user: { userId: string; role: string }
  }
}>(async (c, next) => {
  const user = c.get('user')
  if (!user || user.role !== 'ADMIN') {
    return c.json({ error: 'Forbidden: Admin access required' }, 403)
  }
  await next()
})

export default adminGuard
