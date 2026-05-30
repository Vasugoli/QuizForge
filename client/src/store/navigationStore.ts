import { create } from 'zustand'

export type AppView = 'catalog' | 'dashboard' | 'leaderboard' | 'result-detail' | 'admin'

interface NavigationState {
  view: AppView
  selectedAttemptId: string | null
  selectedQuizId: string | null
  setView: (
    view: AppView,
    params?: { attemptId?: string | null; quizId?: string | null }
  ) => void
}

const navigationStore = create<NavigationState>((set) => ({
  view: 'catalog',
  selectedAttemptId: null,
  selectedQuizId: null,
  setView: (view, params) =>
    set({
      view,
      selectedAttemptId: params?.attemptId ?? null,
      selectedQuizId: params?.quizId ?? null,
    }),
}))

export default navigationStore
