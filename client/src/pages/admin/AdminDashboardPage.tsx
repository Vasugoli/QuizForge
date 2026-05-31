import React, { useState, useEffect } from 'react'
import useAdmin from '@/hooks/useAdmin'
import useQuizzes from '@/hooks/useQuizzes'
import api from '@/lib/axios'
import {
  Shield,
  Users,
  BarChart3,
  UploadCloud,
  Download,
  Ban,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Plus,
  BookOpen,
  Clock,
  Search,
  Eye,
  Settings,
  MoreHorizontal,
  GripVertical,
  Trash2,
  CloudLightning,
  Sparkles,
  FileImage,
  Loader2
} from 'lucide-react'
import { Card, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'

const AdminDashboardPage: React.FC = () => {
  const {
    analytics,
    isAnalyticsLoading,
    users,
    isUsersLoading,
    bulkUpload,
    toggleUserBlock,
    exportResultsCSV,
  } = useAdmin()

  const { quizzes } = useQuizzes()

  const [activeTab, setActiveTab] = useState<'analytics' | 'quizzes' | 'users' | 'bulk'>('analytics')

  // Selected Quiz for single question adding UI
  const [selectedQuizForQuestions, setSelectedQuizForQuestions] = useState<any | null>(null)
  const [questionsList, setQuestionsList] = useState<any[]>([])
  const [isQuestionsLoading, setIsQuestionsLoading] = useState(false)
  const [questionsError, setQuestionsError] = useState<string | null>(null)

  // Active question index in the sidebar editor
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0)
  const [editorSearchQuery, setEditorSearchQuery] = useState('')

  useEffect(() => {
    if (selectedQuizForQuestions) {
      document.body.classList.add('admin-editor-mode')
    } else {
      document.body.classList.remove('admin-editor-mode')
    }
    return () => {
      document.body.classList.remove('admin-editor-mode')
    }
  }, [selectedQuizForQuestions])

  // Add/Edit Question form states
  const [questionText, setQuestionText] = useState('')
  const [questionMarks, setQuestionMarks] = useState(1)
  const [optionA, setOptionA] = useState('')
  const [optionB, setOptionB] = useState('')
  const [optionC, setOptionC] = useState('')
  const [optionD, setOptionD] = useState('')
  const [correctOption, setCorrectOption] = useState<'A' | 'B' | 'C' | 'D'>('A')
  const [isRequired, setIsRequired] = useState(true)
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false)
  const [addQuestionError, setAddQuestionError] = useState<string | null>(null)
  const [addQuestionSuccess, setAddQuestionSuccess] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved')

  // Fetch questions handler
  const handleSelectQuiz = async (quiz: any) => {
    setSelectedQuizForQuestions(quiz)
    setIsQuestionsLoading(true)
    setQuestionsError(null)
    setAddQuestionError(null)
    setAddQuestionSuccess(null)
    setSelectedQuestionIndex(0)
    try {
      const response = await api.get(`/quizzes/${quiz.id}/questions`)
      setQuestionsList(response.data.questions)
      
      // Load first question if exists
      if (response.data.questions.length > 0) {
        loadQuestionIntoEditor(response.data.questions[0])
      } else {
        resetForm()
      }
    } catch (err: any) {
      setQuestionsError(err.response?.data?.error || 'Failed to retrieve assessment questions.')
    } finally {
      setIsQuestionsLoading(false)
    }
  }

  const loadQuestionIntoEditor = (q: any) => {
    setQuestionText(q.text)
    setQuestionMarks(q.marks)
    setOptionA(q.options[0]?.text || '')
    setOptionB(q.options[1]?.text || '')
    setOptionC(q.options[2]?.text || '')
    setOptionD(q.options[3]?.text || '')
    
    // Find correct option index
    const correctIdx = q.options.findIndex((o: any) => o.isCorrect)
    if (correctIdx === 0) setCorrectOption('A')
    else if (correctIdx === 1) setCorrectOption('B')
    else if (correctIdx === 2) setCorrectOption('C')
    else if (correctIdx === 3) setCorrectOption('D')
    else setCorrectOption('A')
  }

  const resetForm = () => {
    setQuestionText('')
    setQuestionMarks(1)
    setOptionA('')
    setOptionB('')
    setOptionC('')
    setOptionD('')
    setCorrectOption('A')
    setIsRequired(true)
  }

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddQuestionError(null)
    setAddQuestionSuccess(null)
    setSaveStatus('saving')

    if (!selectedQuizForQuestions) return

    if (!questionText.trim()) {
      setAddQuestionError('Question text is required.')
      setSaveStatus('saved')
      return
    }

    if (!optionA.trim() || !optionB.trim()) {
      setAddQuestionError('At least Option A and Option B are required.')
      setSaveStatus('saved')
      return
    }

    const optionsPayload = [
      { text: optionA.trim(), isCorrect: correctOption === 'A' },
      { text: optionB.trim(), isCorrect: correctOption === 'B' },
    ]

    if (optionC.trim()) {
      optionsPayload.push({ text: optionC.trim(), isCorrect: correctOption === 'C' })
    }
    if (optionD.trim()) {
      optionsPayload.push({ text: optionD.trim(), isCorrect: correctOption === 'D' })
    }

    setIsSubmittingQuestion(true)
    try {
      await api.post(`/quizzes/${selectedQuizForQuestions.id}/questions`, {
        text: questionText.trim(),
        marks: Number(questionMarks),
        orderIndex: questionsList.length,
        options: optionsPayload,
      })

      setAddQuestionSuccess('Question successfully forged into the assessment bank!')
      resetForm()

      // Refresh questions list
      const response = await api.get(`/quizzes/${selectedQuizForQuestions.id}/questions`)
      setQuestionsList(response.data.questions)
      setSelectedQuestionIndex(response.data.questions.length - 1)
      
      if (response.data.questions.length > 0) {
        loadQuestionIntoEditor(response.data.questions[response.data.questions.length - 1])
      }
    } catch (err: any) {
      setAddQuestionError(err.response?.data?.error || 'Failed to save the question.')
    } finally {
      setIsSubmittingQuestion(false)
      setSaveStatus('saved')
    }
  }

  // Bulk Seeder form states
  const [targetQuizId, setTargetQuizId] = useState<string>('')
  const [jsonText, setJsonText] = useState<string>('')
  const [seedError, setSeedError] = useState<string | null>(null)
  const [seedSuccess, setSeedSuccess] = useState<string | null>(null)

  // Toggle user block handler
  const handleToggleBlock = async (userId: string, userName: string) => {
    if (confirm(`Are you sure you want to change the access state of ${userName}?`)) {
      try {
        const res = await toggleUserBlock(userId)
        alert(res.message)
      } catch (err: any) {
        alert(err.response?.data?.error || 'Failed to toggle user block state')
      }
    }
  }

  // Export results CSV handler
  const handleExportCSV = async (quizId: string, quizTitle: string) => {
    try {
      await exportResultsCSV(quizId, quizTitle)
    } catch (err: any) {
      alert(err.message || 'Failed to export results.')
    }
  }

  // Handle Bulk Upload Seeding
  const handleBulkSeeding = async (e: React.FormEvent) => {
    e.preventDefault()
    setSeedError(null)
    setSeedSuccess(null)

    if (!targetQuizId) {
      setSeedError('Please select a target assessment.')
      return
    }

    try {
      const questionsArray = JSON.parse(jsonText)
      if (!Array.isArray(questionsArray) || questionsArray.length === 0) {
        setSeedError('JSON content must be a non-empty array of questions.')
        return
      }

      // Quick validate structure
      for (const q of questionsArray) {
        if (!q.text || !Array.isArray(q.options) || q.options.length < 2) {
          setSeedError('Invalid structure: each question requires "text" and at least 2 "options".')
          return
        }
        const hasCorrect = q.options.some((o: any) => o.isCorrect)
        if (!hasCorrect) {
          setSeedError('Invalid structure: each question requires at least one correct option ("isCorrect": true).')
          return
        }
      }

      const res = await bulkUpload({
        quizId: targetQuizId,
        questions: questionsArray,
      })

      setSeedSuccess(`Forged ${res.insertedCount} questions successfully inside the database bank!`)
      setJsonText('')
    } catch (err: any) {
      if (err instanceof SyntaxError) {
        setSeedError(`JSON Parsing Error: ${err.message}`)
      } else {
        setSeedError(err.response?.data?.error || 'Seeding action failed.')
      }
    }
  }

  // Render SVG Pie Chart for pass/fail ratio
  const renderSVGPassFailPie = (pass: number, fail: number) => {
    const total = pass + fail
    if (total === 0) {
      return (
        <div className="text-muted-foreground text-xs py-10">
          No analytics data submitted.
        </div>
      )
    }

    const passPercentage = Math.round((pass / total) * 100)
    const size = 120
    const radius = 40
    const circumference = 2 * Math.PI * radius
    const passDash = (passPercentage / 100) * circumference

    return (
      <div className="flex items-center gap-8 justify-center py-2">
        <div className="relative" style={{ width: `${size}px`, height: `${size}px` }}>
          <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="hsl(var(--destructive))"
              strokeWidth="12"
              className="opacity-20"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="12"
              strokeDasharray={`${passDash} ${circumference}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-black text-foreground">{passPercentage}%</span>
            <span className="text-[9px] text-muted-foreground font-bold tracking-wider uppercase">PASSING</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-left text-xs font-semibold">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-primary" />
            <span>Passed ({pass})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-destructive/30 border border-destructive/40" />
            <span>Failed ({fail})</span>
          </div>
        </div>
      </div>
    )
  }

  // Render SVG Quiz Attempt volume vertical bar chart
  const renderQuizAttemptsBarChart = (breakdown: any[]) => {
    const activeQuizzes = breakdown.filter(q => q.attemptsCount > 0).slice(0, 5)

    if (activeQuizzes.length === 0) {
      return (
        <div className="h-[120px] flex items-center justify-center text-muted-foreground text-xs">
          No quiz attempt history available.
        </div>
      )
    }

    const maxCount = Math.max(...activeQuizzes.map(q => q.attemptsCount), 5)
    const chartHeight = 110
    const barWidth = 22

    return (
      <div className="flex justify-around items-end h-[110px] border-b border-border pb-2 gap-4 pt-4">
        {activeQuizzes.map((quiz) => {
          const percentage = (quiz.attemptsCount / maxCount) * chartHeight
          return (
            <div key={quiz.id} className="flex flex-col items-center relative group">
              <span className="text-[9px] font-bold text-primary mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute -top-4">
                {quiz.attemptsCount}
              </span>
              <div
                className="bg-primary rounded-t-md hover:bg-primary/95 transition-all duration-300"
                style={{
                  width: `${barWidth}px`,
                  height: `${percentage}px`,
                  boxShadow: '0 4px 10px hsla(var(--primary), 0.15)',
                }}
              />
              <span
                className="text-[9px] font-semibold text-muted-foreground truncate w-14 text-center mt-2"
                title={quiz.title}
              >
                {quiz.title}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  const filteredQuestions = questionsList.filter(q => 
    q.text.toLowerCase().includes(editorSearchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Hide the default tabs, headers, and spacing if active editor matches the image */}
      {!selectedQuizForQuestions ? (
        <>
          {/* Main Dashboard Header */}
          <div className="flex items-center gap-4 mt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-muted text-primary shadow-sm">
              <Shield className="h-6 w-6" />
            </div>
            <div className="text-left space-y-1">
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
                Admin Forge Console
                <Sparkles className="h-5 w-5 text-primary" />
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Oversee assessments performance, upload questions, and manage participant accesses.
              </p>
            </div>
          </div>

          {/* Tab buttons */}
          <div className="flex flex-wrap gap-2 border-b border-border pb-3 mt-6">
            <Button
              variant={activeTab === 'analytics' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('analytics')}
              className="text-xs font-semibold gap-1.5 cursor-pointer"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Platform Overview</span>
            </Button>
            <Button
              variant={activeTab === 'quizzes' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('quizzes')}
              className="text-xs font-semibold gap-1.5 cursor-pointer"
            >
              <BookOpen className="h-4 w-4" />
              <span>Quiz & Questions Manager</span>
            </Button>
            <Button
              variant={activeTab === 'users' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('users')}
              className="text-xs font-semibold gap-1.5 cursor-pointer"
            >
              <Users className="h-4 w-4" />
              <span>Participant Access</span>
            </Button>
            <Button
              variant={activeTab === 'bulk' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('bulk')}
              className="text-xs font-semibold gap-1.5 cursor-pointer"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Bulk Questions Seeder</span>
            </Button>
          </div>

          {/* Analytics tab content */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {isAnalyticsLoading ? (
                <div className="py-12 text-sm text-muted-foreground text-center">Gathering server metrics...</div>
              ) : !analytics ? (
                <div className="py-12 text-sm text-muted-foreground text-center">Failed to load platform metrics.</div>
              ) : (
                <div className="space-y-6">
                  {/* Aggregated indicators */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="flex items-center gap-4 p-5 border border-border bg-card shadow-sm">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Users className="h-6 w-6" />
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Total Users</span>
                        <span className="text-2xl font-bold tracking-tight text-foreground">{analytics.metrics.totalUsers}</span>
                      </div>
                    </Card>
                    <Card className="flex items-center gap-4 p-5 border border-border bg-card shadow-sm">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Total Quizzes</span>
                        <span className="text-2xl font-bold tracking-tight text-foreground">{analytics.metrics.totalQuizzes}</span>
                      </div>
                    </Card>
                    <Card className="flex items-center gap-4 p-5 border border-border bg-card shadow-sm">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <CheckCircle className="h-6 w-6" />
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Total Attempts</span>
                        <span className="text-2xl font-bold tracking-tight text-foreground">{analytics.metrics.totalAttempts}</span>
                      </div>
                    </Card>
                  </div>

                  {/* Graphical details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6 border border-border bg-card shadow-sm text-left">
                      <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground mb-4">Platform Pass / Fail Ratio</CardTitle>
                      {renderSVGPassFailPie(analytics.metrics.passCount, analytics.metrics.failCount)}
                    </Card>

                    <Card className="p-6 border border-border bg-card shadow-sm text-left">
                      <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground mb-4">Top Quiz Attempts Volume</CardTitle>
                      {renderQuizAttemptsBarChart(analytics.quizBreakdown)}
                    </Card>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quiz list manager */}
          {activeTab === 'quizzes' && (
            <Card className="border border-border bg-card shadow-sm p-6 text-left">
              <h2 className="text-lg font-bold tracking-tight text-foreground mb-1">Assessment Bank & Scorecards</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Select a forged assessment to manage questions or download participant scorecards.
              </p>

              <div className="flex flex-col gap-4">
                {quizzes.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic py-4">No quizzes registered inside catalog.</p>
                ) : (
                  quizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border border-border rounded-lg bg-muted/20 hover:border-primary/20 transition-all duration-150 gap-4"
                    >
                      <div className="text-left">
                        <h4 className="font-bold text-sm text-foreground">{quiz.title}</h4>
                        <span className="text-xs text-muted-foreground mt-1 block">
                          Category: {quiz.category || 'General'} | Difficulty: {quiz.difficulty} | Total Marks: {quiz.totalMarks}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSelectQuiz(quiz)}
                          size="sm"
                          className="gap-1.5 cursor-pointer shadow-sm text-xs"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          <span>Manage Questions</span>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleExportCSV(quiz.id, quiz.title)}
                          size="sm"
                          className="gap-1.5 cursor-pointer border-border text-xs"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>CSV Scorecard</span>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}

          {/* Participant access control */}
          {activeTab === 'users' && (
            <Card className="border border-border bg-card shadow-sm p-6 text-left overflow-hidden">
              <h2 className="text-lg font-bold tracking-tight text-foreground mb-1">Access Control Lists</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Block or restore participant login permission states across QuizForge catalog.
              </p>

              {isUsersLoading ? (
                <div className="py-8 text-center text-sm text-muted-foreground">Retrieving accounts database...</div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <Table className="w-full">
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead className="text-xs font-semibold uppercase text-muted-foreground">Participant</TableHead>
                        <TableHead className="text-xs font-semibold uppercase text-muted-foreground">Email Addr</TableHead>
                        <TableHead className="text-xs font-semibold uppercase text-muted-foreground">Role State</TableHead>
                        <TableHead className="text-xs font-semibold uppercase text-muted-foreground">Access Status</TableHead>
                        <TableHead className="text-xs font-semibold uppercase text-muted-foreground text-center">State Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id} className="border-b border-border">
                          <TableCell className="font-semibold text-foreground py-4">{u.name}</TableCell>
                          <TableCell className="text-muted-foreground">{u.email}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-[9px] font-extrabold uppercase ${
                                u.role === 'ADMIN' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground border-border'
                              }`}
                            >
                              {u.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className={`text-xs font-bold ${u.isBlocked ? 'text-destructive' : 'text-green-600 dark:text-green-500'}`}>
                              {u.isBlocked ? 'BLOCKED' : 'ACTIVE'}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            {u.role !== 'ADMIN' ? (
                              <Button
                                variant={u.isBlocked ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleToggleBlock(u.id, u.name)}
                                className={`h-8 text-xs gap-1 cursor-pointer ${
                                  u.isBlocked ? '' : 'text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive'
                                }`}
                              >
                                <Ban className="h-3 w-3" />
                                <span>{u.isBlocked ? 'Unblock' : 'Block'}</span>
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground font-semibold">Protected</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
          )}

          {/* Bulk Seeder */}
          {activeTab === 'bulk' && (
            <Card className="border border-border bg-card shadow-sm p-6 text-left">
              <h2 className="text-lg font-bold tracking-tight text-foreground mb-1">JSON Array Seeder</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Batch forge multiple MCQ questions with option selections atomically.
              </p>

              {seedError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs">{seedError}</AlertDescription>
                </Alert>
              )}

              {seedSuccess && (
                <Alert className="mb-4 bg-green-50 border-green-200 text-green-700 dark:bg-green-950/20 dark:border-green-900/30 dark:text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">{seedSuccess}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleBulkSeeding} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">Target Assessment *</Label>
                  <Select value={targetQuizId} onValueChange={setTargetQuizId}>
                    <SelectTrigger className="h-10 bg-muted/30 border-border text-sm">
                      <SelectValue placeholder="Select target quiz..." />
                    </SelectTrigger>
                    <SelectContent className="bg-card border border-border">
                      {quizzes.map((quiz) => (
                        <SelectItem key={quiz.id} value={quiz.id}>
                          {quiz.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="json-text" className="text-xs font-semibold uppercase text-muted-foreground">JSON Array Content *</Label>
                  <Textarea
                    id="json-text"
                    placeholder={`[
  {
    "text": "What is 2 + 2?",
    "marks": 1,
    "options": [
      { "text": "3", "isCorrect": false },
      { "text": "4", "isCorrect": true }
    ]
  }
]`}
                    className="min-h-[160px] font-mono text-xs bg-muted/30 border-border"
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full h-10 shadow-sm cursor-pointer gap-1.5">
                  <UploadCloud className="h-4 w-4" />
                  <span>Execute Bulk Seeder</span>
                </Button>
              </form>
            </Card>
          )}
        </>
      ) : (
        /* PREMIUM 3-PANE QUIZ EDITOR WORKSPACE (REFERENCE MATCH) */
        <div className="flex flex-col h-[calc(100vh-4rem)] md:h-screen w-full bg-card overflow-hidden animate-in fade-in duration-300">
          
          {/* 1. Header Bar */}
          <div className="h-14 border-b border-border bg-card px-4 flex items-center justify-between shrink-0 select-none">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedQuizForQuestions(null)}
                className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="h-4 w-px bg-border" />
              <span className="text-xs text-muted-foreground font-medium">
                {saveStatus === 'saving' ? 'Saving...' : 'Edited Just now'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-foreground truncate max-w-[200px] sm:max-w-xs md:max-w-md flex items-center gap-1.5">
                <span className="text-base">📝</span>
                {selectedQuizForQuestions.title}
              </span>
              <Badge variant="secondary" className="text-[10px] font-semibold flex items-center gap-1 bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20 py-0.5">
                <CloudLightning className="h-3 w-3 animate-pulse" />
                <span>Live Sync</span>
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {/* User badge mock */}
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground font-black text-xs font-mono">
                RF
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground cursor-pointer">
                <Plus className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground cursor-pointer">
                <Settings className="h-4 w-4" />
              </Button>
              <div className="h-4 w-px bg-border mx-1" />
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1 cursor-pointer border-border font-medium bg-card"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Preview</span>
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs font-semibold cursor-pointer bg-primary text-primary-foreground hover:bg-primary/95"
              >
                Publish
              </Button>
            </div>
          </div>

          {/* 2. Workspace Body (Sidebar + Question Editor) */}
          <div className="flex flex-1 min-h-0 w-full">
            
            {/* 2.1 Sidebar Column: Questions List (250px) */}
            <div className="w-[260px] border-r border-border flex flex-col shrink-0 bg-card select-none">
              
              {/* Sidebar Header */}
              <div className="p-4 flex items-center justify-between border-b border-border shrink-0">
                <span className="text-xs font-black tracking-wider text-foreground font-mono">
                  QUESTION ({questionsList.length})
                </span>
                <Button
                  onClick={resetForm}
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Forge New Blank Question"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Sidebar Search */}
              <div className="px-3 py-2 border-b border-border shrink-0">
                <div className="relative flex items-center">
                  <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Search..."
                    className="pl-8 h-8 text-xs bg-muted/30 border-border focus-visible:ring-primary focus-visible:border-primary"
                    value={editorSearchQuery}
                    onChange={(e) => setEditorSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Scrollable Questions list */}
              <ScrollArea className="flex-1 min-h-0 bg-muted/10">
                <div className="p-3 flex flex-col gap-2.5">
                  {isQuestionsLoading ? (
                    <div className="py-12 text-center text-xs text-muted-foreground animate-pulse">
                      Forging questions list...
                    </div>
                  ) : questionsError ? (
                    <div className="py-8 px-4 text-center text-xs text-destructive bg-destructive/5 rounded-md border border-destructive/10">
                      {questionsError}
                    </div>
                  ) : filteredQuestions.length === 0 ? (
                    <div className="py-12 text-center text-xs text-muted-foreground italic">
                      No questions found.
                    </div>
                  ) : (
                    filteredQuestions.map((q, idx) => {
                      const isActive = idx === selectedQuestionIndex
                      return (
                        <button
                          key={q.id}
                          onClick={() => {
                            setSelectedQuestionIndex(idx)
                            loadQuestionIntoEditor(q)
                          }}
                          className={`w-full text-left p-3 rounded-lg border text-xs transition-all duration-200 cursor-pointer ${
                            isActive
                              ? 'bg-primary/5 text-primary border-primary shadow-sm font-semibold'
                              : 'bg-card text-foreground border-border hover:bg-muted/40'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={`flex items-center justify-center h-4 w-4 rounded font-mono font-bold text-[9px] ${
                              isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                            }`}>
                              {idx + 1}
                            </span>
                            <span className="line-clamp-2 flex-1 font-semibold whitespace-normal break-words">
                              {q.text || 'Untitled Question'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
                            <span>Multiple choice</span>
                            <span className="font-mono">{q.marks} Pts</span>
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>
              </ScrollArea>

              {/* Bottom Result Screen Config Block */}
              <div className="p-3 border-t border-border bg-muted/20 shrink-0">
                <div className="p-3 rounded-lg border border-border bg-card flex gap-2.5 items-center hover:bg-muted/20 transition-colors duration-150 cursor-pointer">
                  <div className="h-8 w-8 rounded bg-muted border border-border flex items-center justify-center text-sm font-bold shadow-sm shrink-0">
                    🏁
                  </div>
                  <div className="text-left min-w-0">
                    <span className="text-[11px] font-bold text-foreground block">Result Screen</span>
                    <span className="text-[9px] text-muted-foreground block truncate">Set passed/failed cards</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2.2 Question Editor Main Card Pane (Flex-1) */}
            <div className="flex-1 flex flex-col min-h-0 bg-card overflow-y-auto">
              
              <form onSubmit={handleAddQuestion} className="w-full max-w-[880px] mx-auto px-6 py-8 space-y-6">
                
                {addQuestionError && (
                  <Alert variant="destructive" className="py-2.5">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-xs font-semibold">{addQuestionError}</AlertDescription>
                  </Alert>
                )}

                {addQuestionSuccess && (
                  <Alert className="py-2.5 bg-green-50 border-green-200 text-green-700 dark:bg-green-950/20 dark:border-green-900/30 dark:text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs font-semibold">{addQuestionSuccess}</AlertDescription>
                  </Alert>
                )}

                <Card className="border-0 bg-transparent shadow-none p-0 space-y-6 relative overflow-hidden">
                  
                  {/* Drag Grip decorative indicator at top center */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center text-muted-foreground/30 pointer-events-none">
                    <GripVertical className="h-4 w-4 rotate-90" />
                  </div>

                  {/* Header parameters row */}
                  <div className="flex items-center justify-between border-b border-border pb-4 select-none">
                    <div className="flex items-center gap-2">
                      {/* Question type select trigger dropdown mockup */}
                      <Select defaultValue="mc">
                        <SelectTrigger className="h-8 text-xs font-semibold border-border bg-muted/20 w-[140px] cursor-pointer">
                          <SelectValue placeholder="Question Type" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border border-border text-xs">
                          <SelectItem value="mc">Multiple choice</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="editor-req" className="text-xs font-semibold text-muted-foreground cursor-pointer">Required</Label>
                        <Switch id="editor-req" checked={isRequired} onCheckedChange={setIsRequired} className="scale-75" />
                      </div>
                      <div className="h-4 w-px bg-border" />
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground cursor-pointer">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Question Text block & Upload box */}
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-4">
                    <div className="space-y-2 text-left">
                      <Label htmlFor="q-edit-txt" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Question {questionsList.length > 0 ? selectedQuestionIndex + 1 : 1}*
                      </Label>
                      <Textarea
                        id="q-edit-txt"
                        placeholder="What does UI stand for in the context of design?"
                        className="min-h-[96px] text-sm bg-muted/20 border-border focus-visible:ring-primary focus-visible:border-primary font-semibold leading-relaxed"
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        required
                      />
                    </div>

                    {/* Premium interactive image container mock */}
                    <div className="flex flex-col items-center justify-center border border-dashed border-border rounded-lg bg-muted/10 p-4 hover:bg-muted/20 hover:border-primary/20 transition-all duration-200 select-none cursor-pointer group text-center h-[126px] mt-6">
                      <FileImage className="h-8 w-8 text-muted-foreground group-hover:text-primary group-hover:scale-105 transition-all duration-200 mb-2 opacity-50" />
                      <span className="text-[10px] font-semibold text-muted-foreground group-hover:text-primary">Click to attach image</span>
                      <span className="text-[8px] text-muted-foreground/60 mt-0.5">PNG, JPG up to 5MB</span>
                    </div>
                  </div>

                  {/* Choices Option Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between select-none">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Choices*
                      </span>
                      <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-semibold">
                        <div className="flex items-center gap-1.5">
                          <Switch disabled className="scale-50" />
                          <span>Multiple answer</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Switch disabled className="scale-50" />
                          <span>Answer with image</span>
                        </div>
                      </div>
                    </div>

                    {/* List of choice rows */}
                    <div className="space-y-3">
                      {/* Option A */}
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="optGroup"
                          checked={correctOption === 'A'}
                          onChange={() => setCorrectOption('A')}
                          className="h-4.5 w-4.5 cursor-pointer accent-primary shrink-0"
                        />
                        <Input
                          placeholder="Option A (Required)"
                          className={`h-10 text-xs bg-muted/20 border-border focus-visible:ring-primary ${
                            correctOption === 'A' ? 'border-primary bg-primary/5 font-semibold text-primary' : ''
                          }`}
                          value={optionA}
                          onChange={(e) => setOptionA(e.target.value)}
                          required
                        />
                        <GripVertical className="h-4 w-4 text-muted-foreground/35 select-none shrink-0" />
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 cursor-pointer">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Option B */}
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="optGroup"
                          checked={correctOption === 'B'}
                          onChange={() => setCorrectOption('B')}
                          className="h-4.5 w-4.5 cursor-pointer accent-primary shrink-0"
                        />
                        <Input
                          placeholder="Option B (Required)"
                          className={`h-10 text-xs bg-muted/20 border-border focus-visible:ring-primary ${
                            correctOption === 'B' ? 'border-primary bg-primary/5 font-semibold text-primary' : ''
                          }`}
                          value={optionB}
                          onChange={(e) => setOptionB(e.target.value)}
                          required
                        />
                        <GripVertical className="h-4 w-4 text-muted-foreground/35 select-none shrink-0" />
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 cursor-pointer">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Option C */}
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="optGroup"
                          checked={correctOption === 'C'}
                          onChange={() => setCorrectOption('C')}
                          className="h-4.5 w-4.5 cursor-pointer accent-primary shrink-0"
                        />
                        <Input
                          placeholder="Option C (Optional)"
                          className={`h-10 text-xs bg-muted/20 border-border focus-visible:ring-primary ${
                            correctOption === 'C' ? 'border-primary bg-primary/5 font-semibold text-primary' : ''
                          }`}
                          value={optionC}
                          onChange={(e) => setOptionC(e.target.value)}
                        />
                        <GripVertical className="h-4 w-4 text-muted-foreground/35 select-none shrink-0" />
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 cursor-pointer">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Option D */}
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="optGroup"
                          checked={correctOption === 'D'}
                          onChange={() => setCorrectOption('D')}
                          className="h-4.5 w-4.5 cursor-pointer accent-primary shrink-0"
                        />
                        <Input
                          placeholder="Option D (Optional)"
                          className={`h-10 text-xs bg-muted/20 border-border focus-visible:ring-primary ${
                            correctOption === 'D' ? 'border-primary bg-primary/5 font-semibold text-primary' : ''
                          }`}
                          value={optionD}
                          onChange={(e) => setOptionD(e.target.value)}
                        />
                        <GripVertical className="h-4 w-4 text-muted-foreground/35 select-none shrink-0" />
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 cursor-pointer">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Dashed Add answers button */}
                    <div className="pt-2 select-none">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-10 border border-dashed border-border hover:bg-muted/30 text-xs gap-1.5 cursor-pointer"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add answers</span>
                      </Button>
                    </div>
                  </div>

                  {/* Bottom details parameters row */}
                  <div className="pt-6 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-4 text-left select-none">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Randomize Order</Label>
                      <Select defaultValue="keep">
                        <SelectTrigger className="h-9 text-xs bg-muted/20 border-border cursor-pointer">
                          <SelectValue placeholder="Randomize Choices" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border border-border text-xs">
                          <SelectItem value="keep">Keep choices in current order</SelectItem>
                          <SelectItem value="rand">Randomize choices order</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="q-dur-mins" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Estimation time</Label>
                      <div className="relative flex items-center">
                        <Input
                          id="q-dur-mins"
                          type="number"
                          defaultValue={2}
                          className="h-9 pr-14 text-xs bg-muted/20 border-border focus-visible:ring-primary"
                        />
                        <div className="absolute right-2 text-[10px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Mins</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="q-marks-point" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Mark as point</Label>
                      <div className="relative flex items-center">
                        <Input
                          id="q-marks-point"
                          type="number"
                          className="h-9 pr-16 text-xs bg-muted/20 border-border focus-visible:ring-primary"
                          value={questionMarks}
                          onChange={(e) => setQuestionMarks(Number(e.target.value))}
                          min={1}
                        />
                        <div className="absolute right-2 text-[10px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1">
                          <span>Points</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 text-xs font-semibold tracking-wider uppercase shadow-sm cursor-pointer"
                    disabled={isSubmittingQuestion}
                  >
                    {isSubmittingQuestion ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Forging Question...
                      </span>
                    ) : (
                      <span>Forge & Save Question</span>
                    )}
                  </Button>
                </Card>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboardPage
