import React, { useState } from 'react'
import authStore from '../../store/authStore'
import api from '../../lib/axios'
import { User, Mail, Lock, Image, AlertCircle } from 'lucide-react'

interface RegisterPageProps {
  onNavigateToLogin: () => void
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigateToLogin }) => {
  const { setAuth } = authStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name || !email || !password) {
      setError('Please fill in all required fields')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        avatarUrl: avatarUrl || undefined,
      })
      setAuth(response.data.token, response.data.user)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to register. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-card">
      <h1 className="auth-title">Create Account</h1>
      <p className="auth-subtitle">Join QuizForge to start creating assessments and scaling your tests.</p>

      {error && (
        <div className="error-msg">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <div className="form-input-wrapper">
            <input
              type="text"
              className="form-input"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
            <User className="form-input-icon" size={18} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Email Address *</label>
          <div className="form-input-wrapper">
            <input
              type="email"
              className="form-input"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
            <Mail className="form-input-icon" size={18} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Password *</label>
          <div className="form-input-wrapper">
            <input
              type="password"
              className="form-input"
              placeholder="•••••••• (Min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            <Lock className="form-input-icon" size={18} />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '32px' }}>
          <label className="form-label">Avatar URL (Optional)</label>
          <div className="form-input-wrapper">
            <input
              type="url"
              className="form-input"
              placeholder="https://images.unsplash.com/..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              disabled={loading}
            />
            <Image className="form-input-icon" size={18} />
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', height: '48px' }}
          disabled={loading}
        >
          {loading ? <div className="spinner" /> : <span>Sign Up</span>}
        </button>
      </form>

      <div className="auth-footer">
        Already have an account?{' '}
        <a
          href="#"
          className="auth-link"
          onClick={(e) => {
            e.preventDefault()
            onNavigateToLogin()
          }}
        >
          Sign in instead
        </a>
      </div>
    </div>
  )
}

export default RegisterPage
