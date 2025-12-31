# Redeploy the Function with Fixed Model Name

The function is deployed, but it's using the wrong Anthropic model name. I've fixed the code - now you need to redeploy it.

## Option 1: Redeploy via Supabase Dashboard (Easiest)

1. **Go to your function in the dashboard:**
   - https://supabase.com/dashboard/project/jbumdbqfglovurosqgjx/functions/generate-quiz

2. **Click on the "Code" tab**

3. **Update the model name:**
   - Find the line: `const { prompt, model = 'claude-3-5-sonnet-20241022', max_tokens = 4000 }`
   - Change it to: `const { prompt, model = 'claude-3-5-sonnet-20240620', max_tokens = 4000 }`

4. **Click "Deploy" or save** (it should auto-deploy)

## Option 2: Redeploy via CLI

If you have the CLI linked:

```bash
cd '/Users/emantoraih/Documents/4 Upstate/ET-Sim-websites/simquiz-ai-website/simquiz-ai'
supabase functions deploy generate-quiz
```

---

**After redeploying**, refresh your browser and try generating a quiz again. The function should now work correctly!

