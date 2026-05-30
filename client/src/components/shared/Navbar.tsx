import React from 'react'
import authStore from '../../store/authStore'
import navigationStore from '../../store/navigationStore'
import ThemeToggle from './ThemeToggle'
import { LogOut, User as UserIcon, BookOpen, Trophy, LayoutDashboard } from 'lucide-react'

const Navbar: React.FC = () => {
  const { user, logout } = authStore()
  const { view, setView } = navigationStore()

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setView('catalog')
  }

  return (
    <header className="navbar">
      <a href="/" className="logo-container" onClick={handleLogoClick}>
        <div className="logo-icon">Q</div>
        <span>QuizForge</span>
      </a>

      {user && (
        <nav style={{ display: 'flex', gap: '8px', marginLeft: '24px', marginRight: 'auto' }}>
          <button
            className={`btn ${view === 'catalog' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setView('catalog')}
            style={{ padding: '8px 14px', fontSize: '13px', gap: '6px' }}
          >
            <BookOpen size={14} />
            <span>Assessments</span>
          </button>
          <button
            className={`btn ${view === 'leaderboard' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setView('leaderboard')}
            style={{ padding: '8px 14px', fontSize: '13px', gap: '6px' }}
          >
            <Trophy size={14} />
            <span>Leaderboard</span>
          </button>
          <button
            className={`btn ${view === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setView('dashboard')}
            style={{ padding: '8px 14px', fontSize: '13px', gap: '6px' }}
          >
            <LayoutDashboard size={14} />
            <span>Dashboard</span>
          </button>
        </nav>
      )}

      <div className="nav-links">
        <ThemeToggle />
        {user ? (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginLeft: '12px',
              }}
            >
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
                }}
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt=""
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <UserIcon size={16} />
                )}
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>{user.name}</span>
            </div>
            <button
              className="btn btn-secondary"
              onClick={logout}
              style={{ padding: '8px 16px', marginLeft: '12px' }}
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </>
        ) : null}
      </div>
    </header>
  )
}

export default Navbar
