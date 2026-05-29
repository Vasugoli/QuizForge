import { SignJWT, jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-default-super-secret-key-32-chars-long'
)

const JwtService = {
  async sign(payload: { userId: string; role: string }): Promise<string> {
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(process.env.JWT_EXPIRES_IN || '7d')
      .sign(SECRET)
  },

  async verify(token: string): Promise<{ userId: string; role: string } | null> {
    try {
      const { payload } = await jwtVerify(token, SECRET)
      return payload as { userId: string; role: string }
    } catch {
      return null
    }
  },
}

export default JwtService
