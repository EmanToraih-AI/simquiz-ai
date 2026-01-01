# YouTube URL Issue - "Unexpected end of JSON input"

## What's Happening

✅ **Paste Transcript works** - Good!  
❌ **YouTube URL fails** - "Unexpected end of JSON input"

This error means YouTube's transcript API is not returning valid JSON. This can happen if:
1. The video doesn't have captions/subtitles enabled
2. YouTube's API format has changed
3. The video has captions but in a different format

## Solution: Updated Code

I've improved the error handling in the Edge Function code. The updated code:
- ✅ Checks for empty responses
- ✅ Validates JSON before parsing
- ✅ Provides clear error messages
- ✅ Guides users to use "Paste Transcript" when YouTube fails

## Deploy the Updated Code

The code in `supabase/functions/generate-quiz/index.ts` has been updated. Copy it to Supabase Dashboard:

1. **Open:** `supabase/functions/generate-quiz/index.ts`
2. **Copy all code** (Cmd+A, Cmd+C)
3. **Go to:** https://supabase.com/dashboard/project/jbumdbqfglovurosqgjx/functions/generate-quiz
4. **Paste** into the editor
5. **Deploy**

## Alternative: Use Paste Transcript

Since Paste Transcript works perfectly, you can:

1. Open the YouTube video
2. Click "..." → Show Transcript
3. Copy all text
4. Use "Paste Transcript" tab
5. Paste and generate quiz ✅

This always works, regardless of YouTube API issues!

## Why YouTube API Fails

YouTube's transcript API (`/api/timedtext`) is:
- Not an official public API
- Can be unreliable
- May return different formats
- May not work for all videos

**Using "Paste Transcript" is more reliable** and gives users full control.

