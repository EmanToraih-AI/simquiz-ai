# YouTube URL Fix - Deploy Instructions

## What Changed?

YouTube URLs now work automatically! The transcript is fetched **server-side** in the Supabase Edge Function, which bypasses browser CORS restrictions.

## Deploy the Updated Function

The `generate-quiz` Edge Function has been updated to:
1. Accept `videoUrl` parameter
2. Fetch YouTube transcript server-side (no CORS!)
3. Generate quiz using the transcript

### Step 1: Deploy Updated Function

Open your terminal and run:

```bash
cd '/Users/emantoraih/Documents/4 Upstate/ET-Sim-websites/simquiz-ai-website/simquiz-ai'
supabase functions deploy generate-quiz
```

### Step 2: Test It!

1. Go to your app: http://localhost:5173/demo (or your dev server)
2. Select "YouTube URL" tab
3. Paste a YouTube URL
4. Click "Generate Quiz"
5. It should work! ✅

## How It Works Now

**Before (broken):**
- Frontend tries to fetch transcript → CORS error ❌

**After (working):**
- Frontend sends YouTube URL to Edge Function
- Edge Function fetches transcript server-side → No CORS! ✅
- Edge Function generates quiz
- Returns quiz to frontend

## Benefits

✅ YouTube URLs work automatically
✅ No more manual transcript copying
✅ Better user experience
✅ Same functionality, just easier to use

