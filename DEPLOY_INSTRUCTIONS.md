# Deploy Supabase Edge Function - Step by Step Guide

Follow these steps in your terminal to deploy the `generate-quiz` Edge Function:

## Step 1: Login to Supabase
Open your terminal and run:
```bash
cd '/Users/emantoraih/Documents/4 Upstate/ET-Sim-websites/simquiz-ai-website/simquiz-ai'
supabase login
```

This will open a browser window for you to authenticate. Follow the prompts.

## Step 2: Link Your Project
After logging in, link your Supabase project (project ref: `jbumdbqfglovurosqgjx`):
```bash
supabase link --project-ref jbumdbqfglovurosqgjx
```

## Step 3: Set the Anthropic API Key Secret
Set your Anthropic API key as a Supabase secret:
```bash
supabase secrets set ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

## Step 4: Deploy the Function
Deploy the `generate-quiz` Edge Function:
```bash
supabase functions deploy generate-quiz
```

## Step 5: Verify
After deployment, test your quiz generator in the browser. The function will be available at:
`https://jbumdbqfglovurosqgjx.supabase.co/functions/v1/generate-quiz`

---

## Troubleshooting

**If you get "Access token not provided":**
- Make sure you've completed `supabase login` and authenticated in the browser

**If you get "Invalid project ref format":**
- Make sure you're using: `jbumdbqfglovurosqgjx` (without https:// or .supabase.co)

**If the function deploys but still doesn't work:**
- Check that the secret was set correctly: `supabase secrets list`
- Check function logs: `supabase functions logs generate-quiz`

