import React, { useState, useEffect } from 'react'
import quizSessionStore from '../../store/quizSessionStore'
import useAttempt from '../../hooks/useAttempt'
import QuizTimer from '../../components/quiz/QuizTimer'
import { ChevronLeft, ChevronRight, AlertTriangle, ShieldAlert } from 'lucide-react'

interface QuizAttemptPageProps {
  quizTitle: string
  negativeMarks: string
  onCompleteAttempt: (resultData: any) => void
}

const QuizAttemptPage: React.FC<QuizAttemptPageProps> = ({
  quizTitle,
  negativeMarks,
  onCompleteAttempt,
}) => {
  const { attemptId, questions, answers, timeLeft, setAnswer, clearSession } = quizSessionStore()
  const { saveAnswer, submitAttempt, isSubmitting } = useAttempt()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [warnings, setWarnings] = useState(0)
  const [showWarningModal, setShowWarningModal] = useState(false)

  const activeQuestion = questions[currentIndex]

  // Tab switch warning detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setWarnings((prev) => prev + 1)
        setShowWarningModal(true)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // Auto-submit on timer expiry
  useEffect(() => {
    if (timeLeft <= 0 && attemptId) {
      handleForceSubmit()
    }
  }, [timeLeft])

  const handleForceSubmit = async () => {
    if (!attemptId) return
    const payload = Object.entries(answers).map(([qId, optId]) => ({
      questionId: qId,
      optionId: optId,
    }))
    try {
      const res = await submitAttempt({ attemptId, answers: payload })
      clearSession()
      onCompleteAttempt(res)
    } catch {
      alert('Attempt submission failed. Please try again.')
    }
  }

  const handleSelectOption = async (optionId: string) => {
    if (!attemptId || !activeQuestion) return

    // Update locally immediately
    setAnswer(activeQuestion.id, optionId)

    // Save in background
    try {
      await saveAnswer({
        attemptId,
        questionId: activeQuestion.id,
        optionId,
      })
    } catch {
      console.error('Failed to save answer in background')
    }
  }

  const handleClearAnswer = async () => {
    if (!attemptId || !activeQuestion) return

    // Update locally immediately
    setAnswer(activeQuestion.id, null)

    // Save in background
    try {
      await saveAnswer({
        attemptId,
        questionId: activeQuestion.id,
        optionId: null,
      })
    } catch {
      console.error('Failed to clear answer in background')
    }
  }

  const handleSubmit = async () => {
    if (window.confirm('Are you sure you want to submit your assessment?')) {
      await handleForceSubmit()
    }
  }

  // Copy paste prevention
  const handlePrevent = (e: React.SyntheticEvent) => {
    e.preventDefault()
  }

  if (!activeQuestion) {
    return (
      <div style={{ padding: '80px', textAlign: 'center' }}>
        <h2>Loading active assessment session...</h2>
      </div>
    )
  }

  return (
    <div
      onCopy={handlePrevent}
      onPaste={handlePrevent}
      onCut={handlePrevent}
      onContextMenu={handlePrevent}
      style={{
        paddingBottom: '80px',
        width: '100%',
        userSelect: 'none',
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
        gap: '32px',
        marginTop: '40px',
      }}
    >
      {/* Quiz Attempt Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg-card)',
            padding: '20px 24px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '22px',
                fontWeight: 700,
                margin: 0,
                color: 'var(--text-primary)',
              }}
            >
              {quizTitle}
            </h2>
            {Number(negativeMarks) > 0 && (
              <span
                style={{
                  fontSize: '12px',
                  color: 'var(--error)',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '4px',
                }}
              >
                <ShieldAlert size={12} />
                Negative marking penalty: {negativeMarks} per wrong answer
              </span>
            )}
          </div>
          <QuizTimer />
        </div>

        {/* Active Question Box */}
        <div className="auth-card" style={{ maxWidth: '100%', padding: '40px', position: 'relative' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '13px',
              color: 'var(--text-muted)',
              fontWeight: 600,
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            <span>
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span>{activeQuestion.marks} Marks</span>
          </div>

          <h3
            style={{
              fontSize: '20px',
              fontWeight: 600,
              marginBottom: '32px',
              color: 'var(--text-primary)',
              lineHeight: '145%',
            }}
          >
            {activeQuestion.text}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activeQuestion.options.map((opt) => {
              const isSelected = answers[activeQuestion.id] === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  className="btn"
                  style={{
                    width: '100%',
                    justifyContent: 'flex-start',
                    padding: '16px 20px',
                    fontSize: '15px',
                    borderRadius: 'var(--radius-md)',
                    background: isSelected ? 'var(--accent-bg)' : 'var(--bg-input)',
                    border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                    color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                    textAlign: 'left',
                    fontWeight: 500,
                  }}
                  onClick={() => handleSelectOption(opt.id)}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--text-muted)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      background: isSelected ? 'var(--primary)' : 'transparent',
                      color: '#fff',
                      flexShrink: 0,
                      gap: 0,
                    }}
                  >
                    {isSelected && '✓'}
                  </div>
                  <span>{opt.text}</span>
                </button>
              )
            })}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '40px',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '24px',
            }}
          >
            <button
              className="btn btn-secondary"
              onClick={handleClearAnswer}
              disabled={answers[activeQuestion.id] === null}
            >
              Clear Selection
            </button>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="btn btn-secondary"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => prev - 1)}
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              {currentIndex < questions.length - 1 ? (
                <button
                  className="btn btn-secondary"
                  onClick={() => setCurrentIndex((prev) => prev + 1)}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? <div className="spinner" /> : <span>Finish Attempt</span>}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation & Info Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Navigation grid */}
        <div className="auth-card" style={{ maxWidth: '100%', padding: '24px' }}>
          <h4
            style={{
              fontSize: '14px',
              fontWeight: 600,
              textTransform: 'uppercase',
              color: 'var(--text-secondary)',
              marginBottom: '16px',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '10px',
            }}
          >
            Question Map
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
            {questions.map((q, idx) => {
              const isAnswered = answers[q.id] !== null
              const isActive = idx === currentIndex
              return (
                <button
                  key={q.id}
                  type="button"
                  style={{
                    height: '40px',
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border-color)'}`,
                    background: isAnswered
                      ? 'var(--accent-bg)'
                      : isActive
                      ? 'var(--bg-input)'
                      : 'transparent',
                    color: isAnswered ? 'var(--primary)' : 'var(--text-primary)',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                    outline: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'var(--transition)',
                  }}
                  onClick={() => setCurrentIndex(idx)}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>

          <div
            style={{
              marginTop: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              fontSize: '12px',
              color: 'var(--text-secondary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '3px',
                  background: 'var(--accent-bg)',
                  border: '1px solid var(--primary)',
                }}
              />
              <span>Answered</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '3px',
                  border: '1px solid var(--border-color)',
                }}
              />
              <span>Unanswered / Skipped</span>
            </div>
          </div>
        </div>

        {/* Integrity status */}
        <div
          className="auth-card"
          style={{
            maxWidth: '100%',
            padding: '24px',
            borderLeft: `4px solid ${warnings > 0 ? 'var(--error)' : 'var(--success)'}`,
          }}
        >
          <h4
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: '8px',
            }}
          >
            Integrity Guard Status
          </h4>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              lineHeight: '140%',
            }}
          >
            {warnings === 0 ? (
              <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                Active - Perfect standing
              </span>
            ) : (
              <span style={{ color: 'var(--error)', fontWeight: 600 }}>
                {warnings} Tab-Switch Warning{warnings > 1 && 's'} logged!
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Visibility warning alert modal */}
      {showWarningModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div className="auth-card" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <AlertTriangle size={48} style={{ color: 'var(--error)', margin: '0 auto 16px' }} />
            <h2 className="auth-title" style={{ fontSize: '24px', color: 'var(--error)' }}>
              Integrity Alert!
            </h2>
            <p className="auth-subtitle" style={{ fontSize: '14px', marginBottom: '24px' }}>
              You have switched windows or tabs. Switch actions are automatically logged for
              proctoring reports. Further switches may disqualify this attempt.
            </p>
            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => setShowWarningModal(false)}
            >
              Resume Assessment
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuizAttemptPage
