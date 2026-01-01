# Deploy Edge Function via Supabase Dashboard (Easier Method)

Since the CLI is having access issues, you can deploy directly through the Supabase Dashboard - this is actually easier!

## Step 1: Go to Supabase Dashboard

1. Open your browser
2. Go to: https://supabase.com/dashboard/project/jbumdbqfglovurosqgjx/functions
3. Make sure you're logged in with the account that owns the project

## Step 2: Edit the Existing Function

1. Click on the **`generate-quiz`** function (it should already exist)
2. Click **"Edit Function"** or the code editor icon
3. You'll see the current function code

## Step 3: Replace with Updated Code

1. **Select all** the existing code (Cmd+A on Mac)
2. **Delete it**
3. **Copy the code** from your local file: `supabase/functions/generate-quiz/index.ts`
   - Open it in your code editor
   - Copy all the content
4. **Paste it** into the Supabase dashboard editor
5. Click **"Deploy"** or **"Save"**

## Step 4: Verify the Secret is Set

1. Go to: https://supabase.com/dashboard/project/jbumdbqfglovurosqgjx/settings/functions
2. Look for **"Secrets"** section
3. Make sure `ANTHROPIC_API_KEY` is listed with your API key
4. If not, click **"Add secret"** and add it

## Step 5: Test It!

1. Refresh your app: http://localhost:5173/demo
2. Try generating a quiz with YouTube URL or transcript
3. Should work! ✅

## Alternative: View the Code File

If you want to see the code to copy, you can view it locally:

```bash
cat '/Users/emantoraih/Documents/4 Upstate/ET-Sim-websites/simquiz-ai-website/simquiz-ai/supabase/functions/generate-quiz/index.ts'
```

Then copy the output and paste it into the Supabase dashboard.

