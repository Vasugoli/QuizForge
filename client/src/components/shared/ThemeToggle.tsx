import React, { useEffect } from 'react'
import themeStore from '../../store/themeStore'
import { Sun, Moon } from 'lucide-react'

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = themeStore()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <button
      className="btn-icon"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      type="button"
    >
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  )
}

export default ThemeToggle
