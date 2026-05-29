import { createMiddleware } from 'hono/factory'
import JwtService from '../lib/jwt'

const auth = createMiddleware<{
  Variables: {
    user: { userId: string; role: string }
  }
}>(async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: Missing or invalid token format' }, 401)
  }

  const token = authHeader.split(' ')[1]
  const payload = await JwtService.verify(token)
  if (!payload) {
    return c.json({ error: 'Unauthorized: Invalid token signature' }, 401)
  }

  c.set('user', payload)
  await next()
})

export default auth
