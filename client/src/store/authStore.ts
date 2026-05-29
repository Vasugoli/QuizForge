import { create } from 'zustand'

export interface User {
  id: string
  name: string
  email: string
  role: string
  avatarUrl?: string | null
  isBlocked: boolean
}

interface AuthState {
  token: string | null
  user: User | null
  setAuth: (token: string, user: User) => void
  logout: () => void
}

const authStore = create<AuthState>((set) => ({
  token: localStorage.getItem('qf_token'),
  user: (() => {
    try {
      const stored = localStorage.getItem('qf_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })(),
  setAuth: (token, user) => {
    localStorage.setItem('qf_token', token)
    localStorage.setItem('qf_user', JSON.stringify(user))
    set({ token, user })
  },
  logout: () => {
    localStorage.removeItem('qf_token')
    localStorage.removeItem('qf_user')
    set({ token: null, user: null })
  },
}))

export default authStore
