-- ============================================
-- Enhanced Analytics Schema (Corrected)
-- Assumes quizzes.topics and quiz_attempts.weak_topics are text[].
-- ============================================

-- 0. Extensions (ensure gen_random_uuid exists)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. ENHANCED quiz_attempts TABLE
-- Add new columns for detailed analytics (non-destructive)
-- ============================================

ALTER TABLE IF EXISTS quiz_attempts
ADD COLUMN IF NOT EXISTS time_per_question_seconds INTEGER,
ADD COLUMN IF NOT EXISTS first_attempt BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS attempt_number INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS confidence_scores JSONB,
ADD COLUMN IF NOT EXISTS hints_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS feedback_notes TEXT,
ADD COLUMN IF NOT EXISTS instructor_feedback TEXT,
ADD COLUMN IF NOT EXISTS performance_category TEXT CHECK (performance_category IN ('excellent', 'good', 'needs_improvement', 'critical')),
ADD COLUMN IF NOT EXISTS learning_objectives JSONB;

-- Composite index useful for attempt queries
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_quiz_attemptnum ON quiz_attempts(user_id, quiz_id, attempt_number);

-- Index on performance_category
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_performance ON quiz_attempts(performance_category);

-- Additional indexes recommended (for analytics queries)
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_completed_at ON quiz_attempts(quiz_id, completed_at);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_completed_at ON quiz_attempts(user_id, completed_at);

-- ============================================
-- 2. QUESTION-LEVEL TRACKING TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS question_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_attempt_id UUID REFERENCES quiz_attempts(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  selected_answer INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_spent_seconds INTEGER NOT NULL,
  first_attempt BOOLEAN DEFAULT true,
  hints_used INTEGER DEFAULT 0,
  confidence_level INTEGER CHECK (confidence_level BETWEEN 1 AND 5),
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_question_attempts_quiz_attempt ON question_attempts(quiz_attempt_id);
CREATE INDEX IF NOT EXISTS idx_question_attempts_question ON question_attempts(question_id);
CREATE INDEX IF NOT EXISTS idx_question_attempts_user ON question_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_question_attempts_correct ON question_attempts(is_correct);

-- Enable RLS and create safe policies (wrap auth.uid())
ALTER TABLE question_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "qa_select_own_or_instructor" ON question_attempts;
CREATE POLICY "qa_select_own_or_instructor"
  ON question_attempts FOR SELECT TO authenticated
  USING (
    (SELECT auth.uid())::uuid = user_id
    OR EXISTS (
      SELECT 1 FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      WHERE qa.id = question_attempts.quiz_attempt_id
        AND q.created_by = (SELECT auth.uid())::uuid
    )
  );

DROP POLICY IF EXISTS "qa_insert_own" ON question_attempts;
CREATE POLICY "qa_insert_own"
  ON question_attempts FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid())::uuid = user_id);

DROP POLICY IF EXISTS "qa_update_own" ON question_attempts;
CREATE POLICY "qa_update_own"
  ON question_attempts FOR UPDATE TO authenticated
  USING ((SELECT auth.uid())::uuid = user_id)
  WITH CHECK ((SELECT auth.uid())::uuid = user_id);

DROP POLICY IF EXISTS "qa_delete_own" ON question_attempts;
CREATE POLICY "qa_delete_own"
  ON question_attempts FOR DELETE TO authenticated
  USING ((SELECT auth.uid())::uuid = user_id);

-- ============================================
-- 3. LEARNING OBJECTIVES & QUESTION_OBJECTIVES TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS learning_objectives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  objective_text TEXT NOT NULL,
  objective_category TEXT,
  order_num INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS question_objectives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  objective_id UUID REFERENCES learning_objectives(id) ON DELETE CASCADE NOT NULL,
  weight NUMERIC(3,2) DEFAULT 1.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(question_id, objective_id)
);

CREATE INDEX IF NOT EXISTS idx_learning_objectives_quiz ON learning_objectives(quiz_id);
CREATE INDEX IF NOT EXISTS idx_question_objectives_question ON question_objectives(question_id);
CREATE INDEX IF NOT EXISTS idx_question_objectives_objective ON question_objectives(objective_id);

-- Enable RLS and add policies
ALTER TABLE learning_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_objectives ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "learning_objectives_select_public" ON learning_objectives;
CREATE POLICY "learning_objectives_select_public"
  ON learning_objectives FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "learning_objectives_manage_instructor" ON learning_objectives;
CREATE POLICY "learning_objectives_manage_instructor"
  ON learning_objectives FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = learning_objectives.quiz_id
        AND quizzes.created_by = (SELECT auth.uid())::uuid
    )
  );

DROP POLICY IF EXISTS "question_objectives_select_public" ON question_objectives;
CREATE POLICY "question_objectives_select_public"
  ON question_objectives FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "question_objectives_manage_instructor" ON question_objectives;
CREATE POLICY "question_objectives_manage_instructor"
  ON question_objectives FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM questions q
      JOIN quizzes qu ON q.quiz_id = qu.id
      WHERE q.id = question_objectives.question_id
        AND qu.created_by = (SELECT auth.uid())::uuid
    )
  );

-- ============================================
-- 4. STUDENT PERFORMANCE ANALYTICS VIEW (fixed aggregation of weak_topics)
-- ============================================

CREATE OR REPLACE VIEW student_performance_analytics AS
WITH qa_topics AS (
  -- unnest weak_topics per quiz_attempt (assumes weak_topics is text[])
  SELECT qa.id AS qa_id, qa.user_id, qa.quiz_id, unnest(qa.weak_topics) AS topic
  FROM quiz_attempts qa
  WHERE qa.weak_topics IS NOT NULL
)
SELECT 
  p.id AS user_id,
  p.full_name,
  p.email,
  q.id AS quiz_id,
  q.title AS quiz_title,
  COUNT(DISTINCT qa.id) AS total_attempts,
  MAX(qa.percentage) AS best_score,
  AVG(qa.percentage) AS average_score,
  MIN(qa.percentage) AS lowest_score,
  AVG(qa.time_spent_seconds) AS avg_time_spent_seconds,
  SUM(CASE WHEN qa.percentage >= 70 THEN 1 ELSE 0 END) AS passing_attempts,
  SUM(CASE WHEN qa.percentage < 70 THEN 1 ELSE 0 END) AS failing_attempts,
  COUNT(DISTINCT qt.topic) AS unique_weak_topics_count,
  ARRAY_AGG(DISTINCT qt.topic) FILTER (WHERE qt.topic IS NOT NULL) AS all_weak_topics,
  MAX(qa.completed_at) AS last_attempt_date,
  MIN(qa.completed_at) AS first_attempt_date
FROM profiles p
JOIN quiz_attempts qa ON p.id = qa.user_id
JOIN quizzes q ON qa.quiz_id = q.id
LEFT JOIN qa_topics qt ON qt.qa_id = qa.id
WHERE p.role = 'student'
GROUP BY p.id, p.full_name, p.email, q.id, q.title;

-- ============================================
-- 5. QUESTION PERFORMANCE ANALYTICS VIEW
-- ============================================

CREATE OR REPLACE VIEW question_performance_analytics AS
SELECT 
  q.id AS question_id,
  q.question_text,
  q.quiz_id,
  qu.title AS quiz_title,
  q.difficulty,
  COUNT(qa.id) AS total_attempts,
  SUM(CASE WHEN qa.is_correct THEN 1 ELSE 0 END) AS correct_attempts,
  CASE WHEN COUNT(qa.id) = 0 THEN NULL
       ELSE ROUND(100.0 * SUM(CASE WHEN qa.is_correct THEN 1 ELSE 0 END) / COUNT(qa.id), 2)
  END AS success_rate,
  AVG(qa.time_spent_seconds) AS avg_time_spent_seconds,
  AVG(qa.confidence_level) AS avg_confidence_level,
  SUM(qa.hints_used) AS total_hints_used
FROM questions q
JOIN quizzes qu ON q.quiz_id = qu.id
LEFT JOIN question_attempts qa ON q.id = qa.question_id
GROUP BY q.id, q.question_text, q.quiz_id, qu.title, q.difficulty;

-- ============================================
-- 6. TOPIC MASTERY VIEW (rewritten with CTE)
-- ============================================

CREATE OR REPLACE VIEW topic_mastery_analytics AS
WITH user_topics AS (
  -- Get distinct topics per user from quizzes they attempted
  SELECT DISTINCT p.id AS user_id, unnest(q.topics) AS topic
  FROM profiles p
  JOIN quiz_attempts qa ON qa.user_id = p.id
  JOIN quizzes q ON q.id = qa.quiz_id
  WHERE p.role = 'student' AND q.topics IS NOT NULL
)
SELECT 
  p.id AS user_id,
  p.full_name,
  ut.topic,
  COUNT(DISTINCT qa.id) AS quiz_attempts_count,
  AVG(qa.percentage) AS avg_percentage,
  COUNT(DISTINCT CASE WHEN ut.topic = ANY(qa.weak_topics) THEN qa.id END) AS weak_appearances,
  MAX(qa.completed_at) AS last_practiced_date
FROM profiles p
JOIN user_topics ut ON ut.user_id = p.id
LEFT JOIN quiz_attempts qa ON qa.user_id = p.id
LEFT JOIN quizzes qu2 ON qu2.id = qa.quiz_id AND ut.topic = ANY(qu2.topics)
WHERE p.role = 'student'
GROUP BY p.id, p.full_name, ut.topic;

-- ============================================
-- 7. CLASS COMPARATIVE ANALYTICS VIEW
-- ============================================

CREATE OR REPLACE VIEW class_comparative_analytics AS
SELECT 
  p.id AS user_id,
  p.full_name,
  q.id AS quiz_id,
  q.title AS quiz_title,
  qa.percentage AS student_score,
  qa.completed_at,
  (
    SELECT AVG(percentage)
    FROM quiz_attempts qa2
    WHERE qa2.quiz_id = q.id
      AND qa2.completed_at BETWEEN qa.completed_at - INTERVAL '7 days' AND qa.completed_at + INTERVAL '7 days'
  ) AS class_average_score,
  (
    SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY percentage)
    FROM quiz_attempts qa2
    WHERE qa2.quiz_id = q.id
      AND qa2.completed_at BETWEEN qa.completed_at - INTERVAL '7 days' AND qa.completed_at + INTERVAL '7 days'
  ) AS class_median_score,
  (
    SELECT COUNT(DISTINCT user_id)
    FROM quiz_attempts qa2
    WHERE qa2.quiz_id = q.id
      AND qa2.completed_at BETWEEN qa.completed_at - INTERVAL '7 days' AND qa.completed_at + INTERVAL '7 days'
  ) AS class_size
FROM profiles p
JOIN quiz_attempts qa ON p.id = qa.user_id
JOIN quizzes q ON qa.quiz_id = q.id
WHERE p.role = 'student';

-- ============================================
-- 8. FUNCTION: Auto-calculate performance category (safe NULL handling)
-- ============================================

CREATE OR REPLACE FUNCTION calculate_performance_category()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.percentage IS NULL THEN
    NEW.performance_category := NULL;
  ELSIF NEW.percentage >= 90 THEN
    NEW.performance_category := 'excellent';
  ELSIF NEW.percentage >= 75 THEN
    NEW.performance_category := 'good';
  ELSIF NEW.percentage >= 60 THEN
    NEW.performance_category := 'needs_improvement';
  ELSE
    NEW.performance_category := 'critical';
  END IF;

  -- Calculate time per question safely
  IF COALESCE(NEW.total_questions, 0) > 0 THEN
    NEW.time_per_question_seconds := FLOOR(COALESCE(NEW.time_spent_seconds, 0) * 1.0 / NEW.total_questions);
  ELSE
    NEW.time_per_question_seconds := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for performance category
DROP TRIGGER IF EXISTS set_performance_category ON quiz_attempts;
CREATE TRIGGER set_performance_category
  BEFORE INSERT OR UPDATE ON quiz_attempts
  FOR EACH ROW
  EXECUTE FUNCTION calculate_performance_category();

-- ============================================
-- 9. FUNCTION: Track attempt numbers (concurrency-safe via advisory lock)
-- ============================================

CREATE OR REPLACE FUNCTION set_attempt_number()
RETURNS TRIGGER AS $$
DECLARE
  lock_key BIGINT;
BEGIN
  -- derive a 64-bit integer from md5 hash of user_id||quiz_id
  -- take first 16 hex chars -> 64 bits
  lock_key := ('x' || substr(md5(COALESCE(NEW.user_id::text, '') || '::' || COALESCE(NEW.quiz_id::text, '')), 1, 16))::bit(64)::bigint;
  PERFORM pg_advisory_xact_lock(lock_key);

  SELECT COALESCE(MAX(attempt_number), 0) + 1
  INTO NEW.attempt_number
  FROM quiz_attempts
  WHERE user_id = NEW.user_id
    AND quiz_id = NEW.quiz_id;

  NEW.first_attempt := (NEW.attempt_number = 1);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for attempt number (only BEFORE INSERT)
DROP TRIGGER IF EXISTS set_attempt_number_trigger ON quiz_attempts;
CREATE TRIGGER set_attempt_number_trigger
  BEFORE INSERT ON quiz_attempts
  FOR EACH ROW
  EXECUTE FUNCTION set_attempt_number();

-- ============================================
-- 10. SAFE MIGRATION: quizzes.source_type constraint
-- Only allow 'transcript' going forward. Ensure existing rows conform first.
-- ============================================

-- Make NULL entries explicit 'transcript' if appropriate (modify as needed)
-- WARNING: The next UPDATE will change data. Review before running.
-- Uncomment the UPDATE or modify per your migration policy.

-- UPDATE quizzes SET source_type = 'transcript' WHERE source_type IS NULL;
-- Optionally handle or delete rows with invalid values first.

ALTER TABLE IF EXISTS quizzes
DROP CONSTRAINT IF EXISTS quizzes_source_type_check;

ALTER TABLE IF EXISTS quizzes
ADD CONSTRAINT quizzes_source_type_check 
CHECK (source_type IN ('transcript'));

-- ============================================
-- 11. Indexes for arrays and performance
-- If topics / weak_topics are text[] arrays, add GIN indexes for any array containment queries
-- ============================================

-- For quizzes.topics (text[])
CREATE INDEX IF NOT EXISTS idx_quizzes_topics_gin ON quizzes USING GIN (topics);

-- For quiz_attempts.weak_topics (text[])
CREATE INDEX IF NOT EXISTS idx_quizattempts_weaktopics_gin ON quiz_attempts USING GIN (weak_topics);

-- ============================================
-- 12. Final notes
-- - If your topics/weak_topics are JSONB arrays instead of text[], replace unnest(...) with jsonb_array_elements_text(...) where used,
--   and create GIN index on the jsonb column.
-- - If profiles.id or auth UID types are text, cast appropriately (replace ::uuid casts).
-- - Test trigger behavior under concurrent inserts.
-- - Confirm RLS policy coverage for service_role and background jobs that need bypassing.
-- ============================================
