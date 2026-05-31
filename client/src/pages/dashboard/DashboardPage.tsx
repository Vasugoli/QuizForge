import React from 'react'
import useAttempt from '@/hooks/useAttempt'
import authStore from '@/store/authStore'
import navigationStore from '@/store/navigationStore'
import Avatar from 'boring-avatars'
import { Award, Clock, Calendar, ChevronRight, Sparkles, BookOpen, CheckCircle2, History } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

const DashboardPage: React.FC = () => {
  const { user } = authStore()
  const { attempts, isAttemptsLoading } = useAttempt()
  const { setView } = navigationStore()

  // Filter only finalized attempts for statistics
  const submittedAttempts = attempts.filter((att) => att.status === 'SUBMITTED' || att.status === 'TIMED_OUT')

  // Computations
  const totalAttempts = submittedAttempts.length

  const totalScore = submittedAttempts.reduce((sum, att) => sum + parseFloat(att.score || '0'), 0)
  const totalMax = submittedAttempts.reduce((sum, att) => sum + (att.totalMarks || att.quiz?.totalMarks || 10), 0)

  const avgAccuracy = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0

  const avgSpeed = totalAttempts > 0
    ? Math.round(submittedAttempts.reduce((sum, att) => sum + (att.timeTaken || 0), 0) / totalAttempts)
    : 0

  // Format time taken
  const formatTime = (seconds: number | null | undefined) => {
    if (seconds == null) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  // Format date
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  // Render dynamic custom SVG accuracy gauge
  const renderAccuracyGauge = (accuracy: number) => {
    const radius = 50
    const circumference = Math.PI * radius // Half circle
    const strokeDashoffset = circumference - (accuracy / 100) * circumference

    return (
      <div className="flex flex-col items-center justify-center relative w-full h-[140px]">
        <svg width="160" height="100" className="translate-y-[15px]">
          <defs>
            <linearGradient id="gauge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--accent-foreground))" />
              <stop offset="100%" stopColor="hsl(var(--primary))" />
            </linearGradient>
          </defs>
          {/* Background track */}
          <path
            d="M 20 90 A 60 60 0 0 1 140 90"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Foreground colored arc */}
          <path
            d="M 20 90 A 60 60 0 0 1 140 90"
            fill="none"
            stroke="url(#gauge-grad)"
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
          />
        </svg>
        <div className="absolute bottom-[15px] flex flex-col items-center">
          <span className="text-3xl font-extrabold text-foreground tracking-tight">
            {accuracy}%
          </span>
          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
            Avg Accuracy
          </span>
        </div>
      </div>
    )
  }

  // Render elegant custom SVG line chart showing score progression
  const renderProgressChart = () => {
    if (totalAttempts < 2) {
      return (
        <div className="h-[160px] flex items-center justify-center border border-dashed border-border rounded-md p-6 text-center text-muted-foreground">
          <div className="space-y-2">
            <History className="h-6 w-6 mx-auto opacity-50" />
            <p className="text-xs">Progression line chart will unlock once you complete 2 or more assessments.</p>
          </div>
        </div>
      )
    }

    // Map attempts chronologically for the chart
    const sortedAttempts = [...submittedAttempts]
      .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime())
      .slice(-6) // Limit to last 6 attempts for clarity

    const dataPoints = sortedAttempts.map((att) => {
      const score = parseFloat(att.score || '0')
      const max = att.totalMarks || att.quiz?.totalMarks || 10
      return Math.round((score / max) * 100)
    })

    const chartWidth = 500
    const chartHeight = 150
    const paddingLeft = 40
    const paddingRight = 20
    const paddingTop = 20
    const paddingBottom = 20

    const graphWidth = chartWidth - paddingLeft - paddingRight
    const graphHeight = chartHeight - paddingTop - paddingBottom

    const stepX = graphWidth / (dataPoints.length - 1)

    // Construct path coordinates
    const coords = dataPoints.map((val, i) => {
      const x = paddingLeft + i * stepX
      const y = paddingTop + graphHeight - (val / 100) * graphHeight
      return { x, y, value: val }
    })

    const linePath = coords.reduce((acc, c, i) => {
      return acc + `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`
    }, '')

    const areaPath = linePath + ` L ${coords[coords.length - 1].x} ${paddingTop + graphHeight} L ${coords[0].x} ${paddingTop + graphHeight} Z`

    return (
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} width="100%" height="150" className="block overflow-visible">
          <defs>
            <linearGradient id="chart-area-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={paddingLeft} y1={paddingTop} x2={chartWidth - paddingRight} y2={paddingTop} stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="3 3" />
          <line x1={paddingLeft} y1={paddingTop + graphHeight / 2} x2={chartWidth - paddingRight} y2={paddingTop + graphHeight / 2} stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="3 3" />
          <line x1={paddingLeft} y1={paddingTop + graphHeight} x2={chartWidth - paddingRight} y2={paddingTop + graphHeight} stroke="hsl(var(--border))" strokeWidth="1" />

          {/* Y Axis Labels */}
          <text x={paddingLeft - 10} y={paddingTop + 4} fill="hsl(var(--muted-foreground))" fontSize="9" textAnchor="end" fontWeight="600">100%</text>
          <text x={paddingLeft - 10} y={paddingTop + graphHeight / 2 + 3} fill="hsl(var(--muted-foreground))" fontSize="9" textAnchor="end" fontWeight="600">50%</text>
          <text x={paddingLeft - 10} y={paddingTop + graphHeight + 3} fill="hsl(var(--muted-foreground))" fontSize="9" textAnchor="end" fontWeight="600">0%</text>

          {/* Gradient Fill Area */}
          <path d={areaPath} fill="url(#chart-area-grad)" />

          {/* Main Curved Line */}
          <path d={linePath} fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" />

          {/* Data Nodes */}
          {coords.map((c, i) => (
            <g key={i} className="group">
              <circle cx={c.x} cy={c.y} r="5" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="2.5" />
              <rect x={c.x - 14} y={c.y - 22} width="28" height="14" rx="3" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="0.5" />
              <text x={c.x} y={c.y - 12} fill="hsl(var(--foreground))" fontSize="8" fontWeight="700" textAnchor="middle">{c.value}%</text>
            </g>
          ))}
        </svg>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center h-16 w-16 rounded-full border border-border bg-card overflow-hidden shadow-sm">
            {!user?.avatarUrl || user.avatarUrl.includes('unsplash.com') ? (
              <Avatar
                size={64}
                name={user?.name || 'Participant'}
                variant="beam"
                colors={['#4F6EF7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b']}
              />
            ) : (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Welcome back, {user?.name || 'Forged Participant'}
            </h1>
            <p className="text-sm text-muted-foreground">
              Track your stats, view previous submissions, and climb higher in the ranks.
            </p>
          </div>
        </div>

        <Button
          onClick={() => setView('catalog')}
          className="gap-2 cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <BookOpen className="h-4 w-4" />
          <span>Browse Assessments</span>
        </Button>
      </div>

      {/* Aggregate Score Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4 p-5 shadow-sm border border-border bg-card">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <History className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Assessments Done</span>
            <span className="text-2xl font-bold tracking-tight text-foreground">{totalAttempts}</span>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5 shadow-sm border border-border bg-card">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Avg Accuracy</span>
            <span className="text-2xl font-bold tracking-tight text-foreground">{avgAccuracy}%</span>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5 shadow-sm border border-border bg-card">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Avg Speed</span>
            <span className="text-2xl font-bold tracking-tight text-foreground">{formatTime(avgSpeed)}</span>
          </div>
        </Card>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border border-border bg-card shadow-sm">
          <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground mb-4">Overall Accuracy</h3>
          {isAttemptsLoading ? (
            <div className="h-[140px] flex items-center justify-center text-sm text-muted-foreground">Loading...</div>
          ) : (
            renderAccuracyGauge(avgAccuracy)
          )}
        </Card>

        <Card className="p-6 border border-border bg-card shadow-sm">
          <h3 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground mb-4">Score Progression</h3>
          {isAttemptsLoading ? (
            <div className="h-[150px] flex items-center justify-center text-sm text-muted-foreground">Loading...</div>
          ) : (
            renderProgressChart()
          )}
        </Card>
      </div>

      {/* Attempts History */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          Assessment Attempt History
        </h2>

        {isAttemptsLoading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Retrieving submission logs...
          </div>
        ) : attempts.length === 0 ? (
          <Card className="p-10 text-center border border-border bg-card shadow-sm">
            <History className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-foreground mb-2">No Attempts Registered</h3>
            <p className="text-sm text-muted-foreground mb-6">
              You haven't initiated any assessment attempts yet.
            </p>
            <Button onClick={() => setView('catalog')} className="cursor-pointer shadow-sm">
              Start Forging Now
            </Button>
          </Card>
        ) : (
          <Card className="border border-border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto w-full">
              <Table className="w-full">
                <TableHeader className="bg-muted/50 border-b border-border">
                  <TableRow>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assessment</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Score Secured</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Time Elapsed</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date Completed</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attempts.map((att) => {
                    const scoreStr = att.score ?? '0.00'
                    const totalM = att.totalMarks ?? att.quiz?.totalMarks ?? 10
                    const isPassing = att.quiz?.passMarks != null
                      ? parseFloat(scoreStr) >= att.quiz.passMarks
                      : parseFloat(scoreStr) >= totalM * 0.5

                    return (
                      <TableRow key={att.id} className="hover:bg-muted/30 transition-colors duration-150 border-b border-border">
                        <TableCell className="py-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground">{att.quiz?.title || 'Unknown Assessment'}</span>
                            <span className="text-xs text-muted-foreground mt-1">
                              Category: {att.quiz?.category || 'General'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className={`font-extrabold text-sm ${isPassing ? 'text-green-600 dark:text-green-500' : 'text-destructive'}`}>
                              {att.status === 'IN_PROGRESS' ? '—' : `${att.score} / ${totalM}`}
                            </span>
                            {att.status !== 'IN_PROGRESS' && (
                              <span className="text-[10px] text-muted-foreground mt-1 font-medium uppercase tracking-wider">
                                {isPassing ? 'Passing Grade' : 'Below Passing'}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{att.status === 'IN_PROGRESS' ? '—' : formatTime(att.timeTaken)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              att.status === 'SUBMITTED'
                                ? 'default'
                                : att.status === 'IN_PROGRESS'
                                ? 'secondary'
                                : 'outline'
                            }
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${
                              att.status === 'SUBMITTED'
                                ? 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/30'
                                : att.status === 'IN_PROGRESS'
                                ? 'bg-primary/10 text-primary border-primary/20'
                                : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/30'
                            }`}
                          >
                            {att.status === 'SUBMITTED'
                              ? 'SUBMITTED'
                              : att.status === 'IN_PROGRESS'
                              ? 'IN PROGRESS'
                              : 'TIMED OUT'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{formatDate(att.submittedAt || att.startedAt)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {att.status !== 'IN_PROGRESS' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs gap-1 cursor-pointer border-border hover:bg-muted"
                              onClick={() => setView('result-detail', { attemptId: att.id })}
                            >
                              <span>Analysis</span>
                              <ChevronRight className="h-3 w-3" />
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground font-semibold">Active Session</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

export default DashboardPage
