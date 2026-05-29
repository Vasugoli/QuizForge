import React, { useState } from 'react'
import authStore from '../../store/authStore'
import api from '../../lib/axios'
import { Mail, Lock, AlertCircle } from 'lucide-react'

interface LoginPageProps {
  onNavigateToRegister: () => void
}

const LoginPage: React.FC<LoginPageProps> = ({ onNavigateToRegister }) => {
  const { setAuth } = authStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/auth/login', { email, password })
      setAuth(response.data.token, response.data.user)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to login. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-card">
      <h1 className="auth-title">Welcome Back</h1>
      <p className="auth-subtitle">Sign in to check your metrics and start forging quizzes.</p>

      {error && (
        <div className="error-msg">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <div className="form-input-wrapper">
            <input
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
            <Mail className="form-input-icon" size={18} />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '32px' }}>
          <label className="form-label">Password</label>
          <div className="form-input-wrapper">
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            <Lock className="form-input-icon" size={18} />
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', height: '48px' }}
          disabled={loading}
        >
          {loading ? <div className="spinner" /> : <span>Sign In</span>}
        </button>
      </form>

      <div className="auth-footer">
        Don't have an account?{' '}
        <a
          href="#"
          className="auth-link"
          onClick={(e) => {
            e.preventDefault()
            onNavigateToRegister()
          }}
        >
          Sign up now
        </a>
      </div>
    </div>
  )
}

export default LoginPage
