import React from 'react'
import useAttempt from '../../hooks/useAttempt'
import authStore from '../../store/authStore'
import navigationStore from '../../store/navigationStore'
import { Award, Clock, Calendar, ChevronRight, User as UserIcon, Sparkles, BookOpen, CheckCircle2, History } from 'lucide-react'

const DashboardPage: React.FC = () => {
  const { user } = authStore()
  const { attempts, isAttemptsLoading } = useAttempt()
  const { setView } = navigationStore()

  // Filter only finalized attempts for statistics
  const submittedAttempts = attempts.filter((att) => att.status === 'SUBMITTED' || att.status === 'TIMED_OUT')

  // Computations
  const totalAttempts = submittedAttempts.length
  
  const totalScore = submittedAttempts.reduce((sum, att) => sum + parseFloat(att.score || '0'), 0)
  const totalMax = submittedAttempts.reduce((sum, att) => sum + (att.totalMarks || att.quiz?.totalMarks || 10), 0)
  
  const avgAccuracy = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0
  
  const avgSpeed = totalAttempts > 0 
    ? Math.round(submittedAttempts.reduce((sum, att) => sum + (att.timeTaken || 0), 0) / totalAttempts) 
    : 0

  // Format time taken
  const formatTime = (seconds: number | null | undefined) => {
    if (seconds == null) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  // Format date
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  // Render dynamic custom SVG accuracy gauge
  const renderAccuracyGauge = (accuracy: number) => {
    const radius = 50
    const circumference = Math.PI * radius // Half circle
    const strokeDashoffset = circumference - (accuracy / 100) * circumference

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', width: '100%', height: '140px' }}>
        <svg width="160" height="100" style={{ transform: 'translateY(15px)' }}>
          <defs>
            <linearGradient id="gauge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--accent)" />
              <stop offset="100%" stopColor="var(--primary)" />
            </linearGradient>
          </defs>
          {/* Background track */}
          <path
            d="M 20 90 A 60 60 0 0 1 140 90"
            fill="none"
            stroke="var(--bg-input)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Foreground colored arc */}
          <path
            d="M 20 90 A 60 60 0 0 1 140 90"
            fill="none"
            stroke="url(#gauge-grad)"
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.5s ease-out-in' }}
          />
        </svg>
        <div style={{ position: 'absolute', bottom: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
            {accuracy}%
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Avg Accuracy
          </span>
        </div>
      </div>
    )
  }

  // Render elegant custom SVG line chart showing score progression
  const renderProgressChart = () => {
    if (totalAttempts < 2) {
      return (
        <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div>
            <History size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
            <p style={{ fontSize: '13px' }}>Progression line chart will unlock once you complete 2 or more assessments.</p>
          </div>
        </div>
      )
    }

    // Map attempts chronologically for the chart
    const sortedAttempts = [...submittedAttempts]
      .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime())
      .slice(-6) // Limit to last 6 attempts for clarity

    const dataPoints = sortedAttempts.map((att) => {
      const score = parseFloat(att.score || '0')
      const max = att.totalMarks || att.quiz?.totalMarks || 10
      return Math.round((score / max) * 100)
    })

    const chartWidth = 500
    const chartHeight = 150
    const paddingLeft = 40
    const paddingRight = 20
    const paddingTop = 20
    const paddingBottom = 20

    const graphWidth = chartWidth - paddingLeft - paddingRight
    const graphHeight = chartHeight - paddingTop - paddingBottom

    const stepX = graphWidth / (dataPoints.length - 1)

    // Construct path coordinates
    const coords = dataPoints.map((val, i) => {
      const x = paddingLeft + i * stepX
      // Percentage maps 0-100 to graphHeight-0
      const y = paddingTop + graphHeight - (val / 100) * graphHeight
      return { x, y, value: val }
    })

    const linePath = coords.reduce((acc, c, i) => {
      return acc + `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`
    }, '')

    const areaPath = linePath + ` L ${coords[coords.length - 1].x} ${paddingTop + graphHeight} L ${coords[0].x} ${paddingTop + graphHeight} Z`

    return (
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} width="100%" height="150" style={{ display: 'block', overflow: 'visible' }}>
          <defs>
            <linearGradient id="chart-area-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={paddingLeft} y1={paddingTop} x2={chartWidth - paddingRight} y2={paddingTop} stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="3 3" />
          <line x1={paddingLeft} y1={paddingTop + graphHeight / 2} x2={chartWidth - paddingRight} y2={paddingTop + graphHeight / 2} stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="3 3" />
          <line x1={paddingLeft} y1={paddingTop + graphHeight} x2={chartWidth - paddingRight} y2={paddingTop + graphHeight} stroke="var(--border-color)" strokeWidth="1" />

          {/* Y Axis Labels */}
          <text x={paddingLeft - 10} y={paddingTop + 4} fill="var(--text-muted)" fontSize="9" textAnchor="end" fontWeight="600">100%</text>
          <text x={paddingLeft - 10} y={paddingTop + graphHeight / 2 + 3} fill="var(--text-muted)" fontSize="9" textAnchor="end" fontWeight="600">50%</text>
          <text x={paddingLeft - 10} y={paddingTop + graphHeight + 3} fill="var(--text-muted)" fontSize="9" textAnchor="end" fontWeight="600">0%</text>

          {/* Gradient Fill Area under the curve */}
          <path d={areaPath} fill="url(#chart-area-grad)" />

          {/* Main Curved Line */}
          <path d={linePath} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />

          {/* Interactive Data Nodes */}
          {coords.map((c, i) => (
            <g key={i} className="chart-node">
              <circle cx={c.x} cy={c.y} r="5" fill="var(--bg-secondary)" stroke="var(--primary)" strokeWidth="2.5" />
              <rect x={c.x - 14} y={c.y - 20} width="28" height="14" rx="3" fill="var(--bg-input)" stroke="var(--border-color)" strokeWidth="0.5" />
              <text x={c.x} y={c.y - 10} fill="var(--text-primary)" fontSize="8" fontWeight="700" textAnchor="middle">{c.value}%</text>
            </g>
          ))}
        </svg>
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: '80px', width: '100%', textAlign: 'left', animation: 'slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}>
      {/* Dynamic Profile Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '40px',
          marginBottom: '32px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            className="logo-icon"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--bg-input)',
              color: 'var(--text-primary)',
              fontSize: '24px',
              boxShadow: 'none',
              border: '2px solid var(--border-color)',
            }}
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <UserIcon size={24} />
            )}
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '32px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'var(--font-heading)',
              }}
            >
              <Sparkles size={24} style={{ color: 'var(--primary)' }} />
              Welcome back, {user?.name || 'Forged Participant'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
              Track your stats, view previous submissions, and climb higher in the ranks.
            </p>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setView('catalog')}
          style={{ padding: '10px 20px' }}
        >
          <BookOpen size={16} />
          <span>Browse Assessments</span>
        </button>
      </div>

      {/* Aggregate Score Grid Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div className="auth-card" style={{ maxWidth: '100%', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <History size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', fontWeight: 600, textTransform: 'uppercase' }}>Assessments Done</span>
            <span style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>{totalAttempts}</span>
          </div>
        </div>

        <div className="auth-card" style={{ maxWidth: '100%', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(217, 70, 239, 0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', fontWeight: 600, textTransform: 'uppercase' }}>Avg Accuracy</span>
            <span style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>{avgAccuracy}%</span>
          </div>
        </div>

        <div className="auth-card" style={{ maxWidth: '100%', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={24} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', fontWeight: 600, textTransform: 'uppercase' }}>Avg Speed</span>
            <span style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>{formatTime(avgSpeed)}</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', marginBottom: '40px' }}>
        {/* Left Side: Accuracy Radial Gauge */}
        <div className="auth-card" style={{ maxWidth: '100%', padding: '30px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', alignSelf: 'flex-start' }}>Overall Accuracy</h3>
          {isAttemptsLoading ? (
            <div style={{ height: '140px', display: 'flex', alignItems: 'center' }}>Loading...</div>
          ) : (
            renderAccuracyGauge(avgAccuracy)
          )}
        </div>

        {/* Right Side: Score Progress Curve */}
        <div className="auth-card" style={{ maxWidth: '100%', padding: '30px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Score Progression</h3>
          {isAttemptsLoading ? (
            <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>
          ) : (
            renderProgressChart()
          )}
        </div>
      </div>

      {/* Attempts History */}
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <CheckCircle2 style={{ color: 'var(--primary)' }} />
        Assessment Attempt History
      </h2>

      {isAttemptsLoading ? (
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Retrieving submission logs...</p>
        </div>
      ) : attempts.length === 0 ? (
        <div className="auth-card" style={{ maxWidth: '100%', padding: '60px', textAlign: 'center' }}>
          <History size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>No Attempts Registered</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            You haven't initiated any assessment attempts yet.
          </p>
          <button className="btn btn-primary" onClick={() => setView('catalog')}>
            Start Forging Now
          </button>
        </div>
      ) : (
        <div
          className="auth-card"
          style={{
            maxWidth: '100%',
            padding: '24px',
            background: 'var(--bg-card)',
            overflowX: 'auto',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '16px 12px', fontSize: '13px', fontWeight: 600 }}>ASSESSMENT</th>
                <th style={{ padding: '16px 12px', fontSize: '13px', fontWeight: 600 }}>SCORE SECURED</th>
                <th style={{ padding: '16px 12px', fontSize: '13px', fontWeight: 600 }}>TIME ELAPSED</th>
                <th style={{ padding: '16px 12px', fontSize: '13px', fontWeight: 600 }}>ATTEMPT STATUS</th>
                <th style={{ padding: '16px 12px', fontSize: '13px', fontWeight: 600 }}>DATE COMPLETED</th>
                <th style={{ padding: '16px 12px', fontSize: '13px', fontWeight: 600, textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((att) => {
                const scoreStr = att.score ?? '0.00'
                const totalM = att.totalMarks ?? att.quiz?.totalMarks ?? 10
                const isPassing = att.quiz?.passMarks != null 
                  ? parseFloat(scoreStr) >= att.quiz.passMarks 
                  : parseFloat(scoreStr) >= totalM * 0.5

                return (
                  <tr
                    key={att.id}
                    style={{ borderBottom: '1px solid var(--border-color)', transition: 'var(--transition)' }}
                    className="leaderboard-row"
                  >
                    <td style={{ padding: '16px 12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, fontSize: '15px' }}>{att.quiz?.title || 'Unknown Assessment'}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Category: {att.quiz?.category || 'General'}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 800, fontSize: '15px', color: isPassing ? 'var(--success)' : 'var(--error)' }}>
                          {att.status === 'IN_PROGRESS' ? '—' : `${att.score} / ${totalM}`}
                        </span>
                        {att.status !== 'IN_PROGRESS' && (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {isPassing ? 'Passing Grade' : 'Below Passing'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                        <Clock size={14} />
                        <span>{att.status === 'IN_PROGRESS' ? '—' : formatTime(att.timeTaken)}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: '8px',
                          background:
                            att.status === 'SUBMITTED'
                              ? 'rgba(16, 185, 129, 0.1)'
                              : att.status === 'IN_PROGRESS'
                              ? 'rgba(139, 92, 246, 0.1)'
                              : 'rgba(245, 158, 11, 0.1)',
                          color:
                            att.status === 'SUBMITTED'
                              ? 'var(--success)'
                              : att.status === 'IN_PROGRESS'
                              ? 'var(--primary)'
                              : 'var(--warning)',
                        }}
                      >
                        {att.status === 'SUBMITTED'
                          ? 'SUBMITTED'
                          : att.status === 'IN_PROGRESS'
                          ? 'IN PROGRESS'
                          : 'TIMED OUT'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px' }}>
                        <Calendar size={13} />
                        <span>{formatDate(att.submittedAt || att.startedAt)}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                      {att.status !== 'IN_PROGRESS' ? (
                        <button
                          className="btn btn-secondary"
                          onClick={() => setView('result-detail', { attemptId: att.id })}
                          style={{ padding: '6px 12px', fontSize: '12px', borderRadius: 'var(--radius-sm)' }}
                        >
                          <span>Detailed Analysis</span>
                          <ChevronRight size={12} />
                        </button>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Active Session</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default DashboardPage
