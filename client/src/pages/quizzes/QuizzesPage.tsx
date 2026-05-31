import React, { useState } from 'react'
import useQuizzes from '@/hooks/useQuizzes'
import useAttempt from '@/hooks/useAttempt'
import authStore from '@/store/authStore'
import quizSessionStore from '@/store/quizSessionStore'
import api from '@/lib/axios'
import { BookOpen, Clock, Award, ShieldAlert, Plus, Sparkles, Filter, Loader2, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const QuizzesPage: React.FC = () => {
  const { user } = authStore()
  const { quizzes, isLoading, createQuiz } = useQuizzes()
  const { startAttempt } = useAttempt()
  const { setSession } = quizSessionStore()
  const [startingQuizId, setStartingQuizId] = useState<string | null>(null)

  const handleStartQuiz = async (quizId: string, durationMinutes: number) => {
    const quiz = quizzes.find((q) => q.id === quizId)
    if (!quiz) return

    setStartingQuizId(quizId)
    try {
      const startRes = await startAttempt(quizId)
      const response = await api.get(`/quizzes/${quizId}/questions`)
      setSession(
        startRes.attempt.id,
        quizId,
        quiz.title,
        quiz.negativeMarks,
        response.data.questions,
        durationMinutes
      )
    } catch (err) {
      const apiErr = err as any;
      alert(apiErr.response?.data?.error || 'Failed to start quiz attempt')
    } finally {
      setStartingQuizId(null)
    }
  }

  const [category, setCategory] = useState('All')
  const [difficulty, setDifficulty] = useState('All')

  // Admin Create Quiz Form States
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [quizCategory, setQuizCategory] = useState('')
  const [quizDifficulty, setQuizDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM')
  const [duration, setDuration] = useState(15)
  const [totalMarks, setTotalMarks] = useState(10)
  const [passMarks, setPassMarks] = useState(5)
  const [negativeMarks, setNegativeMarks] = useState('0.00')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get distinct categories
  const categories = [
    'All',
    ...Array.from(new Set(quizzes.map((q) => q.category).filter(Boolean))),
  ]

  // Filter quizzes
  const filteredQuizzes = quizzes.filter((q) => {
    const matchesCategory = category === 'All' || q.category === category
    const matchesDifficulty = difficulty === 'All' || q.difficulty === difficulty
    return matchesCategory && matchesDifficulty
  })

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title || !duration || !totalMarks) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      await createQuiz({
        title,
        description: description || null,
        category: quizCategory || null,
        difficulty: quizDifficulty,
        durationMinutes: Number(duration),
        totalMarks: Number(totalMarks),
        passMarks: passMarks ? Number(passMarks) : null,
        negativeMarks,
      })
      // Reset Form
      setTitle('')
      setDescription('')
      setQuizCategory('')
      setDuration(15)
      setTotalMarks(10)
      setPassMarks(5)
      setNegativeMarks('0.00')
      setShowCreateForm(false)
    } catch (err) {
      const apiErr = err as any;
      setError(apiErr.response?.data?.error || 'Failed to create quiz')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Browse Assessments
          </h1>
          <p className="text-sm text-muted-foreground">
            Select a forged quiz, test your limits, and climb the leaderboard.
          </p>
        </div>
        {user?.role === 'ADMIN' && (
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="gap-2 cursor-pointer shadow-sm self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Create Quiz</span>
          </Button>
        )}
      </div>

      {/* Admin Create Form */}
      {showCreateForm && (
        <Card className="w-full shadow-md border border-border bg-card">
          <CardHeader>
            <CardTitle className="text-xl font-bold tracking-tight text-foreground">Forge a New Assessment</CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Provide the details to generate a customized MCQ assessment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="py-3">
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleCreateQuiz} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 text-left sm:col-span-2">
                <Label htmlFor="quiz-title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Quiz Title *
                </Label>
                <Input
                  id="quiz-title"
                  type="text"
                  placeholder="e.g., Advanced HTML5 Elements"
                  className="h-10 bg-muted/30 border-border text-sm"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2 text-left sm:col-span-2">
                <Label htmlFor="quiz-desc" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Description
                </Label>
                <Textarea
                  id="quiz-desc"
                  placeholder="Provide details about the focus area, difficulty, and rules..."
                  className="min-h-[80px] bg-muted/30 border-border text-sm"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2 text-left">
                <Label htmlFor="quiz-cat" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Category
                </Label>
                <Input
                  id="quiz-cat"
                  type="text"
                  placeholder="e.g., Programming"
                  className="h-10 bg-muted/30 border-border text-sm"
                  value={quizCategory}
                  onChange={(e) => setQuizCategory(e.target.value)}
                />
              </div>

              <div className="space-y-2 text-left">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Difficulty
                </Label>
                <Select
                  value={quizDifficulty}
                  onValueChange={(val: 'EASY' | 'MEDIUM' | 'HARD') => setQuizDifficulty(val)}
                >
                  <SelectTrigger className="h-10 bg-muted/30 border-border text-sm">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border border-border">
                    <SelectItem value="EASY">Easy</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HARD">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 text-left">
                <Label htmlFor="quiz-dur" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Duration (Minutes) *
                </Label>
                <Input
                  id="quiz-dur"
                  type="number"
                  className="h-10 bg-muted/30 border-border text-sm"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  required
                  min={1}
                />
              </div>

              <div className="space-y-2 text-left">
                <Label htmlFor="quiz-marks" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Total Marks *
                </Label>
                <Input
                  id="quiz-marks"
                  type="number"
                  className="h-10 bg-muted/30 border-border text-sm"
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(Number(e.target.value))}
                  required
                  min={1}
                />
              </div>

              <div className="space-y-2 text-left">
                <Label htmlFor="quiz-pass" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Passing Marks
                </Label>
                <Input
                  id="quiz-pass"
                  type="number"
                  className="h-10 bg-muted/30 border-border text-sm"
                  value={passMarks}
                  onChange={(e) => setPassMarks(Number(e.target.value))}
                  min={1}
                />
              </div>

              <div className="space-y-2 text-left">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Negative Marking Penalty
                </Label>
                <Select
                  value={negativeMarks}
                  onValueChange={(val) => setNegativeMarks(val)}
                >
                  <SelectTrigger className="h-10 bg-muted/30 border-border text-sm">
                    <SelectValue placeholder="Penalty" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border border-border">
                    <SelectItem value="0.00">No Penalty (0.00)</SelectItem>
                    <SelectItem value="0.25">Quarter Point (0.25)</SelectItem>
                    <SelectItem value="0.50">Half Point (0.50)</SelectItem>
                    <SelectItem value="1.00">Full Point (1.00)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  disabled={loading}
                  className="cursor-pointer border-border"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="cursor-pointer shadow-sm">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Forging...
                    </span>
                  ) : (
                    <span>Forge Quiz</span>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Catalog Filters Bar */}
      <Card className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 shadow-sm border border-border bg-card">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm">
            <Filter className="h-4 w-4" />
            <span>Filters:</span>
          </div>

          <Select value={category} onValueChange={(val) => setCategory(val)}>
            <SelectTrigger className="h-9 w-full sm:w-[160px] bg-muted/30 border-border text-xs cursor-pointer">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-card border border-border">
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat || 'All'}>
                  {cat === 'All' ? 'All Categories' : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={difficulty} onValueChange={(val) => setDifficulty(val)}>
            <SelectTrigger className="h-9 w-full sm:w-[160px] bg-muted/30 border-border text-xs cursor-pointer">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent className="bg-card border border-border">
              <SelectItem value="All">All Difficulties</SelectItem>
              <SelectItem value="EASY">Easy</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HARD">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-xs text-muted-foreground self-start sm:self-auto">
          Showing <strong>{filteredQuizzes.length}</strong> forged assessments
        </div>
      </Card>

      {/* Grid catalogue */}
      {isLoading ? (
        <div className="flex justify-center py-20 gap-3 items-center text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span>Fetching forged assessments...</span>
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <Card className="p-16 text-center border border-border bg-card shadow-sm">
          <ShieldAlert className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="text-lg font-bold text-foreground mb-1">No Quizzes Found</h2>
          <p className="text-sm text-muted-foreground">
            Adjust your catalog filters or forge a new quiz to start testing.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <Card
              key={quiz.id}
              className="flex flex-col border border-border bg-card shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200 group relative overflow-hidden"
            >
              {/* Dynamic top visual indicator stripe */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-primary to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center mb-3">
                  <Badge
                    variant="outline"
                    className={`text-[9px] font-extrabold uppercase px-2 py-0.5 border ${
                      quiz.difficulty === 'EASY'
                        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30'
                        : quiz.difficulty === 'MEDIUM'
                        ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30'
                        : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30'
                    }`}
                  >
                    {quiz.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-bold tracking-tight text-foreground line-clamp-1">
                  {quiz.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 pb-4">
                {quiz.description ? (
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                    {quiz.description}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground/60 italic mb-4">
                    No description provided for this assessment.
                  </p>
                )}

                {Number(quiz.negativeMarks) > 0 && (
                  <div className="flex items-center gap-2 bg-destructive/10 border-l-[3px] border-destructive p-2.5 rounded-r-md text-[11px] text-destructive font-semibold">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    <span>Negative Penalty: {quiz.negativeMarks} per error</span>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex-col pt-4 border-t border-border bg-muted/10 p-5 space-y-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground w-full">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground/80" />
                    <span>{quiz.durationMinutes} Mins</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5 text-muted-foreground/80" />
                    <span>{quiz.category || 'General'}</span>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-foreground">
                    <Award className="h-3.5 w-3.5 text-primary" />
                    <span>{quiz.totalMarks} Pts</span>
                  </div>
                </div>

                <Button
                  className="w-full gap-2 cursor-pointer shadow-sm group/btn"
                  onClick={() => handleStartQuiz(quiz.id, quiz.durationMinutes)}
                  disabled={startingQuizId !== null}
                >
                  {startingQuizId === quiz.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <span>Start Assessment</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default QuizzesPage
