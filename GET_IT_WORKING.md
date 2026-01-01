# How to Make SimQuiz AI Work - Step by Step

## Current Problem
You're getting "Error: Prompt is required" because the **updated Edge Function hasn't been deployed yet**. The old function is still running and expects a different format.

## Solution: Deploy the Updated Edge Function

### Step 1: Open Terminal

Open your terminal and navigate to the project:

```bash
cd '/Users/emantoraih/Documents/4 Upstate/ET-Sim-websites/simquiz-ai-website/simquiz-ai'
```

### Step 2: Make Sure You're Logged In to Supabase

```bash
supabase login
```

If you're already logged in, this will confirm it. If not, it will open a browser for authentication.

### Step 3: Make Sure Project is Linked

```bash
supabase link --project-ref jbumdbqfglovurosqgjx
```

If already linked, it will tell you. Otherwise, it will link it.

### Step 4: Verify Your API Key Secret is Set

```bash
supabase secrets list
```

Should show `ANTHROPIC_API_KEY`. If not, set it:

```bash
supabase secrets set ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

(Replace `your_anthropic_api_key_here` with your actual key from `.env`)

### Step 5: Deploy the Updated Function ⚡

This is the critical step:

```bash
supabase functions deploy generate-quiz
```

Wait for it to say "Deployed Function generate-quiz" or similar success message.

### Step 6: Test It!

1. **Refresh your browser** (hard refresh: Cmd+Shift+R on Mac)
2. **Test YouTube URL:**
   - Select "YouTube URL" tab
   - Paste: `https://www.youtube.com/watch?v=s_47c50zXQQ`
   - Click "Generate Quiz"
   - Should work! ✅

3. **Test Paste Transcript:**
   - Select "Paste Transcript" tab
   - Paste your transcript
   - Click "Generate Quiz"
   - Should work! ✅

## What the Updated Function Does

- ✅ Accepts YouTube URLs and fetches transcripts server-side (no CORS!)
- ✅ Accepts pasted transcripts (with or without timestamps)
- ✅ Automatically removes timestamps from transcripts
- ✅ Generates quizzes using Anthropic API

## If It Still Doesn't Work

### Check Function Logs:

```bash
supabase functions logs generate-quiz
```

This shows any errors.

### Verify Function is Deployed:

```bash
supabase functions list
```

Should show `generate-quiz` in the list.

### Check Your Environment Variables:

Make sure your `.env` file has:
```
VITE_SUPABASE_URL=https://jbumdbqfglovurosqgjx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Restart Your Dev Server:

Stop your dev server (Ctrl+C) and restart:
```bash
npm run dev
```

## Summary

**The ONE thing you need to do:**
```bash
supabase functions deploy generate-quiz
```

That's it! Everything else should already be set up. After deployment, both YouTube URLs and transcript pasting will work.

