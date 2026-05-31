import React from 'react'
import useAttemptResult from '@/hooks/useAttemptResult'
import navigationStore from '@/store/navigationStore'
import { Award, Clock, ArrowLeft, CheckCircle2, XCircle, AlertCircle, AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const ResultDetailPage: React.FC = () => {
  const { selectedAttemptId, setView } = navigationStore()
  const { data: result, isLoading, error } = useAttemptResult(selectedAttemptId)

  const [animatedScore, setAnimatedScore] = React.useState(0)

  React.useEffect(() => {
    if (!result) return

    const targetScore = parseFloat(result.attempt.score || '0')
    if (targetScore === 0) {
      return
    }

    let startTimestamp: number | null = null
    const duration = 1200 // 1.2s count up animation matching design.md

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp
      const elapsed = timestamp - startTimestamp
      const progress = Math.min(elapsed / duration, 1)
      const easeOutQuad = progress * (2 - progress) // Smooth decelerating easing

      const currentScore = parseFloat((easeOutQuad * targetScore).toFixed(2))
      setAnimatedScore(currentScore)

      if (progress < 1) {
        window.requestAnimationFrame(step)
      } else {
        setAnimatedScore(targetScore)
      }
    }

    const animFrame = window.requestAnimationFrame(step)
    return () => window.cancelAnimationFrame(animFrame)
  }, [result])

  if (isLoading) {
    return (
      <div className="py-32 text-center flex flex-col items-center justify-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center justify-center bg-linear-to-br from-primary to-blue-400 text-white w-10 h-10 rounded-md font-extrabold text-sm animate-spin">
          Q
        </div>
        <span>Analyzing attempt results...</span>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="py-24 text-center max-w-[480px] mx-auto space-y-6">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Failed to Load Results</h2>
          <p className="text-sm text-muted-foreground">
            {error?.message || 'The requested attempt record could not be retrieved.'}
          </p>
        </div>
        <Button variant="outline" className="cursor-pointer border-border" onClick={() => setView('dashboard')}>
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          <span>Back to Dashboard</span>
        </Button>
      </div>
    )
  }

  const { attempt, quiz, breakdown } = result
  const scoreNum = parseFloat(attempt.score || '0')
  const totalNum = attempt.totalMarks || quiz.totalMarks

  const animatedPercentage = Math.round((animatedScore / totalNum) * 100)

  // Stats calculations
  const totalQuestions = breakdown.length
  const correctCount = breakdown.filter(item => item.userAnswer?.isCorrect).length
  const answeredCount = breakdown.filter(item => item.userAnswer?.optionId).length
  const skippedCount = totalQuestions - answeredCount
  const wrongCount = answeredCount - correctCount

  // Format time taken
  const formatTime = (seconds: number | null | undefined) => {
    if (seconds == null) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const isPassingScore = scoreNum >= (quiz.passMarks ?? totalNum * 0.5)

  return (
    <div className="space-y-8 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-300 mt-6">
      {/* Top Navigation Row */}
      <div>
        <Button
          variant="outline"
          onClick={() => setView('dashboard')}
          className="cursor-pointer border-border gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Button>
      </div>

      {/* Main Glassmorphic Summary Card */}
      <Card className="border border-border bg-card shadow-sm overflow-hidden p-6 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-8 items-center">
          <div className="space-y-6">
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full"
            >
              Assessment Completed
            </Badge>
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                {quiz.title}
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {quiz.description || 'No description provided for this assessment.'}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 bg-muted/30 border border-border p-4 rounded-lg">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Time Taken</span>
                <span className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-primary" />
                  {formatTime(attempt.timeTaken)}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Accuracy</span>
                <span className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-primary" />
                  {totalQuestions > 0 ? `${Math.round((correctCount / totalQuestions) * 100)}%` : '0%'}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Status</span>
                <Badge
                  variant="outline"
                  className={`text-[9px] font-extrabold tracking-wide uppercase px-2 py-0.5 border ${
                    attempt.status === 'SUBMITTED'
                      ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30'
                      : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30'
                  }`}
                >
                  {attempt.status === 'SUBMITTED' ? 'SUBMITTED' : 'TIMED OUT'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Big Score Circular Ring Badge */}
          <div className="flex flex-col items-center justify-center p-6 border-t md:border-t-0 md:border-l border-border space-y-3">
            <div
              className={`w-36 h-36 rounded-full bg-muted/20 border-8 flex flex-col items-center justify-center shadow-sm ${
                isPassingScore ? 'border-green-500' : 'border-destructive'
              }`}
            >
              <span className="text-4xl font-black text-foreground tracking-tight">
                {animatedScore}
              </span>
              <span className="text-[10px] text-muted-foreground font-semibold">
                out of {totalNum}
              </span>
            </div>
            <div className="text-center">
              <span className="text-base font-extrabold text-foreground block">
                {animatedPercentage}% Score
              </span>
              <span className="text-xs text-muted-foreground mt-0.5 block">
                Passing Marks: {quiz.passMarks ?? 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Answer Breakdown Header / Quick Stats */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Question-by-Question Analysis
        </h2>

        <div className="grid grid-cols-3 gap-4">
          <Card className="flex items-center gap-3 p-4 border border-border bg-card shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Correct</span>
              <span className="text-base font-bold text-foreground">{correctCount}</span>
            </div>
          </Card>

          <Card className="flex items-center gap-3 p-4 border border-border bg-card shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Wrong</span>
              <span className="text-base font-bold text-foreground">{wrongCount}</span>
            </div>
          </Card>

          <Card className="flex items-center gap-3 p-4 border border-border bg-card shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Skipped</span>
              <span className="text-base font-bold text-foreground">{skippedCount}</span>
            </div>
          </Card>
        </div>
      </div>

      {/* List of Questions & Selections */}
      <div className="flex flex-col gap-6">
        {breakdown.map((item, index) => {
          const isCorrect = item.userAnswer?.isCorrect ?? false
          const isAnswered = !!item.userAnswer?.optionId
          const userOptionId = item.userAnswer?.optionId

          let borderTheme = 'border-border'
          let badgeText = 'Unanswered'
          let badgeClass = 'bg-muted text-muted-foreground'

          if (isAnswered) {
            if (isCorrect) {
              borderTheme = 'border-green-500/30'
              badgeText = 'Correct'
              badgeClass = 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/20 border'
            } else {
              borderTheme = 'border-destructive/30'
              badgeText = 'Incorrect'
              badgeClass = 'bg-destructive/10 text-destructive border-destructive/20 border'
            }
          }

          return (
            <Card
              key={item.question.id}
              className={`p-6 md:p-8 border-2 bg-card shadow-sm ${borderTheme}`}
            >
              <div className="flex justify-between items-start gap-4 mb-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
                  Question {index + 1} of {totalQuestions}
                </span>

                <div className="flex gap-2 items-center">
                  <Badge className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${badgeClass}`}>
                    {badgeText}
                  </Badge>

                  <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-muted/40 text-muted-foreground border-border">
                    {item.userAnswer
                      ? `${parseFloat(item.userAnswer.marksEarned) >= 0 ? '+' : ''}${item.userAnswer.marksEarned} Marks`
                      : '0.00 Marks'}
                  </Badge>
                </div>
              </div>

              <h3 className="text-lg font-bold text-foreground leading-relaxed mb-6">
                {item.question.text}
              </h3>

              <div className="flex flex-col gap-3">
                {item.options.map((opt) => {
                  const isUserSelection = opt.id === userOptionId
                  const isCorrectOption = opt.isCorrect

                  let optionBorder = 'border-border'
                  let optionBg = 'bg-card'
                  let optionTextClass = 'text-foreground'
                  let iconElement = null

                  if (isCorrectOption) {
                    optionBorder = 'border-green-500'
                    optionBg = 'bg-green-50/30 dark:bg-green-950/10'
                    optionTextClass = 'text-green-700 dark:text-green-400 font-bold'
                    iconElement = <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 ml-auto" />
                  } else if (isUserSelection && !isCorrectOption) {
                    optionBorder = 'border-destructive'
                    optionBg = 'bg-destructive/5'
                    optionTextClass = 'text-destructive font-bold'
                    iconElement = <XCircle className="h-4 w-4 text-destructive ml-auto" />
                  }

                  return (
                    <div
                      key={opt.id}
                      className={`flex items-center px-4 py-3.5 text-xs md:text-sm font-medium rounded-md border transition-colors duration-150 ${optionBorder} ${optionBg} ${optionTextClass}`}
                    >
                      <span>{opt.text}</span>
                      {isUserSelection && (
                        <span
                          className={`text-[9px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded ml-3 ${
                            isCorrectOption
                              ? 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400'
                              : 'bg-destructive/20 text-destructive'
                          }`}
                        >
                          Your Pick
                        </span>
                      )}
                      {iconElement}
                    </div>
                  )
                })}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default ResultDetailPage
