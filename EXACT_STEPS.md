# Exact Steps to Fix "Prompt is Required" Error

## Current Situation

✅ **Good News:** Your local code is already updated and correct!  
❌ **Problem:** The deployed Edge Function on Supabase still has old code  
🔧 **Solution:** Deploy the updated code

## What Needs to Happen

The code in `supabase/functions/generate-quiz/index.ts` is already correct. You just need to deploy it to Supabase.

---

## Method 1: Deploy via Supabase Dashboard (RECOMMENDED - No CLI needed)

This is the easiest method since you're having CLI permission issues.

### Step 1: Open the Function in Dashboard

1. Go to: https://supabase.com/dashboard/project/jbumdbqfglovurosqgjx/functions/generate-quiz
2. Click on the **"Code"** tab or **"Edit Function"** button

### Step 2: View Your Local Code

Open this file in your code editor:
```
/Users/emantoraih/Documents/4 Upstate/ET-Sim-websites/simquiz-ai-website/simquiz-ai/supabase/functions/generate-quiz/index.ts
```

### Step 3: Copy ALL the Code

1. Select all code (Cmd+A)
2. Copy it (Cmd+C)

### Step 4: Replace Dashboard Code

1. In Supabase Dashboard, select ALL existing code (Cmd+A)
2. Delete it
3. Paste your new code (Cmd+V)
4. Click **"Deploy"** or **"Save"**

### Step 5: Test

1. Refresh browser: http://localhost:5173/demo
2. Try generating a quiz
3. Should work! ✅

---

## Method 2: Try CLI One More Time (If Dashboard doesn't work)

The script you have references the wrong file. Here's the correct version:

### Step 1: Navigate to Project

```bash
cd '/Users/emantoraih/Documents/4 Upstate/ET-Sim-websites/simquiz-ai-website/simquiz-ai'
```

### Step 2: Make Sure You're Logged In

```bash
supabase login
```

When browser opens, make sure you login with the account that has access to the project.

### Step 3: Link Project

```bash
supabase link --project-ref jbumdbqfglovurosqgjx
```

If this fails with permission error, use Method 1 (Dashboard) instead.

### Step 4: Deploy

```bash
supabase functions deploy generate-quiz
```

---

## What Changed in the Code?

### OLD CODE (currently deployed - causes error):
```javascript
const { prompt } = await req.json()
if (!prompt) {
  return error("Prompt is required")  // ❌ This error
}
```

### NEW CODE (in your local file - what you need):
```javascript
const { prompt, videoUrl, transcript, numQuestions, coverageMode } = body

// Supports BOTH old and new formats
if (prompt) {
  // Old format - still works
} else {
  // NEW format - handles videoUrl/transcript
  if (videoUrl) {
    finalTranscript = await getYouTubeTranscript(videoUrl)  // ✅ Fetches server-side
  }
  // Clean timestamps
  // Generate quiz
}
```

---

## Verification Checklist

After deployment, verify:

- [ ] Function shows "Deployed" or "Active" status
- [ ] Can access: http://localhost:5173/demo
- [ ] YouTube URL tab works (pastes URL, generates quiz)
- [ ] Paste Transcript tab works (pastes text, generates quiz)
- [ ] No more "Prompt is required" error

---

## If Dashboard Method Doesn't Work

If you can't access the dashboard or edit the function:

1. Make sure you're logged in with the correct account
2. Check that you have write access to the project
3. Try using a different browser or incognito mode
4. Contact Supabase support if project access is restricted

---

## Summary

**The code is already correct in your local file!**

You just need to:
1. Copy it from: `supabase/functions/generate-quiz/index.ts`
2. Paste it into Supabase Dashboard
3. Deploy

That's it! 🎉

