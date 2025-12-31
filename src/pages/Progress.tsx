import { useEffect, useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { getStudentProgress, getInstructorDashboard } from '../utils/quizDatabase'
import { BarChart3, Clock, TrendingUp, BookOpen, AlertCircle } from 'lucide-react'

export default function Progress() {
  const { user, loading: authLoading } = useAuth()
  const [progress, setProgress] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && user) {
      loadProgress()
    }
  }, [user, authLoading])

  async function loadProgress() {
    if (!user) return

    setLoading(true)
    // For now, assume all users are students. You can add role checking later
    const data = await getStudentProgress(user.id)
    setProgress(data)
    setLoading(false)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading progress...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to view your progress</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">My Progress</h1>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {progress?.error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">Error loading progress: {progress.error.message}</p>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Attempts</p>
                    <p className="text-3xl font-bold text-gray-900">{progress?.totalAttempts || 0}</p>
                  </div>
                  <BookOpen className="w-12 h-12 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Average Score</p>
                    <p className="text-3xl font-bold text-gray-900">{progress?.averageScore || 0}%</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Time Spent</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {Math.round((progress?.totalTimeSpent || 0) / 60)} min
                    </p>
                  </div>
                  <Clock className="w-12 h-12 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Weak Topics */}
            {progress?.weakTopics && progress.weakTopics.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <AlertCircle className="w-6 h-6 text-orange-600 mr-2" />
                  Topics Needing Review
                </h2>
                <div className="space-y-3">
                  {progress.weakTopics.map((topic: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <span className="font-medium text-gray-900">{topic.topic}</span>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Avg: {Math.round(topic.averageScore)}%</p>
                        <p className="text-xs text-gray-500">{topic.attempts} attempts</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Attempts */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Quiz Attempts</h2>
              {progress?.recentAttempts && progress.recentAttempts.length > 0 ? (
                <div className="space-y-4">
                  {progress.recentAttempts.map((attempt: any) => (
                    <div key={attempt.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {attempt.quizzes?.title || 'Quiz'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(attempt.completed_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">{attempt.percentage}%</p>
                          <p className="text-sm text-gray-600">
                            {attempt.score}/{attempt.total_questions} correct
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No quiz attempts yet. Complete some quizzes to see your progress!</p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

