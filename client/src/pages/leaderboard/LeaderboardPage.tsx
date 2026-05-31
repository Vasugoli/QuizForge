import React, { useState } from 'react'
import useLeaderboard from '@/hooks/useLeaderboard'
import useQuizzes from '@/hooks/useQuizzes'
import navigationStore from '@/store/navigationStore'
import Avatar from 'boring-avatars'
import { Award, Trophy, Clock, Calendar, ArrowLeft, Filter } from 'lucide-react'

const LeaderboardPage: React.FC = () => {
  const { selectedQuizId, setView } = navigationStore()
  const { quizzes } = useQuizzes()
  const [activeQuizId, setActiveQuizId] = useState<string>(selectedQuizId || 'ALL')

  const { data: leaderboard, isLoading } = useLeaderboard(
    activeQuizId === 'ALL' ? undefined : activeQuizId
  )

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
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div style={{ paddingBottom: '80px', width: '100%', textAlign: 'left', animation: 'slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}>
      {/* Top Banner Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '40px',
          marginBottom: '32px',
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '36px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontFamily: 'var(--font-heading)',
            }}
          >
            <Trophy style={{ color: '#fbbf24', filter: 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.3))' }} />
            Hall of Fame
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
            Compete globally. Top scores sorted by absolute accuracy and speed.
          </p>
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => setView('catalog')}
          style={{ padding: '8px 16px' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Quizzes</span>
        </button>
      </div>

      {/* Select Filter Bar */}
      <div
        className="auth-card"
        style={{
          maxWidth: '100%',
          padding: '20px 30px',
          marginBottom: '40px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
            <Filter size={16} />
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Filter by Assessment:</span>
          </div>

          <select
            className="form-input"
            style={{
              padding: '8px 16px',
              width: 'auto',
              minWidth: '260px',
              background: 'var(--bg-input)',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            value={activeQuizId}
            onChange={(e) => setActiveQuizId(e.target.value)}
          >
            <option value="ALL">🏆 Global Leaderboard (All Assessments)</option>
            {quizzes.map((quiz) => (
              <option key={quiz.id} value={quiz.id}>
                {quiz.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: '80px 0', textAlign: 'center' }}>
          <div className="logo-icon" style={{ margin: '0 auto 20px', animation: 'spin 1s linear infinite' }}>
            Q
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>Compiling rankings...</p>
        </div>
      ) : !leaderboard || leaderboard.length === 0 ? (
        <div className="auth-card" style={{ maxWidth: '100%', padding: '60px', textAlign: 'center' }}>
          <Award size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>No Submitted Attempts Yet</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            Be the first to attempt this quiz and secure your place on the leaderboard!
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
          {/* Top 3 Podium Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
              marginBottom: '20px',
            }}
          >
            {leaderboard.slice(0, 3).map((entry, index) => {
              const ranks = [
                {
                  title: '1st Place',
                  color: '#fbbf24',
                  glow: 'rgba(251, 191, 36, 0.25)',
                  bg: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), transparent)',
                },
                {
                  title: '2nd Place',
                  color: '#94a3b8',
                  glow: 'rgba(148, 163, 184, 0.25)',
                  bg: 'linear-gradient(135deg, rgba(148, 163, 184, 0.1), transparent)',
                },
                {
                  title: '3rd Place',
                  color: '#b45309',
                  glow: 'rgba(180, 83, 9, 0.25)',
                  bg: 'linear-gradient(135deg, rgba(180, 83, 9, 0.1), transparent)',
                },
              ]

              const rankInfo = ranks[index]

              return (
                <div
                  key={entry.id}
                  className="auth-card"
                  style={{
                    maxWidth: '100%',
                    padding: '30px',
                    borderColor: rankInfo.color,
                    borderWidth: '2px',
                    background: rankInfo.bg,
                    boxShadow: `0 15px 30px -10px ${rankInfo.glow}`,
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    transition: 'var(--transition)',
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: rankInfo.color,
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '20px',
                      marginBottom: '16px',
                      boxShadow: `0 4px 12px ${rankInfo.glow}`,
                    }}
                  >
                    {index + 1}
                  </div>

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
                      marginBottom: '16px',
                      border: '2px solid var(--border-color)',
                    }}
                  >
                    {!entry.user.avatarUrl || entry.user.avatarUrl.includes('unsplash.com') ? (
                      <Avatar
                        size={64}
                        name={entry.user.name}
                        variant="beam"
                        colors={['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b']}
                      />
                    ) : (
                      <img
                        src={entry.user.avatarUrl}
                        alt=""
                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    )}
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>
                    {entry.user.name}
                  </h3>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', display: 'block' }}>
                    {entry.quiz.title}
                  </span>

                  <div
                    style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-around',
                      background: 'var(--bg-input)',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      marginTop: 'auto',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>SCORE</span>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: rankInfo.color }}>
                        {entry.score} pts
                      </span>
                    </div>
                    <div style={{ borderLeft: '1px solid var(--border-color)' }} />
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>TIME</span>
                      <span style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} />
                        {formatTime(entry.timeTaken)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Leaderboard Table List (for spots 4-20) */}
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
                  <th style={{ padding: '16px 12px', fontSize: '13px', fontWeight: 600 }}>RANK</th>
                  <th style={{ padding: '16px 12px', fontSize: '13px', fontWeight: 600 }}>PARTICIPANT</th>
                  <th style={{ padding: '16px 12px', fontSize: '13px', fontWeight: 600 }}>ASSESSMENT</th>
                  <th style={{ padding: '16px 12px', fontSize: '13px', fontWeight: 600 }}>ACCURACY SCORE</th>
                  <th style={{ padding: '16px 12px', fontSize: '13px', fontWeight: 600 }}>TIME TAKEN</th>
                  <th style={{ padding: '16px 12px', fontSize: '13px', fontWeight: 600 }}>COMPLETED AT</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => {
                  const rank = index + 1
                  const isTop3 = rank <= 3

                  return (
                    <tr
                      key={entry.id}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        transition: 'var(--transition)',
                        background: isTop3 ? 'rgba(var(--primary-glow), 0.02)' : 'transparent',
                      }}
                      className="leaderboard-row"
                    >
                      <td style={{ padding: '16px 12px', fontWeight: 800 }}>
                        {isTop3 ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: rank === 1 ? '#fbbf24' : rank === 2 ? '#94a3b8' : '#b45309',
                              color: '#fff',
                              fontSize: '12px',
                            }}
                          >
                            {rank}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)', paddingLeft: '6px' }}>#{rank}</span>
                        )}
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            className="logo-icon"
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: 'var(--bg-input)',
                              color: 'var(--text-primary)',
                              fontSize: '14px',
                              boxShadow: 'none',
                              border: '1px solid var(--border-color)',
                            }}
                          >
                            {!entry.user.avatarUrl || entry.user.avatarUrl.includes('unsplash.com') ? (
                              <Avatar
                                size={32}
                                name={entry.user.name}
                                variant="beam"
                                colors={['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b']}
                              />
                            ) : (
                              <img
                                src={entry.user.avatarUrl}
                                alt=""
                                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                              />
                            )}
                          </div>
                          <span style={{ fontWeight: 600 }}>{entry.user.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 12px', color: 'var(--text-secondary)' }}>
                        {entry.quiz.title}
                      </td>
                      <td style={{ padding: '16px 12px', fontWeight: 800, color: 'var(--primary)' }}>
                        {entry.score} pts
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                          <Clock size={14} />
                          <span>{formatTime(entry.timeTaken)}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px' }}>
                          <Calendar size={13} />
                          <span>{formatDate(entry.submittedAt)}</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default LeaderboardPage
