import React, { useEffect } from 'react'
import themeStore from '@/store/themeStore'
import { Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = themeStore()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-full w-9 h-9 border bg-card text-foreground hover:bg-muted cursor-pointer transition-transform duration-200 active:scale-95"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      type="button"
    >
      {theme === 'dark' ? (
        <Sun className="h-[1.1rem] w-[1.1rem] text-yellow-500" />
      ) : (
        <Moon className="h-[1.1rem] w-[1.1rem]" />
      )}
    </Button>
  )
}

export default ThemeToggle
