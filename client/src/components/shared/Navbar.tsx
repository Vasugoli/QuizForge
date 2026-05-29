import React from 'react'
import authStore from '../../store/authStore'
import ThemeToggle from './ThemeToggle'
import { LogOut, User as UserIcon } from 'lucide-react'

const Navbar: React.FC = () => {
  const { user, logout } = authStore()

  return (
    <header className="navbar">
      <a href="/" className="logo-container">
        <div className="logo-icon">Q</div>
        <span>QuizForge</span>
      </a>
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
