import React, { useState, useEffect } from 'react'
import quizSessionStore from '@/store/quizSessionStore'
import useAttempt from '@/hooks/useAttempt'
import QuizTimer from '@/components/quiz/QuizTimer'
import { ChevronLeft, ChevronRight, AlertTriangle, ShieldAlert, Check, Loader2 } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface QuizAttemptPageProps {
  quizTitle: string
  negativeMarks: string
  onCompleteAttempt: (resultData: any) => void
}

const QuizAttemptPage: React.FC<QuizAttemptPageProps> = ({
  quizTitle,
  negativeMarks,
  onCompleteAttempt,
}) => {
  const { attemptId, questions, answers, timeLeft, setAnswer, clearSession } = quizSessionStore()
  const { saveAnswer, submitAttempt, isSubmitting } = useAttempt()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [warnings, setWarnings] = useState(0)
  const [showWarningModal, setShowWarningModal] = useState(false)
  const [totalTime] = useState(timeLeft) // Capture initial time limits for progress bar percentage

  const activeQuestion = questions[currentIndex]

  const handleForceSubmit = React.useCallback(async () => {
    if (!attemptId) return
    const payload = Object.entries(answers).map(([qId, optId]) => ({
      questionId: qId,
      optionId: optId,
    }))
    try {
      const res = await submitAttempt({ attemptId, answers: payload })
      clearSession()
      onCompleteAttempt(res)
    } catch {
      alert('Attempt submission failed. Please try again.')
    }
  }, [attemptId, answers, submitAttempt, clearSession, onCompleteAttempt])

  const handleSelectOption = React.useCallback(async (optionId: string) => {
    if (!attemptId || !activeQuestion) return

    // Update locally immediately
    setAnswer(activeQuestion.id, optionId)

    // Save in background
    try {
      await saveAnswer({
        attemptId,
        questionId: activeQuestion.id,
        optionId,
      })
    } catch {
      console.error('Failed to save answer in background')
    }
  }, [attemptId, activeQuestion, setAnswer, saveAnswer])

  // Tab switch proctoring warning detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setWarnings((prev) => prev + 1)
        setShowWarningModal(true)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // Auto-submit on timer expiry
  useEffect(() => {
    if (timeLeft <= 0 && attemptId) {
      handleForceSubmit()
    }
  }, [timeLeft, attemptId, handleForceSubmit])

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return
      }

      if (e.key === 'ArrowLeft') {
        if (currentIndex > 0) {
          setCurrentIndex((prev) => prev - 1)
        }
      } else if (e.key === 'ArrowRight') {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex((prev) => prev + 1)
        }
      } else if (['1', '2', '3', '4'].includes(e.key)) {
        const optionIdx = parseInt(e.key, 10) - 1
        if (activeQuestion && activeQuestion.options[optionIdx]) {
          handleSelectOption(activeQuestion.options[optionIdx].id)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, activeQuestion, questions, handleSelectOption])

  const handleClearAnswer = async () => {
    if (!attemptId || !activeQuestion) return

    // Update locally immediately
    setAnswer(activeQuestion.id, null)

    // Save in background
    try {
      await saveAnswer({
        attemptId,
        questionId: activeQuestion.id,
        optionId: null,
      })
    } catch {
      console.error('Failed to clear answer in background')
    }
  }

  const handleSubmit = async () => {
    const unansweredCount = Object.values(answers).filter((val) => val === null).length
    const confirmMessage = unansweredCount > 0
      ? `Are you sure? You have ${unansweredCount} unanswered questions.`
      : 'Are you sure you want to submit your assessment?'

    if (window.confirm(confirmMessage)) {
      await handleForceSubmit()
    }
  }

  const handlePrevent = (e: React.SyntheticEvent) => {
    e.preventDefault()
  }

  if (!activeQuestion) {
    return (
      <div className="py-20 text-center text-muted-foreground text-sm">
        <span>Loading active assessment session...</span>
      </div>
    )
  }

  // Calculate percentage remaining for the proctoring progress bar
  const percentRemaining = totalTime > 0 ? (timeLeft / totalTime) * 100 : 0

  return (
    <div
      onCopy={handlePrevent}
      onPaste={handlePrevent}
      onCut={handlePrevent}
      onContextMenu={handlePrevent}
      className="select-none grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 mt-4 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      {/* Quiz Attempt Container */}
      <div className="flex flex-col gap-6">
        <Card className="flex flex-col border border-border bg-card shadow-sm overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold tracking-tight text-foreground">{quizTitle}</CardTitle>
              {Number(negativeMarks) > 0 && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-destructive uppercase tracking-wide">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span>Negative marking: {negativeMarks} penalty per error</span>
                </div>
              )}
            </div>
            <QuizTimer />
          </CardHeader>
          <Progress value={percentRemaining} className="h-1 rounded-none bg-muted" />
        </Card>

        {/* Active Question Box */}
        <Card className="p-6 md:p-10 border border-border bg-card shadow-sm relative space-y-6">
          <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
            <span>
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span>{activeQuestion.marks} Marks</span>
          </div>

          <h3 className="text-xl md:text-2xl font-bold text-foreground leading-relaxed">
            {activeQuestion.text}
          </h3>

          <div className="flex flex-col gap-3">
            {activeQuestion.options.map((opt, index) => {
              const isSelected = answers[activeQuestion.id] === opt.id
              const labelLetter = String.fromCharCode(65 + index) // A, B, C, D
              return (
                <button
                  key={opt.id}
                  type="button"
                  className={`w-full flex items-center justify-start px-5 py-4 text-sm font-medium rounded-lg border text-left transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-primary/5 text-primary border-primary shadow-sm'
                      : 'bg-card text-foreground border-border hover:bg-muted/30'
                  }`}
                  onClick={() => handleSelectOption(opt.id)}
                >
                  <div
                    className={`flex items-center justify-center h-6 w-6 rounded-full border text-xs font-bold shrink-0 mr-3 transition-colors duration-200 ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-muted-foreground text-muted-foreground bg-transparent'
                    }`}
                  >
                    {isSelected ? <Check className="h-3.5 w-3.5" /> : labelLetter}
                  </div>
                  <span>{opt.text}</span>
                </button>
              )
            })}
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-border mt-8">
            <Button
              variant="ghost"
              onClick={handleClearAnswer}
              disabled={answers[activeQuestion.id] === null}
              className="cursor-pointer text-muted-foreground hover:text-foreground"
            >
              Clear Selection
            </Button>
            <div className="flex gap-2.5">
              <Button
                variant="outline"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => prev - 1)}
                className="cursor-pointer border-border"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              {currentIndex < questions.length - 1 ? (
                <Button
                  variant="outline"
                  onClick={() => setCurrentIndex((prev) => prev + 1)}
                  className="cursor-pointer border-border"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="cursor-pointer shadow-sm"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span>Finish Attempt</span>
                  )}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Navigation & Info Panel */}
      <div className="flex flex-col gap-6">
        {/* Navigation grid */}
        <Card className="p-5 border border-border bg-card shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border pb-3">
            Question Map
          </h4>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const isAnswered = answers[q.id] !== null
              const isActive = idx === currentIndex
              return (
                <button
                  key={q.id}
                  type="button"
                  className={`h-10 rounded-md border font-mono text-sm font-bold flex items-center justify-center cursor-pointer transition-all duration-200 ${
                    isAnswered
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : isActive
                      ? 'bg-primary/5 text-primary border-primary'
                      : 'bg-card text-foreground border-border hover:bg-muted/40'
                  }`}
                  onClick={() => setCurrentIndex(idx)}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>

          <div className="pt-2 flex flex-col gap-2 text-[11px] text-muted-foreground font-medium">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary border border-primary" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-card border border-border" />
              <span>Unanswered / Skipped</span>
            </div>
          </div>
        </Card>

        {/* Integrity status */}
        <Card
          className={`p-5 border-l-4 shadow-sm space-y-2 bg-card ${
            warnings > 0 ? 'border-l-destructive border border-border' : 'border-l-green-600 border border-border'
          }`}
        >
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Integrity Guard
          </h4>
          <p className="text-xs font-semibold">
            {warnings === 0 ? (
              <span className="text-green-600 dark:text-green-400">
                Active - Perfect standing
              </span>
            ) : (
              <span className="text-destructive">
                {warnings} Tab-Switch Warning{warnings > 1 && 's'} logged!
              </span>
            )}
          </p>
        </Card>
      </div>

      {/* Visibility warning alert dialog */}
      <Dialog open={showWarningModal} onOpenChange={setShowWarningModal}>
        <DialogContent className="sm:max-w-[420px] bg-card border border-border p-6 text-center space-y-4">
          <DialogHeader className="flex flex-col items-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-2" />
            <DialogTitle className="text-lg font-bold text-destructive">Integrity Alert!</DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            You have switched windows or tabs. Switch actions are automatically logged for
            proctoring reports. Further switches may disqualify this attempt.
          </DialogDescription>
          <DialogFooter className="flex justify-center sm:justify-center">
            <Button
              className="w-full cursor-pointer shadow-sm"
              onClick={() => setShowWarningModal(false)}
            >
              Resume Assessment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default QuizAttemptPage
