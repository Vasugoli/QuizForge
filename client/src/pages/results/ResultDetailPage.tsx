import React from 'react'
import useAttemptResult from '../../hooks/useAttemptResult'
import navigationStore from '../../store/navigationStore'
import { Award, Clock, ArrowLeft, CheckCircle2, XCircle, AlertCircle, AlertTriangle } from 'lucide-react'

const ResultDetailPage: React.FC = () => {
  const { selectedAttemptId, setView } = navigationStore()
  const { data: result, isLoading, error } = useAttemptResult(selectedAttemptId)

  if (isLoading) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="logo-icon" style={{ margin: '0 auto 20px', animation: 'spin 1s linear infinite' }}>
          Q
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>Analyzing attempt results...</p>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center' }}>
        <AlertTriangle size={48} style={{ color: 'var(--error)', marginBottom: '16px' }} />
        <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Failed to Load Results</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          {error?.message || 'The requested attempt record could not be retrieved.'}
        </p>
        <button className="btn btn-secondary" onClick={() => setView('dashboard')}>
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>
      </div>
    )
  }

  const { attempt, quiz, breakdown } = result
  const scoreNum = parseFloat(attempt.score || '0')
  const totalNum = attempt.totalMarks || quiz.totalMarks
  const percentage = Math.round((scoreNum / totalNum) * 100)
  
  // Stats calculations
  const totalQuestions = breakdown.length
  const correctCount = breakdown.filter(item => item.userAnswer?.isCorrect).length
  const answeredCount = breakdown.filter(item => item.userAnswer?.optionId).length
  const skippedCount = totalQuestions - answeredCount
  const wrongCount = answeredCount - correctCount

  // Format time taken
  const formatTime = (seconds: number | null | undefined) => {
    if (seconds == null) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <div style={{ paddingBottom: '80px', width: '100%', textAlign: 'left', animation: 'slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}>
      {/* Top Navigation Row */}
      <div style={{ marginTop: '40px', marginBottom: '24px' }}>
        <button
          className="btn btn-secondary"
          onClick={() => setView('dashboard')}
          style={{ padding: '8px 16px' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Main Glassmorphic Summary Card */}
      <div className="auth-card" style={{ maxWidth: '100%', padding: '40px', marginBottom: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '40px', alignItems: 'center' }}>
          <div>
            <span
              style={{
                textTransform: 'uppercase',
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--primary)',
                letterSpacing: '1px',
                background: 'var(--primary-glow)',
                padding: '4px 10px',
                borderRadius: '20px',
              }}
            >
              Assessment Completed
            </span>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', marginTop: '16px', marginBottom: '12px' }}>
              {quiz.title}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '24px', lineHeight: 1.6 }}>
              {quiz.description || 'No description provided for this assessment.'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', background: 'var(--bg-input)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>TIME TAKEN</span>
                <span style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={16} style={{ color: 'var(--primary)' }} />
                  {formatTime(attempt.timeTaken)}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>ACCURACY</span>
                <span style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={16} style={{ color: 'var(--accent)' }} />
                  {totalQuestions > 0 ? `${Math.round((correctCount / totalQuestions) * 100)}%` : '0%'}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>STATUS</span>
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color: attempt.status === 'SUBMITTED' ? 'var(--success)' : 'var(--warning)',
                  }}
                >
                  {attempt.status === 'SUBMITTED' ? 'SUBMITTED' : 'TIMED OUT'}
                </span>
              </div>
            </div>
          </div>

          {/* Big Score Circular Ring Badge */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', borderLeft: '1px solid var(--border-color)' }}>
            <div
              style={{
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, var(--bg-input) 40%, transparent 100%)',
                border: `8px solid ${percentage >= (quiz.passMarks ? (quiz.passMarks/quiz.totalMarks)*100 : 50) ? 'var(--success)' : 'var(--error)'}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-glow)',
                marginBottom: '16px',
              }}
            >
              <span style={{ fontSize: '36px', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                {attempt.score}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                out of {totalNum}
              </span>
            </div>
            <span style={{ fontSize: '18px', fontWeight: 700 }}>
              {percentage}% Score
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Passing Marks: {quiz.passMarks ?? 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Answer Breakdown Header / Quick Stats */}
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', marginBottom: '20px' }}>
        Question-by-Question Analysis
      </h2>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
        <div style={{ flex: 1, background: 'var(--bg-card)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Correct</span>
            <span style={{ fontSize: '18px', fontWeight: 700 }}>{correctCount}</span>
          </div>
        </div>

        <div style={{ flex: 1, background: 'var(--bg-card)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--error)' }}>
            <XCircle size={20} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Wrong</span>
            <span style={{ fontSize: '18px', fontWeight: 700 }}>{wrongCount}</span>
          </div>
        </div>

        <div style={{ flex: 1, background: 'var(--bg-card)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(148, 163, 184, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <AlertCircle size={20} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Skipped</span>
            <span style={{ fontSize: '18px', fontWeight: 700 }}>{skippedCount}</span>
          </div>
        </div>
      </div>

      {/* List of Questions & Selections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {breakdown.map((item, index) => {
          const isCorrect = item.userAnswer?.isCorrect ?? false
          const isAnswered = !!item.userAnswer?.optionId
          const userOptionId = item.userAnswer?.optionId

          let statusTheme = {
            border: 'var(--border-color)',
            badge: 'Unanswered',
            badgeBg: 'var(--bg-input)',
            badgeColor: 'var(--text-muted)',
          }

          if (isAnswered) {
            if (isCorrect) {
              statusTheme = {
                border: 'rgba(16, 185, 129, 0.4)',
                badge: 'Correct',
                badgeBg: 'rgba(16, 185, 129, 0.1)',
                badgeColor: 'var(--success)',
              }
            } else {
              statusTheme = {
                border: 'rgba(239, 68, 68, 0.4)',
                badge: 'Incorrect',
                badgeBg: 'rgba(239, 68, 68, 0.1)',
                badgeColor: 'var(--error)',
              }
            }
          }

          return (
            <div
              key={item.question.id}
              className="auth-card"
              style={{
                maxWidth: '100%',
                padding: '30px',
                borderColor: statusTheme.border,
                borderWidth: '2px',
                background: 'var(--bg-card)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)' }}>
                  Question {index + 1} of {totalQuestions}
                </span>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: statusTheme.badgeBg,
                      color: statusTheme.badgeColor,
                    }}
                  >
                    {statusTheme.badge}
                  </span>

                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: 'var(--bg-input)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {item.userAnswer
                      ? `${parseFloat(item.userAnswer.marksEarned) >= 0 ? '+' : ''}${item.userAnswer.marksEarned} Marks`
                      : '0.00 Marks'}
                  </span>
                </div>
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: 600, lineHeight: 1.5, marginBottom: '24px' }}>
                {item.question.text}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {item.options.map((opt) => {
                  const isUserSelection = opt.id === userOptionId
                  const isCorrectOption = opt.isCorrect

                  let optionStyle: React.CSSProperties = {
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    transition: 'var(--transition)',
                  }

                  let iconElement = null

                  if (isCorrectOption) {
                    optionStyle.borderColor = 'var(--success)'
                    optionStyle.background = 'rgba(16, 185, 129, 0.05)'
                    iconElement = <CheckCircle2 size={18} style={{ color: 'var(--success)', marginLeft: 'auto' }} />
                  } else if (isUserSelection && !isCorrectOption) {
                    optionStyle.borderColor = 'var(--error)'
                    optionStyle.background = 'rgba(239, 68, 68, 0.05)'
                    iconElement = <XCircle size={18} style={{ color: 'var(--error)', marginLeft: 'auto' }} />
                  }

                  return (
                    <div key={opt.id} style={optionStyle}>
                      <span
                        style={{
                          fontWeight: isUserSelection || isCorrectOption ? 700 : 500,
                          color: isCorrectOption
                            ? 'var(--success)'
                            : isUserSelection
                            ? 'var(--error)'
                            : 'var(--text-primary)',
                        }}
                      >
                        {opt.text}
                      </span>
                      {isUserSelection && (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            color: isCorrectOption ? 'var(--success)' : 'var(--error)',
                            background: isCorrectOption ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            marginLeft: '12px',
                          }}
                        >
                          Your Pick
                        </span>
                      )}
                      {iconElement}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ResultDetailPage
