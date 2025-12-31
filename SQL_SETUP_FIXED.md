# SQL Setup - Fixed Version (Handles Existing Policies)

This version will work even if some policies already exist.

## Step 1: Create New Query

1. Click the **"+"** button to create a new blank query
2. You'll see a blank editor

## Step 2: Copy This SQL (Fixed Version)

This version drops existing policies first, then creates them fresh:

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'instructor')),
  institution TEXT,
  subscription_status TEXT DEFAULT 'free',
  subscription_id TEXT,
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  source_url TEXT,
  source_type TEXT NOT NULL CHECK (source_type IN ('youtube', 'transcript', 'upload')),
  topics TEXT[] DEFAULT '{}',
  num_questions INTEGER NOT NULL,
  coverage_mode TEXT NOT NULL CHECK (coverage_mode IN ('video-content-only', 'comprehensive')),
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_answer INTEGER NOT NULL,
  explanation TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('basic', 'intermediate', 'advanced')),
  source TEXT NOT NULL CHECK (source IN ('video', 'expanded')),
  order_num INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create quiz_attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('practice', 'assessment')),
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage INTEGER NOT NULL,
  time_spent_seconds INTEGER NOT NULL,
  answers JSONB NOT NULL,
  weak_topics TEXT[] DEFAULT '{}',
  instructor_visible BOOLEAN DEFAULT true,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_quizzes_created_by ON quizzes(created_by);
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_completed_at ON quiz_attempts(completed_at DESC);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create fresh ones
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can view quizzes" ON quizzes;
DROP POLICY IF EXISTS "Users can create quizzes" ON quizzes;
DROP POLICY IF EXISTS "Anyone can view questions" ON questions;
DROP POLICY IF EXISTS "Users can create questions" ON questions;
DROP POLICY IF EXISTS "Users can view own attempts" ON quiz_attempts;
DROP POLICY IF EXISTS "Users can create own attempts" ON quiz_attempts;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for quizzes
CREATE POLICY "Anyone can view quizzes"
  ON quizzes FOR SELECT
  USING (true);

CREATE POLICY "Users can create quizzes"
  ON quizzes FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- RLS Policies for questions
CREATE POLICY "Anyone can view questions"
  ON questions FOR SELECT
  USING (true);

CREATE POLICY "Users can create questions"
  ON questions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = questions.quiz_id
      AND quizzes.created_by = auth.uid()
    )
  );

-- RLS Policies for quiz_attempts
CREATE POLICY "Users can view own attempts"
  ON quiz_attempts FOR SELECT
  USING (auth.uid() = user_id OR instructor_visible = true);

CREATE POLICY "Users can create own attempts"
  ON quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Step 3: Run It

1. Paste the SQL into your new query
2. Click the green **"Run"** button
3. It should work now! ✅

The key changes:
- Added `DROP POLICY IF EXISTS` before each `CREATE POLICY`
- Added `ON CONFLICT DO NOTHING` to the function to handle existing profiles

This will work even if some parts already exist!

