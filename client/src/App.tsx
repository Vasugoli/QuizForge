import { useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import queryClient from './lib/queryClient'
import authStore from './store/authStore'
import Navbar from './components/shared/Navbar'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import QuizzesPage from './pages/quizzes/QuizzesPage'
import './index.css'

function App() {
  const { user, token } = authStore()
  const [view, setView] = useState<'login' | 'register'>('login')

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-bg-glow" />
      <div className="layout-container">
        <Navbar />

        <main
          className="auth-wrapper"
          style={{ flexDirection: 'column', alignItems: 'stretch' }}
        >
          {token && user ? (
            <QuizzesPage />
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
