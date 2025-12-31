import { useAuth } from '../lib/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { BookOpen, BarChart3, PlusCircle } from 'lucide-react'

export default function Dashboard() {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to SimQuiz AI</h2>
          <p className="text-gray-600">Email: {user.email}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/demo"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-4">
              <PlusCircle className="w-8 h-8 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Generate Quiz</h3>
            </div>
            <p className="text-gray-600">
              Create a new quiz from a YouTube video or transcript
            </p>
          </Link>

          <Link
            to="/progress"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-4">
              <BarChart3 className="w-8 h-8 text-green-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">My Progress</h3>
            </div>
            <p className="text-gray-600">
              View your quiz attempts, scores, and areas for improvement
            </p>
          </Link>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <BookOpen className="w-8 h-8 text-purple-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Quiz Library</h3>
            </div>
            <p className="text-gray-600">
              Browse and take quizzes created by instructors
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

