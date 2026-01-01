# Supabase Cleanup Instructions

## What to Remove/Update in Supabase

After simplifying to "Paste Transcript" only, here's what needs to be cleaned up in Supabase:

### 1. Delete `transcribe-video` Edge Function (Optional)

**If you want to remove it completely:**

1. Go to: https://supabase.com/dashboard/project/jbumdbqfglovurosqgjx/functions
2. Find `transcribe-video` function
3. Click "..." → "Delete" (if available)
4. OR just leave it - it won't hurt anything and you might want it later

**Note:** You can also keep it for future use. It's not causing any issues.

### 2. Update `generate-quiz` Edge Function

**This is REQUIRED - the function code has been simplified:**

1. Go to: https://supabase.com/dashboard/project/jbumdbqfglovurosqgjx/functions/generate-quiz
2. Click "Edit Function" or "Code" tab
3. Open your local file: `supabase/functions/generate-quiz/index.ts`
4. **Copy ALL code** (Cmd+A, Cmd+C)
5. In Supabase Dashboard, **select all** existing code and **delete it**
6. **Paste** the new simplified code
7. Click **"Deploy"** or **"Save"**

**What changed:**
- Removed all YouTube transcript fetching code
- Removed video URL handling
- Now only accepts `transcript` parameter
- Much simpler and cleaner code

### 3. Remove OpenAI API Key from Secrets (Optional)

**If you're not using video upload anymore:**

1. Go to: https://supabase.com/dashboard/project/jbumdbqfglovurosqgjx/settings/functions
2. Scroll to "Secrets" section
3. Find `OPENAI_API_KEY`
4. Click "..." → "Delete" (if you want to remove it)

**Note:** You can keep it - it won't be used but doesn't hurt anything.

### 4. Update Database Schema (Run Enhanced Analytics SQL)

**This is NEW and REQUIRED for analytics:**

1. Go to: https://supabase.com/dashboard/project/jbumdbqfglovurosqgjx/sql/new
2. Open your local file: `ENHANCED_ANALYTICS_SCHEMA.sql`
3. **Copy ALL SQL** (Cmd+A, Cmd+C)
4. **Paste** into Supabase SQL Editor
5. Click **"Run"**

**What this adds:**
- Enhanced `quiz_attempts` columns (performance_category, time_per_question, etc.)
- New `question_attempts` table (detailed question-level tracking)
- New `learning_objectives` and `question_objectives` tables
- Analytics views for instructors
- Auto-calculation functions and triggers

### 5. Update Source Type Constraint (Automatic)

The SQL script automatically updates the `quizzes.source_type` constraint to only allow `'transcript'`.

---

## Summary Checklist

- [ ] Updated `generate-quiz` Edge Function with simplified code
- [ ] (Optional) Deleted `transcribe-video` function
- [ ] (Optional) Removed `OPENAI_API_KEY` secret
- [ ] **Run `ENHANCED_ANALYTICS_SCHEMA.sql`** in Supabase SQL Editor
- [ ] Verify new tables and views were created

---

## Verify Everything Works

After cleanup:

1. **Test Quiz Generation:**
   - Go to your app: http://localhost:5173/demo
   - Paste a transcript
   - Generate quiz
   - Should work! ✅

2. **Check Database:**
   - Go to: https://supabase.com/dashboard/project/jbumdbqfglovurosqgjx/editor
   - Verify new tables exist:
     - `question_attempts`
     - `learning_objectives`
     - `question_objectives`
   - Verify views exist:
     - `student_performance_analytics`
     - `question_performance_analytics`
     - `topic_mastery_analytics`
     - `class_comparative_analytics`

3. **Test Enhanced Analytics:**
   - Complete a quiz
   - Check that `quiz_attempts` has new columns populated
   - Check that `performance_category` is auto-calculated

---

## What Stays the Same

✅ All existing data is preserved  
✅ All existing tables remain  
✅ Frontend code works the same  
✅ Only the Edge Function code is simplified  
✅ Database is enhanced (not replaced)

---

## Rollback (If Needed)

If something goes wrong:

1. **Edge Function:** Just redeploy the old code (we have backups)
2. **Database:** The SQL uses `IF NOT EXISTS` and `ADD COLUMN IF NOT EXISTS`, so it's safe to run multiple times
3. **No data loss:** All changes are additive (adding columns/tables, not removing)

---

**You're ready to go!** 🚀

