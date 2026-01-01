# Testing Auto-Population Triggers

## Overview

The database has triggers that automatically:
1. Calculate `performance_category` based on percentage score
2. Track `attempt_number` for retakes
3. Calculate `time_per_question_seconds`

## Method 1: Test Through the App (Recommended)

### Steps:

1. **Sign in to your app:**
   - Go to: `http://localhost:5173/login`
   - Sign in with your account

2. **Generate and complete a quiz:**
   - Go to: `http://localhost:5173/demo`
   - Paste a transcript
   - Generate a quiz (e.g., 5 questions)
   - Complete the quiz and submit answers

3. **Check the database:**
   - Go to: https://supabase.com/dashboard/project/jbumdbqfglovurosqgjx/editor
   - Click on `quiz_attempts` table
   - Find your recent attempt
   - Verify these columns are populated:
     - `performance_category` - Should be: `excellent` (90+%), `good` (75-89%), `needs_improvement` (60-74%), or `critical` (<60%)
     - `attempt_number` - Should be: `1` (for first attempt)
     - `first_attempt` - Should be: `true`
     - `time_per_question_seconds` - Should be calculated automatically

4. **Test retake (attempt_number):**
   - Go back to your dashboard
   - Find the quiz you just took
   - Click "Retake"
   - Complete it again
   - Check the database again:
     - `attempt_number` - Should now be: `2`
     - `first_attempt` - Should be: `false`

---

## Method 2: Test Directly in SQL (Quick Test)

### Step 1: Get Your User ID

Run this SQL in Supabase SQL Editor:

```sql
SELECT id, email, full_name 
FROM profiles 
WHERE email = 'your-email@example.com';
```

Copy the `id` (UUID) - you'll need it for the next steps.

### Step 2: Get a Quiz ID

```sql
SELECT id, title 
FROM quizzes 
LIMIT 5;
```

Copy one of the `id` values (UUID).

### Step 3: Create a Test Quiz Attempt

Replace `YOUR_USER_ID` and `YOUR_QUIZ_ID` with the UUIDs from steps 1 and 2:

```sql
-- Test 1: High score (should be "excellent")
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
  'YOUR_QUIZ_ID',  -- Replace with actual quiz ID
  'YOUR_USER_ID',  -- Replace with actual user ID
  'practice',
  9,               -- Score: 9 out of 10
  10,              -- Total questions
  90,              -- Percentage: 90%
  300,             -- 5 minutes = 300 seconds
  '[]'::jsonb,     -- Empty answers array for test
  ARRAY[]::text[], -- Empty weak topics
  true
)
RETURNING 
  id,
  percentage,
  performance_category,
  attempt_number,
  first_attempt,
  time_per_question_seconds;
```

**Expected Results:**
- `performance_category` = `'excellent'` (because 90% >= 90)
- `attempt_number` = `1` (first attempt)
- `first_attempt` = `true`
- `time_per_question_seconds` = `30` (300 seconds / 10 questions = 30)

### Step 4: Test Retake (Same Quiz, Same User)

Run the same INSERT again (change the score to test different categories):

```sql
-- Test 2: Medium score (should be "good")
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
  'YOUR_QUIZ_ID',  -- Same quiz ID as before
  'YOUR_USER_ID',  -- Same user ID as before
  'practice',
  8,               -- Score: 8 out of 10
  10,              -- Total questions
  80,              -- Percentage: 80%
  250,             -- 4 minutes 10 seconds
  '[]'::jsonb,
  ARRAY['Topic A', 'Topic B']::text[], -- Some weak topics
  true
)
RETURNING 
  id,
  percentage,
  performance_category,
  attempt_number,
  first_attempt,
  time_per_question_seconds;
```

**Expected Results:**
- `performance_category` = `'good'` (because 80% is between 75-89%)
- `attempt_number` = `2` (second attempt - auto-incremented!)
- `first_attempt` = `false`
- `time_per_question_seconds` = `25` (250 seconds / 10 questions = 25)

### Step 5: Test Different Performance Categories

Test all categories:

```sql
-- Test 3: Low score (should be "needs_improvement")
INSERT INTO quiz_attempts (
  quiz_id, user_id, mode, score, total_questions, percentage,
  time_spent_seconds, answers, weak_topics, instructor_visible
) VALUES (
  'YOUR_QUIZ_ID', 'YOUR_USER_ID', 'practice',
  6, 10, 60, 400, '[]'::jsonb, ARRAY[]::text[], true
)
RETURNING percentage, performance_category, attempt_number;

-- Should return: percentage=60, performance_category='needs_improvement', attempt_number=3

-- Test 4: Very low score (should be "critical")
INSERT INTO quiz_attempts (
  quiz_id, user_id, mode, score, total_questions, percentage,
  time_spent_seconds, answers, weak_topics, instructor_visible
) VALUES (
  'YOUR_QUIZ_ID', 'YOUR_USER_ID', 'practice',
  4, 10, 40, 200, '[]'::jsonb, ARRAY[]::text[], true
)
RETURNING percentage, performance_category, attempt_number;

-- Should return: percentage=40, performance_category='critical', attempt_number=4
```

---

## Performance Category Rules

The trigger automatically sets `performance_category` based on percentage:

- `'excellent'` - 90% or higher
- `'good'` - 75% to 89%
- `'needs_improvement'` - 60% to 74%
- `'critical'` - Below 60%

---

## Verify All Attempts

After testing, check all your attempts:

```sql
SELECT 
  id,
  percentage,
  performance_category,
  attempt_number,
  first_attempt,
  time_per_question_seconds,
  completed_at
FROM quiz_attempts
WHERE user_id = 'YOUR_USER_ID'
ORDER BY completed_at DESC;
```

You should see:
- All `performance_category` values populated
- `attempt_number` incrementing (1, 2, 3, 4...)
- `first_attempt` = `true` only for attempt_number = 1
- `time_per_question_seconds` calculated for all attempts

---

## Troubleshooting

### If performance_category is NULL:
- Check that `percentage` column has a value
- Check trigger exists: `\d+ quiz_attempts` in psql or check Supabase logs

### If attempt_number doesn't increment:
- Make sure you're using the same `quiz_id` and `user_id`
- Check that the trigger exists and is enabled
- Check Supabase function logs for errors

### If time_per_question_seconds is NULL:
- Check that `time_spent_seconds` and `total_questions` both have values
- Check that `total_questions` > 0

---

## Quick Verification Query

Run this to see if triggers are working:

```sql
SELECT 
  COUNT(*) as total_attempts,
  COUNT(performance_category) as with_category,
  COUNT(attempt_number) as with_attempt_num,
  COUNT(time_per_question_seconds) as with_time_per_q,
  MIN(attempt_number) as min_attempt,
  MAX(attempt_number) as max_attempt
FROM quiz_attempts
WHERE user_id = 'YOUR_USER_ID';
```

All counts should match `total_attempts` if triggers are working correctly!

