import React, { useState } from 'react'
import useQuizzes from '../../hooks/useQuizzes'
import useAttempt from '../../hooks/useAttempt'
import authStore from '../../store/authStore'
import quizSessionStore from '../../store/quizSessionStore'
import api from '../../lib/axios'
import { BookOpen, Clock, Award, ShieldAlert, Plus, Sparkles, Filter } from 'lucide-react'

const QuizzesPage: React.FC = () => {
  const { user } = authStore()
  const { quizzes, isLoading, createQuiz } = useQuizzes()
  const { startAttempt } = useAttempt()
  const { setSession } = quizSessionStore()
  const [startingQuizId, setStartingQuizId] = useState<string | null>(null)

  const handleStartQuiz = async (quizId: string, durationMinutes: number) => {
    const quiz = quizzes.find((q) => q.id === quizId)
    if (!quiz) return

    setStartingQuizId(quizId)
    try {
      const startRes = await startAttempt(quizId)
      const response = await api.get(`/quizzes/${quizId}/questions`)
      setSession(
        startRes.attempt.id,
        quizId,
        quiz.title,
        quiz.negativeMarks,
        response.data.questions,
        durationMinutes
      )
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to start quiz attempt')
    } finally {
      setStartingQuizId(null)
    }
  }

  const [category, setCategory] = useState('All')
  const [difficulty, setDifficulty] = useState('All')

  // Admin Create Quiz Form States
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [quizCategory, setQuizCategory] = useState('')
  const [quizDifficulty, setQuizDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM')
  const [duration, setDuration] = useState(15)
  const [totalMarks, setTotalMarks] = useState(10)
  const [passMarks, setPassMarks] = useState(5)
  const [negativeMarks, setNegativeMarks] = useState('0.00')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get distinct categories
  const categories = [
    'All',
    ...Array.from(new Set(quizzes.map((q) => q.category).filter(Boolean))),
  ]

  // Filter quizzes
  const filteredQuizzes = quizzes.filter((q) => {
    const matchesCategory = category === 'All' || q.category === category
    const matchesDifficulty = difficulty === 'All' || q.difficulty === difficulty
    return matchesCategory && matchesDifficulty
  })

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title || !duration || !totalMarks) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      await createQuiz({
        title,
        description: description || null,
        category: quizCategory || null,
        difficulty: quizDifficulty,
        durationMinutes: Number(duration),
        totalMarks: Number(totalMarks),
        passMarks: passMarks ? Number(passMarks) : null,
        negativeMarks,
      })
      // Reset Form
      setTitle('')
      setDescription('')
      setQuizCategory('')
      setDuration(15)
      setTotalMarks(10)
      setPassMarks(5)
      setNegativeMarks('0.00')
      setShowCreateForm(false)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create quiz')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ paddingBottom: '60px', width: '100%', textAlign: 'left' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '40px',
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '36px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <Sparkles style={{ color: 'var(--primary)' }} />
            Browse Assessments
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
            Select a forged quiz, test your limits, and climb the leaderboard.
          </p>
        </div>
        {user?.role === 'ADMIN' && (
          <button className="btn btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus size={18} />
            <span>Create Quiz</span>
          </button>
        )}
      </div>

      {showCreateForm && (
        <div className="auth-card" style={{ maxWidth: '100%', marginTop: '32px' }}>
          <h2 className="auth-title" style={{ textAlign: 'left' }}>
            Forge a New Assessment
          </h2>
          <p className="auth-subtitle" style={{ textAlign: 'left' }}>
            Provide the details to generate a customized MCQ assessment.
          </p>

          {error && <div className="error-msg">{error}</div>}

          <form
            onSubmit={handleCreateQuiz}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
            }}
          >
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Quiz Title *</label>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '16px' }}
                placeholder="e.g., advanced HTML5 Elements"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                style={{
                  paddingLeft: '16px',
                  minHeight: '80px',
                  fontFamily: 'inherit',
                }}
                placeholder="Provide details about the focus area, difficulty, and rules..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '16px' }}
                placeholder="e.g., Programming"
                value={quizCategory}
                onChange={(e) => setQuizCategory(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Difficulty</label>
              <select
                className="select-filter"
                style={{
                  height: '48px',
                  width: '100%',
                  background: 'var(--bg-input)',
                }}
                value={quizDifficulty}
                onChange={(e) => setQuizDifficulty(e.target.value as any)}
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Duration (Minutes) *</label>
              <input
                type="number"
                className="form-input"
                style={{ paddingLeft: '16px' }}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Total Marks *</label>
              <input
                type="number"
                className="form-input"
                style={{ paddingLeft: '16px' }}
                value={totalMarks}
                onChange={(e) => setTotalMarks(Number(e.target.value))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Passing Marks</label>
              <input
                type="number"
                className="form-input"
                style={{ paddingLeft: '16px' }}
                value={passMarks}
                onChange={(e) => setPassMarks(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Negative Marking (Penalty per Wrong Answer)</label>
              <select
                className="select-filter"
                style={{
                  height: '48px',
                  width: '100%',
                  background: 'var(--bg-input)',
                }}
                value={negativeMarks}
                onChange={(e) => setNegativeMarks(e.target.value)}
              >
                <option value="0.00">No Penalty (0.00)</option>
                <option value="0.25">Quarter Point (0.25)</option>
                <option value="0.50">Half Point (0.50)</option>
                <option value="1.00">Full Point (1.00)</option>
              </select>
            </div>

            <div
              style={{
                gridColumn: 'span 2',
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                marginTop: '12px',
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowCreateForm(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <div className="spinner" /> : <span>Forge Quiz</span>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Catalog Filters */}
      <div className="filters-wrapper">
        <div className="filters-group">
          <Filter size={18} style={{ color: 'var(--primary)' }} />
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Filters:
          </span>

          <select
            className="select-filter"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat || ''}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          <select
            className="select-filter"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="All">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
        <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredQuizzes.length}</strong> forged assessments
        </div>
      </div>

      {isLoading ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '80px',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          <div className="spinner" style={{ borderTopColor: 'var(--primary)' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Fetching forged assessments...</span>
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            marginTop: '80px',
            background: 'var(--bg-card)',
            padding: '60px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
          }}
        >
          <ShieldAlert size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '20px', color: 'var(--text-primary)' }}>No Quizzes Found</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
            Adjust your catalog filters or forge a new quiz to start testing.
          </p>
        </div>
      ) : (
        <div className="quiz-grid">
          {filteredQuizzes.map((quiz) => (
            <div key={quiz.id} className="quiz-card">
              <span className={`quiz-badge badge-${quiz.difficulty.toLowerCase()}`}>
                {quiz.difficulty}
              </span>
              <h2
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  marginBottom: '8px',
                  color: 'var(--text-primary)',
                }}
              >
                {quiz.title}
              </h2>
              {quiz.description && (
                <p
                  style={{
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    marginBottom: '24px',
                    lineHeight: '145%',
                  }}
                >
                  {quiz.description}
                </p>
              )}

              {Number(quiz.negativeMarks) > 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(239, 68, 68, 0.08)',
                    borderLeft: '3px solid var(--error)',
                    padding: '10px 12px',
                    borderRadius: '4px',
                    marginBottom: '20px',
                    fontSize: '13px',
                    color: 'var(--error)',
                    fontWeight: 500,
                  }}
                >
                  <ShieldAlert size={14} />
                  <span>Negative Marking: {quiz.negativeMarks} penalty per error</span>
                </div>
              )}

              <div className="quiz-meta">
                <div className="quiz-meta-item">
                  <Clock size={16} />
                  <span>{quiz.durationMinutes} Mins</span>
                </div>
                <div className="quiz-meta-item">
                  <BookOpen size={16} />
                  <span>{quiz.category || 'General'}</span>
                </div>
                <div className="quiz-meta-item" style={{ marginLeft: 'auto' }}>
                  <Award size={16} style={{ color: 'var(--primary)' }} />
                  <span>
                    <strong>{quiz.totalMarks}</strong> Marks
                  </span>
                </div>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '24px' }}
                onClick={() => handleStartQuiz(quiz.id, quiz.durationMinutes)}
                disabled={startingQuizId !== null}
              >
                {startingQuizId === quiz.id ? (
                  <div className="spinner" />
                ) : (
                  <span>Start Assessment</span>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default QuizzesPage
