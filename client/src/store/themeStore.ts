import { create } from 'zustand'

interface ThemeState {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

const themeStore = create<ThemeState>((set) => ({
  theme:
    (localStorage.getItem('qf_theme') as 'light' | 'dark') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
  toggleTheme: () =>
    set((state) => {
      const nextTheme = state.theme === 'light' ? 'dark' : 'light'
      localStorage.setItem('qf_theme', nextTheme)
      return { theme: nextTheme }
    }),
}))

export default themeStore
