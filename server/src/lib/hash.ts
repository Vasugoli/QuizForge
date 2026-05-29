import * as bcrypt from 'bcryptjs'

const HashService = {
  async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, 10)
  },

  async compare(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash)
  },
}

export default HashService
