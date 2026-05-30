import React, { useState } from 'react'
import useAdmin from '../../hooks/useAdmin'
import useQuizzes from '../../hooks/useQuizzes'
import { Shield, Users, BarChart3, UploadCloud, Download, Ban, CheckCircle, AlertTriangle, Play, Sparkles } from 'lucide-react'

const AdminDashboardPage: React.FC = () => {
  const {
    analytics,
    isAnalyticsLoading,
    users,
    isUsersLoading,
    bulkUpload,
    isUploading,
    toggleUserBlock,
    exportResultsCSV,
  } = useAdmin()

  const { quizzes } = useQuizzes()

  const [activeTab, setActiveTab] = useState<'analytics' | 'quizzes' | 'users' | 'bulk'>('analytics')
  
  // Bulk Seeder form states
  const [targetQuizId, setTargetQuizId] = useState<string>('')
  const [jsonText, setJsonText] = useState<string>('')
  const [seedError, setSeedError] = useState<string | null>(null)
  const [seedSuccess, setSeedSuccess] = useState<string | null>(null)

  // Toggle user block handler
  const handleToggleBlock = async (userId: string, userName: string) => {
    if (confirm(`Are you sure you want to change the access state of ${userName}?`)) {
      try {
        const res = await toggleUserBlock(userId)
        alert(res.message)
      } catch (err: any) {
        alert(err.response?.data?.error || 'Failed to toggle user block state')
      }
    }
  }

  // Export results CSV handler
  const handleExportCSV = async (quizId: string, quizTitle: string) => {
    try {
      await exportResultsCSV(quizId, quizTitle)
    } catch (err: any) {
      alert(err.message || 'Failed to export results.')
    }
  }

  // Handle Bulk Upload Seeding
  const handleBulkSeeding = async (e: React.FormEvent) => {
    e.preventDefault()
    setSeedError(null)
    setSeedSuccess(null)

    if (!targetQuizId) {
      setSeedError('Please select a target assessment.')
      return
    }

    try {
      const questionsArray = JSON.parse(jsonText)
      if (!Array.isArray(questionsArray) || questionsArray.length === 0) {
        setSeedError('JSON content must be a non-empty array of questions.')
        return
      }

      // Quick validate structure
      for (const q of questionsArray) {
        if (!q.text || !Array.isArray(q.options) || q.options.length < 2) {
          setSeedError('Invalid structure: each question requires "text" and at least 2 "options".')
          return
        }
        const hasCorrect = q.options.some((o: any) => o.isCorrect)
        if (!hasCorrect) {
          setSeedError('Invalid structure: each question requires at least one correct option ("isCorrect": true).')
          return
        }
      }

      const res = await bulkUpload({
        quizId: targetQuizId,
        questions: questionsArray,
      })

      setSeedSuccess(`Forged ${res.insertedCount} questions successfully inside the database bank!`)
      setJsonText('')
    } catch (err: any) {
      if (err instanceof SyntaxError) {
        setSeedError(`JSON Parsing Error: ${err.message}`)
      } else {
        setSeedError(err.response?.data?.error || 'Seeding action failed.')
      }
    }
  }

  // Render SVG Pie Chart for pass/fail ratio
  const renderSVGPassFailPie = (pass: number, fail: number) => {
    const total = pass + fail
    if (total === 0) {
      return (
        <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '40px 0' }}>
          No analytics data submitted.
        </div>
      )
    }

    const passPercentage = Math.round((pass / total) * 100)
    const failPercentage = 100 - passPercentage

    // SVG parameters
    const size = 120
    const radius = 40
    const circumference = 2 * Math.PI * radius
    const passDash = (passPercentage / 100) * circumference
    const failDash = circumference - passDash

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
        <div style={{ position: 'relative', width: `${size}px`, height: `${size}px` }}>
          <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
            {/* Fail Slice (background circular track) */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="var(--error)"
              strokeWidth="14"
            />
            {/* Pass Slice */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="var(--success)"
              strokeWidth="14"
              strokeDasharray={`${passDash} ${circumference}`}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '16px', fontWeight: 800 }}>{passPercentage}%</span>
            <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 700 }}>PASSING</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: 'var(--success)' }} />
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Passed ({pass})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: 'var(--error)' }} />
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Failed ({fail})</span>
          </div>
        </div>
      </div>
    )
  }

  // Render SVG Quiz Attempt volume vertical bar chart
  const renderQuizAttemptsBarChart = (breakdown: any[]) => {
    const activeQuizzes = breakdown.filter(q => q.attemptsCount > 0).slice(0, 5)
    
    if (activeQuizzes.length === 0) {
      return (
        <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
          No quiz attempt history available.
        </div>
      )
    }

    const maxCount = Math.max(...activeQuizzes.map(q => q.attemptsCount), 5)
    const chartHeight = 120
    const barWidth = 24
    const barGap = 20

    return (
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: `${chartHeight}px`, borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', gap: '16px' }}>
        {activeQuizzes.map((quiz) => {
          const percentage = (quiz.attemptsCount / maxCount) * chartHeight
          return (
            <div key={quiz.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              {/* Floating Counter label */}
              <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>
                {quiz.attemptsCount}
              </span>
              {/* Dynamic Bar */}
              <div
                style={{
                  width: `${barWidth}px`,
                  height: `${percentage}px`,
                  background: 'linear-gradient(to top, var(--primary), var(--accent))',
                  borderRadius: '6px 6px 0 0',
                  boxShadow: '0 0 10px var(--primary-glow)',
                  transition: 'height 1s ease-out',
                }}
              />
              {/* Rotated Bottom Label */}
              <span
                style={{
                  position: 'absolute',
                  top: `${chartHeight + 6}px`,
                  fontSize: '9px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  color: 'var(--text-secondary)',
                  width: '60px',
                  textAlign: 'center',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={quiz.title}
              >
                {quiz.title}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: '80px', width: '100%', textAlign: 'left', animation: 'slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}>
      {/* Platform Admin Console Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '40px', marginBottom: '32px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
          <Shield size={24} style={{ color: 'var(--accent)' }} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '32px', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Admin Forge Console
            <Sparkles size={20} style={{ color: 'var(--primary)' }} />
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Oversee assessments performance, upload questions, and manage participant accesses.
          </p>
        </div>
      </div>

      {/* Tabs Row */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '32px' }}>
        <button
          className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('analytics')}
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          <BarChart3 size={14} />
          <span>Platform Overview</span>
        </button>
        <button
          className={`btn ${activeTab === 'quizzes' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('quizzes')}
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          <Download size={14} />
          <span>CSV Data Export</span>
        </button>
        <button
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('users')}
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          <Users size={14} />
          <span>Participant Access</span>
        </button>
        <button
          className={`btn ${activeTab === 'bulk' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('bulk')}
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          <UploadCloud size={14} />
          <span>Bulk Questions Seeder</span>
        </button>
      </div>

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div>
          {isAnalyticsLoading ? (
            <p style={{ color: 'var(--text-secondary)' }}>Gathering server metrics...</p>
          ) : !analytics ? (
            <p style={{ color: 'var(--text-secondary)' }}>Failed to load platform metrics.</p>
          ) : (
            <div>
              {/* Statistics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                <div className="auth-card" style={{ maxWidth: '100%', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>TOTAL USERS</span>
                    <span style={{ fontSize: '20px', fontWeight: 800 }}>{analytics.metrics.totalUsers}</span>
                  </div>
                </div>

                <div className="auth-card" style={{ maxWidth: '100%', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', background: 'rgba(217, 70, 239, 0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BarChart3 size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>TOTAL QUIZZES</span>
                    <span style={{ fontSize: '20px', fontWeight: 800 }}>{analytics.metrics.totalQuizzes}</span>
                  </div>
                </div>

                <div className="auth-card" style={{ maxWidth: '100%', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>TOTAL ATTEMPTS</span>
                    <span style={{ fontSize: '20px', fontWeight: 800 }}>{analytics.metrics.totalAttempts}</span>
                  </div>
                </div>
              </div>

              {/* Graphical Visualizations */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', marginBottom: '40px' }}>
                {/* SVG Pass/Fail Pie */}
                <div className="auth-card" style={{ maxWidth: '100%', padding: '30px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '24px' }}>Platform Pass / Fail Ratio</h3>
                  {renderSVGPassFailPie(analytics.metrics.passCount, analytics.metrics.failCount)}
                </div>

                {/* SVG Attempts per Quiz */}
                <div className="auth-card" style={{ maxWidth: '100%', padding: '30px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', height: '220px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Top Quiz Attempts Volume</h3>
                  {renderQuizAttemptsBarChart(analytics.quizBreakdown)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CSV Export Tab */}
      {activeTab === 'quizzes' && (
        <div className="auth-card" style={{ maxWidth: '100%', padding: '30px', background: 'var(--bg-card)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>CSV Scorecard Export</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
            Export completed participant attempts data arrays to external CSV spreadsheets.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {quizzes.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No quizzes registered inside catalog.</p>
            ) : (
              quizzes.map((quiz) => (
                <div key={quiz.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: '15px' }}>{quiz.title}</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                      Category: {quiz.category || 'General'} | Pass Marks: {quiz.passMarks || 'N/A'}
                    </span>
                  </div>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleExportCSV(quiz.id, quiz.title)}
                    style={{ padding: '8px 14px', fontSize: '13px', gap: '6px' }}
                  >
                    <Download size={14} />
                    <span>Download CSV</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Participant Access Tab */}
      {activeTab === 'users' && (
        <div className="auth-card" style={{ maxWidth: '100%', padding: '24px', background: 'var(--bg-card)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Access Control Lists</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
            Block or restore participant login permission states across QuizForge catalog.
          </p>

          {isUsersLoading ? (
            <p style={{ color: 'var(--text-secondary)' }}>Retrieving accounts database...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px', fontSize: '13px' }}>PARTICIPANT</th>
                    <th style={{ padding: '12px', fontSize: '13px' }}>EMAIL ADDR</th>
                    <th style={{ padding: '12px', fontSize: '13px' }}>ROLE STATE</th>
                    <th style={{ padding: '12px', fontSize: '13px' }}>ACCESS STATUS</th>
                    <th style={{ padding: '12px', fontSize: '13px', textAlign: 'center' }}>STATE ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '16px 12px', fontWeight: 600 }}>{u.name}</td>
                      <td style={{ padding: '16px 12px', color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td style={{ padding: '16px 12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, background: u.role === 'ADMIN' ? 'rgba(217, 70, 239, 0.15)' : 'rgba(148, 163, 184, 0.15)', color: u.role === 'ADMIN' ? 'var(--accent)' : 'var(--text-secondary)', padding: '2px 6px', borderRadius: '4px' }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: u.isBlocked ? 'var(--error)' : 'var(--success)' }}>
                          {u.isBlocked ? 'BLOCKED' : 'ACTIVE'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                        {u.role !== 'ADMIN' ? (
                          <button
                            className={`btn ${u.isBlocked ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => handleToggleBlock(u.id, u.name)}
                            style={{ padding: '6px 12px', fontSize: '12px', borderRadius: 'var(--radius-sm)', borderColor: u.isBlocked ? 'none' : 'rgba(239, 68, 68, 0.4)', color: u.isBlocked ? '#fff' : 'var(--error)' }}
                          >
                            <Ban size={12} />
                            <span>{u.isBlocked ? 'Unblock Access' : 'Block Access'}</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Protected</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Bulk Upload tab */}
      {activeTab === 'bulk' && (
        <div className="auth-card" style={{ maxWidth: '100%', padding: '30px', background: 'var(--bg-card)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>JSON Array Seeder</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
            Batch forge multiple MCQ questions with option selections atomically.
          </p>

          {seedError && (
            <div className="error-msg" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--error)', borderRadius: 'var(--radius-sm)', marginBottom: '20px' }}>
              <AlertTriangle size={16} />
              <span>{seedError}</span>
            </div>
          )}

          {seedSuccess && (
            <div className="error-msg" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: 'var(--success)', borderRadius: 'var(--radius-sm)', marginBottom: '20px' }}>
              <CheckCircle size={16} />
              <span>{seedSuccess}</span>
            </div>
          )}

          <form onSubmit={handleBulkSeeding} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Target Assessment *</label>
              <select
                className="form-input"
                style={{ paddingLeft: '16px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}
                value={targetQuizId}
                onChange={(e) => setTargetQuizId(e.target.value)}
                required
              >
                <option value="">-- Choose Quiz Target --</option>
                {quizzes.map((quiz) => (
                  <option key={quiz.id} value={quiz.id}>
                    {quiz.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Questions JSON Array *</label>
              <textarea
                className="form-input"
                style={{ padding: '16px', minHeight: '240px', fontFamily: 'monospace', fontSize: '13px', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                placeholder={`[\n  {\n    "text": "What does CSS stand for?",\n    "marks": 2,\n    "options": [\n      { "text": "Cascading Style Sheets", "isCorrect": true },\n      { "text": "Creative Style Sheets", "isCorrect": false }\n    ]\n  }\n]`}
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isUploading}
              style={{ width: '100%', marginTop: '8px' }}
            >
              <Play size={16} />
              <span>{isUploading ? 'Executing Transaction seeder...' : 'Batch Seed Questions'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default AdminDashboardPage
