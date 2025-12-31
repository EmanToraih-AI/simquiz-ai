import { supabase, Quiz, Question, QuizAttempt } from '../lib/supabase'

/**
 * Save a quiz and its questions to the database
 */
export async function saveQuizToDatabase(
  quizData: {
    title: string
    sourceUrl: string | null
    sourceType: 'youtube' | 'transcript' | 'upload'
    topics: string[]
    numQuestions: number
    coverageMode: 'video-content-only' | 'comprehensive'
    createdBy: string
  },
  questions: Array<{
    questionText: string
    options: string[]
    correctAnswer: number
    explanation: string
    difficulty: 'basic' | 'intermediate' | 'advanced'
    source: 'video' | 'expanded'
    orderNum: number
  }>
): Promise<{ quizId: string; error: Error | null }> {
  try {
    // Insert quiz
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        title: quizData.title,
        source_url: quizData.sourceUrl,
        source_type: quizData.sourceType,
        topics: quizData.topics,
        num_questions: quizData.numQuestions,
        coverage_mode: quizData.coverageMode,
        created_by: quizData.createdBy,
      })
      .select()
      .single()

    if (quizError) throw quizError
    if (!quiz) throw new Error('Failed to create quiz')

    // Insert questions
    const questionsToInsert = questions.map((q) => ({
      quiz_id: quiz.id,
      question_text: q.questionText,
      options: q.options,
      correct_answer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: q.difficulty,
      source: q.source,
      order_num: q.orderNum,
    }))

    const { error: questionsError } = await supabase
      .from('questions')
      .insert(questionsToInsert)

    if (questionsError) throw questionsError

    return { quizId: quiz.id, error: null }
  } catch (error) {
    return { quizId: '', error: error as Error }
  }
}

/**
 * Save a quiz attempt to track student progress
 */
export async function saveQuizAttempt(
  attemptData: {
    quizId: string
    userId: string
    mode: 'practice' | 'assessment'
    score: number
    totalQuestions: number
    percentage: number
    timeSpentSeconds: number
    answers: any
    weakTopics: string[]
    instructorVisible: boolean
  }
): Promise<{ attemptId: string; error: Error | null }> {
  try {
    const { data: attempt, error } = await supabase
      .from('quiz_attempts')
      .insert({
        quiz_id: attemptData.quizId,
        user_id: attemptData.userId,
        mode: attemptData.mode,
        score: attemptData.score,
        total_questions: attemptData.totalQuestions,
        percentage: attemptData.percentage,
        time_spent_seconds: attemptData.timeSpentSeconds,
        answers: attemptData.answers,
        weak_topics: attemptData.weakTopics,
        instructor_visible: attemptData.instructorVisible,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    if (!attempt) throw new Error('Failed to create quiz attempt')

    return { attemptId: attempt.id, error: null }
  } catch (error) {
    return { attemptId: '', error: error as Error }
  }
}

/**
 * Get student progress analytics
 */
export async function getStudentProgress(userId: string) {
  try {
    // Get all attempts for the user
    const { data: attempts, error } = await supabase
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
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })

    if (error) throw error

    // Calculate statistics
    const totalAttempts = attempts?.length || 0
    const averageScore =
      attempts?.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts || 0
    const totalTimeSpent =
      attempts?.reduce((sum, a) => sum + a.time_spent_seconds, 0) || 0

    // Get weak topics (topics with <70% performance)
    const weakTopicsMap: { [key: string]: number[] } = {}
    attempts?.forEach((attempt) => {
      attempt.weak_topics?.forEach((topic: string) => {
        if (!weakTopicsMap[topic]) weakTopicsMap[topic] = []
        weakTopicsMap[topic].push(attempt.percentage)
      })
    })

    const weakTopics = Object.entries(weakTopicsMap)
      .map(([topic, scores]) => ({
        topic,
        averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
        attempts: scores.length,
      }))
      .sort((a, b) => a.averageScore - b.averageScore)

    return {
      totalAttempts,
      averageScore: Math.round(averageScore),
      totalTimeSpent,
      weakTopics,
      recentAttempts: attempts?.slice(0, 10) || [],
      error: null,
    }
  } catch (error) {
    return {
      totalAttempts: 0,
      averageScore: 0,
      totalTimeSpent: 0,
      weakTopics: [],
      recentAttempts: [],
      error: error as Error,
    }
  }
}

/**
 * Get instructor dashboard data (all students' progress)
 */
export async function getInstructorDashboard(instructorId: string) {
  try {
    // Get all quizzes created by instructor
    const { data: quizzes, error: quizzesError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('created_by', instructorId)
      .order('created_at', { ascending: false })

    if (quizzesError) throw quizzesError

    // Get all attempts for these quizzes
    const quizIds = quizzes?.map((q) => q.id) || []
    if (quizIds.length === 0) {
      return {
        quizzes: [],
        totalAttempts: 0,
        averageScore: 0,
        studentProgress: [],
        error: null,
      }
    }

    const { data: attempts, error: attemptsError } = await supabase
      .from('quiz_attempts')
      .select(`
        *,
        profiles!quiz_attempts_user_id_fkey (
          id,
          email,
          full_name
        )
      `)
      .in('quiz_id', quizIds)
      .eq('instructor_visible', true)
      .order('completed_at', { ascending: false })

    if (attemptsError) throw attemptsError

    // Calculate per-student statistics
    const studentMap: {
      [key: string]: {
        userId: string
        name: string
        email: string
        attempts: number
        averageScore: number
        weakTopics: string[]
      }
    } = {}

    attempts?.forEach((attempt: any) => {
      const userId = attempt.user_id
      const profile = attempt.profiles

      if (!studentMap[userId]) {
        studentMap[userId] = {
          userId,
          name: profile?.full_name || 'Unknown',
          email: profile?.email || '',
          attempts: 0,
          averageScore: 0,
          weakTopics: [],
        }
      }

      studentMap[userId].attempts++
      studentMap[userId].averageScore += attempt.percentage
      attempt.weak_topics?.forEach((topic: string) => {
        if (!studentMap[userId].weakTopics.includes(topic)) {
          studentMap[userId].weakTopics.push(topic)
        }
      })
    })

    const studentProgress = Object.values(studentMap).map((student) => ({
      ...student,
      averageScore: Math.round(student.averageScore / student.attempts),
    }))

    return {
      quizzes: quizzes || [],
      totalAttempts: attempts?.length || 0,
      averageScore:
        Math.round(
          (attempts?.reduce((sum, a) => sum + a.percentage, 0) || 0) /
            (attempts?.length || 1)
        ) || 0,
      studentProgress,
      error: null,
    }
  } catch (error) {
    return {
      quizzes: [],
      totalAttempts: 0,
      averageScore: 0,
      studentProgress: [],
      error: error as Error,
    }
  }
}

