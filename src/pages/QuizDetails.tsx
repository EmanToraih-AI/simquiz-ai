import { useParams, Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase, QuizAttempt, Quiz, Question } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { Loader2, ArrowLeft, CheckCircle2, XCircle, Download, RotateCcw } from 'lucide-react'

interface QuizAttemptWithData extends QuizAttempt {
  quizzes: Quiz & {
    questions: Question[]
  }
}

export default function QuizDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [attempt, setAttempt] = useState<QuizAttemptWithData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
      return
    }
    if (id && user) {
      fetchQuizAttempt()
    }
  }, [id, user, authLoading, navigate])

  const fetchQuizAttempt = async () => {
    if (!id || !user) return
    setLoading(true)
    setError(null)

    try {
      // Fetch quiz attempt
      const { data: attemptData, error: attemptError } = await supabase
        .from('quiz_attempts')
        .select(`
          *,
          quizzes (
            id,
            title,
            topics,
            created_at
          )
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (attemptError) throw attemptError
      if (!attemptData) throw new Error('Quiz attempt not found')

      // Fetch questions for this quiz
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', (attemptData.quizzes as Quiz).id)
        .order('order_num', { ascending: true })

      if (questionsError) throw questionsError

      setAttempt({
        ...attemptData,
        quizzes: {
          ...(attemptData.quizzes as Quiz),
          questions: questionsData || [],
        },
      } as QuizAttemptWithData)
    } catch (err) {
      console.error('Error fetching quiz attempt:', err)
      setError('Failed to load quiz details. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = () => {
    window.print()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading quiz details...</p>
        </div>
      </div>
    )
  }

  if (!user || !attempt) {
    return null
  }

  const quiz = attempt.quizzes
  const answers = Array.isArray(attempt.answers) ? attempt.answers : []
  const questions = quiz.questions || []

  // Calculate topic performance
  const topicPerformance: { [key: string]: { correct: number; total: number } } = {}
  questions.forEach((question, index) => {
    const topic = quiz.topics?.[0] || 'General' // Use first topic or default
    if (!topicPerformance[topic]) {
      topicPerformance[topic] = { correct: 0, total: 0 }
    }
    topicPerformance[topic].total++
    if (answers[index]?.correct) {
      topicPerformance[topic].correct++
    }
  })

  const strongAreas = Object.entries(topicPerformance)
    .filter(([_, perf]) => (perf.correct / perf.total) >= 0.8)
    .map(([topic]) => topic)

  const needsReview = Object.entries(topicPerformance)
    .filter(([_, perf]) => (perf.correct / perf.total) < 0.7)
    .map(([topic]) => topic)

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Dashboard</span>
            </Link>
            <div className="flex items-center gap-4">
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Score Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">{attempt.score}/{attempt.total_questions}</div>
              <div className="text-sm text-gray-500 mt-1">Correct Answers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">{attempt.percentage}%</div>
              <div className="text-sm text-gray-500 mt-1">Score</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600">{formatTime(attempt.time_spent_seconds)}</div>
              <div className="text-sm text-gray-500 mt-1">Time Spent</div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              attempt.percentage >= 70
                ? 'bg-green-100 text-green-800'
                : attempt.percentage >= 60
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {attempt.percentage >= 70 ? 'Passed' : attempt.percentage >= 60 ? 'Needs Improvement' : 'Failed'}
            </span>
          </div>
        </div>

        {/* Topics Breakdown */}
        {(strongAreas.length > 0 || needsReview.length > 0) && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Topics Breakdown</h2>
            {strongAreas.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-green-700 mb-2">Strong Areas (&gt;80% correct)</h3>
                <div className="flex flex-wrap gap-2">
                  {strongAreas.map((topic, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {needsReview.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-red-700 mb-2">Needs Review (&lt;70% correct)</h3>
                <div className="flex flex-wrap gap-2">
                  {needsReview.map((topic, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Question-by-Question Review */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Question Review</h2>
          <div className="space-y-8">
            {questions.map((question, index) => {
              const answer = answers[index]
              const isCorrect = answer?.correct || false
              const selectedAnswer = answer?.selectedAnswer ?? null

              return (
                <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">Question {index + 1}</span>
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      question.difficulty === 'basic'
                        ? 'bg-blue-100 text-blue-800'
                        : question.difficulty === 'intermediate'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {question.difficulty}
                    </span>
                  </div>
                  <p className="text-lg font-medium text-gray-900 mb-4">{question.question_text}</p>
                  <div className="space-y-2 mb-4">
                    {question.options.map((option, optIdx) => {
                      const isSelected = selectedAnswer === optIdx
                      const isCorrectAnswer = question.correct_answer === optIdx
                      return (
                        <div
                          key={optIdx}
                          className={`p-3 rounded-lg border-2 ${
                            isCorrectAnswer
                              ? 'border-green-500 bg-green-50'
                              : isSelected && !isCorrect
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isCorrectAnswer && (
                              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                            )}
                            {isSelected && !isCorrect && (
                              <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                            )}
                            <span className={`${
                              isCorrectAnswer
                                ? 'font-semibold text-green-800'
                                : isSelected && !isCorrect
                                ? 'font-semibold text-red-800'
                                : 'text-gray-700'
                            }`}>
                              {option}
                              {isCorrectAnswer && ' (Correct Answer)'}
                              {isSelected && !isCorrect && ' (Your Answer)'}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-blue-900 mb-1">Explanation:</p>
                    <p className="text-sm text-blue-800">{question.explanation}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Retake Quiz Button */}
        <div className="flex justify-center">
          <Link
            to={`/demo?quizId=${quiz.id}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            <RotateCcw className="w-5 h-5" />
            Retake Quiz
          </Link>
        </div>
      </main>

      {/* Print Styles */}
      <style>{`
        @media print {
          nav, button, a[href] {
            display: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}

