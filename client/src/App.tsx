import { useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import queryClient from './lib/queryClient'
import authStore from './store/authStore'
import Navbar from './components/shared/Navbar'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import './index.css'

function App() {
  const { user, token } = authStore()
  const [view, setView] = useState<'login' | 'register'>('login')

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-bg-glow" />
      <div className="layout-container">
        <Navbar />

        <main className="auth-wrapper">
          {token && user ? (
            <div className="auth-card" style={{ maxWidth: '600px', textAlign: 'center' }}>
              <h1 className="auth-title">Welcome, {user.name}!</h1>
              <p className="auth-subtitle">
                You are successfully signed in as <strong>{user.role}</strong>.
              </p>
              <div
                style={{
                  marginTop: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <p style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>
                  This completes **Stage 1 (Database, Drizzle Schemas, JWT Auth, and Sleek Client-Side Auth Interface)**.
                </p>
                <div
                  style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'center',
                    marginTop: '12px',
                  }}
                >
                  <div className="btn btn-primary" style={{ cursor: 'default' }}>
                    API Connected
                  </div>
                  <div className="btn btn-secondary" style={{ cursor: 'default' }}>
                    Token Active
                  </div>
                </div>
              </div>
            </div>
          ) : view === 'login' ? (
            <LoginPage onNavigateToRegister={() => setView('register')} />
          ) : (
            <RegisterPage onNavigateToLogin={() => setView('login')} />
          )}
        </main>
      </div>
    </QueryClientProvider>
  )
}

export default App
