# 🚀 Complete Setup Instructions - All 3 Options

## What You're Getting

✅ **Option 1: YouTube URL** - Paste YouTube link, auto-fetch transcript  
✅ **Option 2: Upload Video** - Upload .mp4/.mov files, auto-transcribe  
✅ **Option 3: Paste Transcript** - Manual paste (already works!)

---

## Step-by-Step Setup

### STEP 1: Get OpenAI API Key (For Video Upload)

1. Go to: https://platform.openai.com/api-keys
2. Click **"Create new secret key"**
3. Name it: "SimQuiz Video Transcription"
4. **Copy the key** (starts with `sk-proj-...`)
5. **Save it somewhere safe** - you'll need it in Step 3

**Cost**: ~$0.006 per minute (~$0.36 per hour) - Very affordable!

---

### STEP 2: Update Edge Functions in Supabase Dashboard

#### 2A: Update `generate-quiz` Function

1. Go to: https://supabase.com/dashboard/project/jbumdbqfglovurosqgjx/functions/generate-quiz
2. Click **"Edit Function"** or **"Code"** tab
3. Open your local file: `supabase/functions/generate-quiz/index.ts`
4. **Copy ALL code** (Cmd+A, Cmd+C)
5. In Supabase Dashboard, **select all** existing code and **delete it**
6. **Paste** the new code
7. Click **"Deploy"** or **"Save"**

#### 2B: Create `transcribe-video` Function

1. Go to: https://supabase.com/dashboard/project/jbumdbqfglovurosqgjx/functions
2. Click **"Create a new function"**
3. Function name: `transcribe-video`
4. Open your local file: `supabase/functions/transcribe-video/index.ts`
5. **Copy ALL code** (Cmd+A, Cmd+C)
6. **Paste** into Supabase editor
7. Click **"Deploy"** or **"Save"**

---

### STEP 3: Add OpenAI API Key to Supabase Secrets

1. Go to: https://supabase.com/dashboard/project/jbumdbqfglovurosqgjx/settings/functions
2. Scroll to **"Secrets"** section
3. Click **"Add secret"** or **"New secret"**
4. Name: `OPENAI_API_KEY`
5. Value: Paste your OpenAI API key (from Step 1)
6. Click **"Save"**

---

### STEP 4: Test Everything!

1. **Refresh your browser**: http://localhost:5173/demo (Cmd+Shift+R)
2. You should now see **3 tabs**: "YouTube URL", "Upload Video", "Paste Transcript"

#### Test YouTube URL:
- Select "YouTube URL" tab
- Paste: `https://www.youtube.com/watch?v=s_47c50zXQQ`
- Click "Generate Quiz"
- Should work! ✅

#### Test Upload Video:
- Click "Upload Video" tab
- Click to upload a .mp4 file (max 25MB)
- Click "Transcribe Video"
- Wait ~30-60 seconds
- Transcript appears automatically
- Click "Generate Quiz"
- Should work! ✅

#### Test Paste Transcript:
- Click "Paste Transcript" tab
- Paste any transcript text
- Click "Generate Quiz"
- Should work! ✅ (already working)

---

## File Locations

All code is ready in these files:

1. **Edge Function (generate-quiz)**: 
   - `supabase/functions/generate-quiz/index.ts` ✅ Updated with better YouTube fetching

2. **Edge Function (transcribe-video)**: 
   - `supabase/functions/transcribe-video/index.ts` ✅ New file created

3. **Frontend (DemoPage)**: 
   - `src/components/DemoPage.tsx` ✅ Updated with video upload UI

---

## Troubleshooting

### YouTube URL still not working?
- Some videos don't have captions
- YouTube API can be unreliable
- **Solution**: Use "Upload Video" or "Paste Transcript" instead

### Video upload not working?
- Check: `OPENAI_API_KEY` is set in Supabase secrets
- Check: `transcribe-video` function is deployed
- Check: File size is under 25MB
- Check: File format is supported (MP4, MOV, AVI, WEBM)

### Can't see "Upload Video" tab?
- Make sure you refreshed the browser (Cmd+Shift+R)
- Check that `DemoPage.tsx` was updated
- Restart dev server: `npm run dev`

---

## Summary Checklist

- [ ] Got OpenAI API key
- [ ] Updated `generate-quiz` function in Supabase
- [ ] Created `transcribe-video` function in Supabase
- [ ] Added `OPENAI_API_KEY` to Supabase secrets
- [ ] Refreshed browser
- [ ] Tested all 3 options

**Once all checked, you're done!** 🎉

---

## What Each Option Does

### 1. YouTube URL
- User pastes YouTube link
- System tries to fetch transcript automatically
- **Best for**: Public videos with captions
- **Cost**: Free
- **Reliability**: ⚠️ Depends on YouTube API

### 2. Upload Video
- User uploads .mp4/.mov file
- System transcribes using OpenAI Whisper
- **Best for**: Private simulation videos
- **Cost**: ~$0.006/minute
- **Reliability**: ✅✅✅ 100%

### 3. Paste Transcript
- User manually pastes transcript text
- **Best for**: Already have transcript
- **Cost**: Free
- **Reliability**: ✅✅✅ 100%

---

## Next Steps After Setup

1. Test with a real simulation video
2. Create sample quizzes for demo
3. Prepare presentation for SUNY
4. Consider pricing for video upload feature (premium?)

**You're all set!** 🚀

