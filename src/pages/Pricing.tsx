import { Link } from 'react-router-dom'
import { Check, X, ArrowRight } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { supabase } from '../lib/supabase'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '')

export default function Pricing() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleStartTrial = async () => {
    if (!user) {
      // Redirect to signup/login
      window.location.href = '/signup'
      return
    }

    setLoading(true)
    try {
      // Get Supabase session token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        alert('Please sign in to start a trial')
        setLoading(false)
        return
      }

      // Create checkout session via Supabase Edge Function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

      const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseAnonKey,
        },
      })

      const { sessionId } = await response.json()
      const stripe = await stripePromise

      if (stripe && sessionId) {
        const { error } = await stripe.redirectToCheckout({ sessionId })
        if (error) {
          console.error('Error redirecting to checkout:', error)
          alert('Error starting checkout. Please try again.')
        }
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('Error starting checkout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-blue-900">SimQuiz AI</h1>
            </Link>
            <div className="flex items-center space-x-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600">
            Choose the plan that's right for your learning journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Tier */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Free</h2>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">$0</span>
                <span className="text-gray-600">/month</span>
              </div>
              <p className="text-gray-600">Perfect for trying out SimQuiz AI</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">5 quizzes per month</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Unlimited quiz attempts</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Progress tracking</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Basic analytics</span>
              </li>
              <li className="flex items-start">
                <X className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400">Advanced analytics</span>
              </li>
              <li className="flex items-start">
                <X className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400">Priority support</span>
              </li>
            </ul>

            <Link
              to={user ? "/demo" : "/signup"}
              className="block w-full text-center px-6 py-3 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
              Get Started Free
            </Link>
          </div>

          {/* Paid Tier */}
          <div className="bg-blue-600 rounded-xl shadow-xl border-2 border-blue-700 p-8 relative">
            <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 px-4 py-1 rounded-bl-lg rounded-tr-xl text-sm font-bold">
              POPULAR
            </div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Pro</h2>
              <div className="mb-4">
                <span className="text-4xl font-bold text-white">$15</span>
                <span className="text-blue-100">/month</span>
              </div>
              <p className="text-blue-100">Unlimited quizzes and advanced features</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <Check className="w-5 h-5 text-white mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-white">Unlimited quizzes</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-white mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-white">Unlimited quiz attempts</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-white mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-white">Progress tracking</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-white mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-white">Advanced analytics</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-white mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-white">7-day free trial</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-white mr-3 flex-shrink-0 mt-0.5" />
                <span className="text-white">Priority support</span>
              </li>
            </ul>

            <button
              onClick={handleStartTrial}
              disabled={loading}
              className="w-full px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                'Loading...'
              ) : (
                <>
                  Start 7-Day Free Trial
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Feature Comparison
          </h2>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Feature
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Free
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Pro
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">Quizzes per month</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-900">5</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-900 font-semibold">
                    Unlimited
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">Quiz attempts</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-900">Unlimited</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-900 font-semibold">
                    Unlimited
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">Progress tracking</td>
                  <td className="px-6 py-4 text-sm text-center">
                    <Check className="w-5 h-5 text-green-600 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    <Check className="w-5 h-5 text-green-600 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">Basic analytics</td>
                  <td className="px-6 py-4 text-sm text-center">
                    <Check className="w-5 h-5 text-green-600 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    <Check className="w-5 h-5 text-green-600 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">Advanced analytics</td>
                  <td className="px-6 py-4 text-sm text-center">
                    <X className="w-5 h-5 text-gray-400 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    <Check className="w-5 h-5 text-green-600 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">Priority support</td>
                  <td className="px-6 py-4 text-sm text-center">
                    <X className="w-5 h-5 text-gray-400 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    <Check className="w-5 h-5 text-green-600 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700">Free trial</td>
                  <td className="px-6 py-4 text-sm text-center">
                    <X className="w-5 h-5 text-gray-400 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-sm text-center text-gray-900 font-semibold">
                    7 days
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

