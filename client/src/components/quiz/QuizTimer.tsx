import React, { useEffect } from 'react'
import quizSessionStore from '../../store/quizSessionStore'

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

  const isLow = timeLeft < 60

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 16px',
        borderRadius: 'var(--radius-sm)',
        background: isLow ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-input)',
        color: isLow ? 'var(--error)' : 'var(--primary)',
        fontWeight: 700,
        fontFamily: 'var(--font-heading)',
        fontSize: '18px',
        border: `1px solid ${isLow ? 'var(--error)' : 'var(--border-color)'}`,
        transition: 'var(--transition)',
      }}
    >
      <span className={isLow ? 'pulse-error' : ''}>{formatTime(timeLeft)}</span>
    </div>
  )
}

export default QuizTimer
