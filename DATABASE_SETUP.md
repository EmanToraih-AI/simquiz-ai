# Database Setup Guide

To enable quiz saving and progress tracking, you need to create the following tables in your Supabase database.

## Step 1: Go to Supabase SQL Editor

1. Open: https://supabase.com/dashboard/project/jbumdbqfglovurosqgjx/sql/new
2. Copy and paste the SQL below
3. Click "Run" to execute

## Step 2: Create Tables

Run this SQL in the Supabase SQL Editor:

```sql
-- Create profiles table (extends auth.users)
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quizzes_created_by ON quizzes(created_by);
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_completed_at ON quiz_attempts(completed_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

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
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Step 3: Verify Tables

After running the SQL, verify the tables were created:

1. Go to: https://supabase.com/dashboard/project/jbumdbqfglovurosqgjx/editor
2. You should see these tables:
   - `profiles`
   - `quizzes`
   - `questions`
   - `quiz_attempts`

## Step 4: Test

1. Sign up or log in to your app
2. Generate a quiz (it will automatically save to the database)
3. Complete the quiz (the attempt will be saved)
4. Go to `/progress` to see your progress

---

**Note:** The profile is automatically created when a user signs up via the trigger function.

