-- Quick Test Script for Auto-Population Triggers
-- Replace YOUR_USER_ID and YOUR_QUIZ_ID with actual UUIDs from your database

-- Step 1: Get your user ID and a quiz ID (uncomment to run)
/*
SELECT id, email FROM profiles WHERE email = 'your-email@example.com';
SELECT id, title FROM quizzes LIMIT 1;
*/

-- Step 2: Insert test quiz attempt (high score - should be "excellent")
INSERT INTO quiz_attempts (
  quiz_id,
  user_id,
  mode,
  score,
  total_questions,
  percentage,
  time_spent_seconds,
  answers,
  weak_topics,
  instructor_visible
) VALUES (
  'YOUR_QUIZ_ID'::uuid,  -- Replace with actual quiz ID
  'YOUR_USER_ID'::uuid,  -- Replace with actual user ID
  'practice',
  9,               -- Score: 9 out of 10
  10,              -- Total questions
  90,              -- Percentage: 90% (should be "excellent")
  300,             -- 5 minutes
  '[]'::jsonb,
  ARRAY[]::text[],
  true
)
RETURNING 
  id,
  percentage,
  performance_category,  -- Should be 'excellent'
  attempt_number,        -- Should be 1
  first_attempt,         -- Should be true
  time_per_question_seconds;  -- Should be 30 (300/10)

-- Step 3: Insert second attempt (medium score - should be "good")
INSERT INTO quiz_attempts (
  quiz_id,
  user_id,
  mode,
  score,
  total_questions,
  percentage,
  time_spent_seconds,
  answers,
  weak_topics,
  instructor_visible
) VALUES (
  'YOUR_QUIZ_ID'::uuid,  -- Same quiz ID
  'YOUR_USER_ID'::uuid,  -- Same user ID
  'practice',
  8,               -- Score: 8 out of 10
  10,
  80,              -- Percentage: 80% (should be "good")
  250,             -- 4 minutes 10 seconds
  '[]'::jsonb,
  ARRAY['Topic A']::text[],
  true
)
RETURNING 
  id,
  percentage,
  performance_category,  -- Should be 'good'
  attempt_number,        -- Should be 2 (auto-incremented!)
  first_attempt,         -- Should be false
  time_per_question_seconds;  -- Should be 25 (250/10)

-- Step 4: View all attempts to verify
/*
SELECT 
  id,
  percentage,
  performance_category,
  attempt_number,
  first_attempt,
  time_per_question_seconds,
  completed_at
FROM quiz_attempts
WHERE user_id = 'YOUR_USER_ID'::uuid
ORDER BY completed_at DESC;
*/

