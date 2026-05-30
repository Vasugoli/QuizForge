interface AnswerInput {
  questionId: string
  optionId: string | null
}

interface DbQuestion {
  id: string
  marks: number
}

interface DbOption {
  id: string
  questionId: string
  isCorrect: boolean
}

const calculateScore = (
  negativeMarks: string,
  questions: DbQuestion[],
  options: DbOption[],
  submittedAnswers: AnswerInput[]
) => {
  const penalty = parseFloat(negativeMarks)
  let correctCount = 0
  let wrongCount = 0
  let skippedCount = 0
  let totalScore = 0

  const optionMap = new Map<string, DbOption>()
  options.forEach((opt) => {
    optionMap.set(opt.id, opt)
  })

  const questionMap = new Map<string, DbQuestion>()
  questions.forEach((q) => {
    questionMap.set(q.id, q)
  })

  submittedAnswers.forEach((ans) => {
    const q = questionMap.get(ans.questionId)
    if (!q) return

    if (!ans.optionId) {
      skippedCount++
      return
    }

    const opt = optionMap.get(ans.optionId)
    if (opt && opt.questionId === ans.questionId && opt.isCorrect) {
      correctCount++
      totalScore += q.marks
    } else {
      wrongCount++
      totalScore -= penalty
    }
  })

  // Capped at 0 as per specification
  const finalScore = Math.max(0, totalScore)

  return {
    score: finalScore.toFixed(2),
    correctCount,
    wrongCount,
    skippedCount,
  }
}

export default calculateScore
