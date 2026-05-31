import React, { useEffect } from 'react'
import quizSessionStore from '@/store/quizSessionStore'

const QuizTimer: React.FC = () => {
  const { timeLeft, tick, isActive } = quizSessionStore()

  useEffect(() => {
    if (!isActive || timeLeft <= 0) return

    const interval = setInterval(() => {
      tick()
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, timeLeft, tick])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Timer Color and Animation States (based on design.md)
  let timerClass = 'text-green-600 dark:text-green-500 border-green-500/20'
  
  if (timeLeft < 10) {
    // Danger: <10s remaining (Red, Fast Pulse + Glow Shadow)
    timerClass = 'text-red-600 dark:text-red-500 border-red-500 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.3)]'
  } else if (timeLeft <= 30) {
    // Warning: 10-30s remaining (Amber, Subtle Pulse)
    timerClass = 'text-amber-600 dark:text-amber-500 border-amber-500 animate-pulse'
  }

  return (
    <div
      className={`fixed top-6 right-6 z-1000 flex items-center gap-2 px-5 py-3 rounded-lg bg-card/85 backdrop-blur-md font-mono text-2xl font-bold border shadow-sm transition-all duration-200 ${timerClass}`}
      aria-live="polite"
    >
      <span>{formatTime(timeLeft)}</span>
    </div>
  )
}

export default QuizTimer
