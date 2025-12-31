import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types (for TypeScript autocomplete)
export type Profile = {
  id: string
  email: string
  full_name: string | null
  role: 'student' | 'instructor'
  institution: string | null
  subscription_status: string
  subscription_id: string | null
  trial_ends_at: string | null
  created_at: string
}

export type Quiz = {
  id: string
  title: string
  source_url: string | null
  source_type: 'youtube' | 'transcript' | 'upload'
  topics: string[]
  num_questions: number
  coverage_mode: 'video-content-only' | 'comprehensive'
  created_by: string
  created_at: string
}

export type Question = {
  id: string
  quiz_id: string
  question_text: string
  options: string[]
  correct_answer: number
  explanation: string
  difficulty: 'basic' | 'intermediate' | 'advanced'
  source: 'video' | 'expanded'
  order_num: number
}

export type QuizAttempt = {
  id: string
  quiz_id: string
  user_id: string
  mode: 'practice' | 'assessment'
  score: number
  total_questions: number
  percentage: number
  time_spent_seconds: number
  answers: any
  weak_topics: string[]
  instructor_visible: boolean
  completed_at: string
}

