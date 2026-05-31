import { useState, useEffect } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import queryClient from './lib/queryClient'
import authStore from './store/authStore'
import quizSessionStore from './store/quizSessionStore'
import navigationStore from './store/navigationStore'
import themeStore from './store/themeStore'
import Navbar from './components/shared/Navbar'
import ThemeToggle from './components/shared/ThemeToggle'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import QuizzesPage from './pages/quizzes/QuizzesPage'
import QuizAttemptPage from './pages/quizzes/QuizAttemptPage'
import ResultDetailPage from '@/pages/results/ResultDetailPage'
import LeaderboardPage from '@/pages/leaderboard/LeaderboardPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import './index.css'

function App() {
  const { user, token } = authStore()
  const { isActive, quizTitle, negativeMarks } = quizSessionStore()
  const { view: activeView, setView: setNavView } = navigationStore()
  const { theme } = themeStore()
  const [authView, setAuthView] = useState<'login' | 'register'>('login')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

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
      case 'admin':
        return <AdminDashboardPage />
      default:
        return <QuizzesPage />
    }
  }

  const showSidebar = token && user && !isActive;

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-bg-glow" />
      <div className={`min-h-screen w-full flex ${showSidebar ? 'flex-row' : 'flex-col'}`}>
        {showSidebar && <Navbar />}

        <div
          className={`flex-1 min-w-0 flex flex-col min-h-screen transition-all duration-200 ${
            showSidebar ? 'md:pl-60 pt-16 md:pt-0' : 'pl-0'
          }`}
        >
          <main
            className={`w-full grow flex flex-col ${
              showSidebar ? 'max-w-[1285px] mx-auto p-4 md:p-10' : 'p-4 md:p-6'
            }`}
          >
            {token && user ? (
              renderActiveAuthenticatedPage()
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[85vh] w-full relative px-4">
                <div className="fixed top-6 right-6 z-50">
                  <ThemeToggle />
                </div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="flex items-center justify-center bg-linear-to-br from-primary to-blue-400 text-white w-12 h-12 rounded-lg font-black text-xl shadow-md">
                    Q
                  </div>
                  <span className="text-3xl font-extrabold tracking-tight text-foreground">QuizForge</span>
                </div>
                
                {authView === 'login' ? (
                  <LoginPage onNavigateToRegister={() => setAuthView('register')} />
                ) : (
                  <RegisterPage onNavigateToLogin={() => setAuthView('login')} />
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </QueryClientProvider>
  )
}

export default App
