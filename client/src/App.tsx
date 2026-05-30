import { useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import queryClient from './lib/queryClient'
import authStore from './store/authStore'
import quizSessionStore from './store/quizSessionStore'
import navigationStore from './store/navigationStore'
import Navbar from './components/shared/Navbar'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import QuizzesPage from './pages/quizzes/QuizzesPage'
import QuizAttemptPage from './pages/quizzes/QuizAttemptPage'
import ResultDetailPage from './pages/results/ResultDetailPage'
import LeaderboardPage from './pages/leaderboard/LeaderboardPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import './index.css'

function App() {
  const { user, token } = authStore()
  const { isActive, quizTitle, negativeMarks } = quizSessionStore()
  const { view: activeView, setView: setNavView } = navigationStore()
  const [authView, setAuthView] = useState<'login' | 'register'>('login')

  const renderActiveAuthenticatedPage = () => {
    if (isActive) {
      return (
        <QuizAttemptPage
          quizTitle={quizTitle}
          negativeMarks={negativeMarks}
          onCompleteAttempt={(result) => {
            setNavView('result-detail', { attemptId: result.attempt.id })
          }}
        />
      )
    }

    switch (activeView) {
      case 'catalog':
        return <QuizzesPage />
      case 'leaderboard':
        return <LeaderboardPage />
      case 'dashboard':
        return <DashboardPage />
      case 'result-detail':
        return <ResultDetailPage />
      default:
        return <QuizzesPage />
    }
  }

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
            renderActiveAuthenticatedPage()
          ) : authView === 'login' ? (
            <LoginPage onNavigateToRegister={() => setAuthView('register')} />
          ) : (
            <RegisterPage onNavigateToLogin={() => setAuthView('login')} />
          )}
        </main>
      </div>
    </QueryClientProvider>
  )
}

export default App
