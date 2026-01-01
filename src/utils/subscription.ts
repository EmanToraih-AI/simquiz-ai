import { supabase } from '../lib/supabase'

export interface SubscriptionStatus {
  status: 'free' | 'active' | 'trialing' | 'canceled' | 'past_due'
  subscriptionId: string | null
  trialEndsAt: string | null
  quizCountThisMonth: number
  quizLimit: number
}

const FREE_QUIZ_LIMIT = 5

/**
 * Get user's subscription status and quiz count
 */
export async function getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
  try {
    // Get profile with subscription info
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_id, trial_ends_at')
      .eq('id', userId)
      .single()

    if (profileError) throw profileError

    const status = (profile?.subscription_status || 'free') as SubscriptionStatus['status']
    const subscriptionId = profile?.subscription_id || null
    const trialEndsAt = profile?.trial_ends_at || null

    // Check if trial is still active
    const isTrialActive = trialEndsAt && new Date(trialEndsAt) > new Date()
    const effectiveStatus: SubscriptionStatus['status'] = 
      (status === 'free' && isTrialActive) ? 'trialing' : status

    // Get quiz count for current month
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const { count, error: countError } = await supabase
      .from('quizzes')
      .select('id', { count: 'exact', head: true })
      .eq('created_by', userId)
      .gte('created_at', startOfMonth.toISOString())

    if (countError) throw countError

    const quizCountThisMonth = count || 0
    const quizLimit = effectiveStatus === 'active' || effectiveStatus === 'trialing' 
      ? Infinity 
      : FREE_QUIZ_LIMIT

    return {
      status: effectiveStatus,
      subscriptionId,
      trialEndsAt,
      quizCountThisMonth,
      quizLimit,
    }
  } catch (error) {
    console.error('Error getting subscription status:', error)
    // Return free tier defaults on error
    return {
      status: 'free',
      subscriptionId: null,
      trialEndsAt: null,
      quizCountThisMonth: 0,
      quizLimit: FREE_QUIZ_LIMIT,
    }
  }
}

/**
 * Check if user can generate a new quiz
 */
export async function canGenerateQuiz(userId: string): Promise<{
  allowed: boolean
  reason?: string
  subscriptionStatus?: SubscriptionStatus
}> {
  const subscriptionStatus = await getSubscriptionStatus(userId)

  // Active or trialing users have unlimited quizzes
  if (subscriptionStatus.status === 'active' || subscriptionStatus.status === 'trialing') {
    return { allowed: true, subscriptionStatus }
  }

  // Free users: check limit
  if (subscriptionStatus.quizCountThisMonth >= subscriptionStatus.quizLimit) {
    return {
      allowed: false,
      reason: `You've reached your monthly limit of ${subscriptionStatus.quizLimit} quizzes. Upgrade to Pro for unlimited quizzes!`,
      subscriptionStatus,
    }
  }

  return { allowed: true, subscriptionStatus }
}

