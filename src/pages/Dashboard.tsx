import { useAuth } from '../lib/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase, QuizAttempt, Quiz } from '../lib/supabase'
import { Loader2, PlusCircle, Calendar, Search, Filter } from 'lucide-react'

interface QuizAttemptWithQuiz extends QuizAttempt {
  quizzes: Quiz
}

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth()
  const navigate = useNavigate()
  const [quizAttempts, setQuizAttempts] = useState<QuizAttemptWithQuiz[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'topic'>('date')
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month' | 'year'>('all')
  const [profile, setProfile] = useState<{ full_name: string | null } | null>(null)

  // Stats
  const totalQuizzes = quizAttempts.length
  const averageScore = quizAttempts.length > 0
    ? Math.round(quizAttempts.reduce((sum, a) => sum + a.percentage, 0) / quizAttempts.length)
    : 0
  const totalTimeSpent = quizAttempts.reduce((sum, a) => sum + a.time_spent_seconds, 0)
  const totalHours = Math.floor(totalTimeSpent / 3600)
  const totalMinutes = Math.floor((totalTimeSpent % 3600) / 60)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
      return
    }
    if (user) {
      fetchProfile()
      fetchQuizAttempts()
    }
  }, [user, authLoading, navigate])

  const fetchProfile = async () => {
    if (!user) return
    const { data } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()
    if (data) setProfile(data)
  }

  const fetchQuizAttempts = async () => {
    if (!user) return
    setLoading(true)
    setError(null)

    try {
      let query = supabase
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
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })

      // Apply date filter
      if (dateFilter !== 'all') {
        const now = new Date()
        let startDate: Date
        if (dateFilter === 'week') {
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        } else if (dateFilter === 'month') {
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        } else {
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        }
        query = query.gte('completed_at', startDate.toISOString())
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      const attempts = (data || []) as QuizAttemptWithQuiz[]
      
      // Apply search filter
      let filtered = attempts
      if (searchQuery.trim()) {
        filtered = attempts.filter(attempt => 
          (attempt.quizzes as Quiz).title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }

      // Apply sorting
      let sorted = [...filtered]
      if (sortBy === 'date') {
        sorted.sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
      } else if (sortBy === 'score') {
        sorted.sort((a, b) => b.percentage - a.percentage)
      } else if (sortBy === 'topic') {
        sorted.sort((a, b) => {
          const topicsA = (a.quizzes as Quiz).topics.join(', ')
          const topicsB = (b.quizzes as Quiz).topics.join(', ')
          return topicsA.localeCompare(topicsB)
        })
      }

      setQuizAttempts(sorted)
    } catch (err) {
      console.error('Error fetching quiz attempts:', err)
      setError('Failed to load quiz attempts. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <button
              onClick={signOut}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile?.full_name || user.email?.split('@')[0] || 'Student'}
          </h2>
        </div>

        {/* Overall Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Quizzes Taken</h3>
            <p className="text-4xl font-bold text-gray-900">{totalQuizzes}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Average Score</h3>
            <p className="text-4xl font-bold text-gray-900">{averageScore}%</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Time Spent</h3>
            <p className="text-4xl font-bold text-gray-900">
              {totalHours > 0 ? `${totalHours}h ` : ''}{totalMinutes}m
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by quiz title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'score' | 'topic')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="date">Sort by Date</option>
                  <option value="score">Sort by Score</option>
                  <option value="topic">Sort by Topic</option>
                </select>
              </div>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as 'all' | 'week' | 'month' | 'year')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Generate New Quiz CTA */}
        <div className="mb-6">
          <Link
            to="/demo"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            <PlusCircle className="w-5 h-5" />
            Generate New Quiz
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Quiz History Table */}
        {quizAttempts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">No quiz attempts yet.</p>
            <Link
              to="/demo"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
              Generate Your First Quiz
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Taken
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quiz Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Topics Covered
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quizAttempts.map((attempt) => {
                    const quiz = attempt.quizzes as Quiz
                    return (
                      <tr key={attempt.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">{formatDate(attempt.completed_at)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{quiz.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {attempt.score}/{attempt.total_questions} - {attempt.percentage}%
                          </div>
                          <div className={`text-xs mt-1 ${
                            attempt.percentage >= 70 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {attempt.percentage >= 70 ? 'Passed' : 'Needs Improvement'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {quiz.topics?.slice(0, 3).map((topic, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {topic}
                              </span>
                            ))}
                            {quiz.topics && quiz.topics.length > 3 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                +{quiz.topics.length - 3} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/dashboard/attempt/${attempt.id}`}
                              className="text-blue-600 hover:text-blue-900 hover:underline"
                            >
                              View Details
                            </Link>
                            <Link
                              to={`/demo?quizId=${quiz.id}`}
                              className="text-green-600 hover:text-green-900 hover:underline"
                            >
                              Retake
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
