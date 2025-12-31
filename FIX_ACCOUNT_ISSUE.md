# Fix Supabase Account Issue

You're currently logged into the wrong Supabase account. Follow these steps:

## Step 1: Logout from Current Account
In your terminal, run:
```bash
cd '/Users/emantoraih/Documents/4 Upstate/ET-Sim-websites/simquiz-ai-website/simquiz-ai'
supabase logout
```
Type `y` when prompted to confirm logout.

## Step 2: Login with Correct Account (emantoraih@outlook.com)
Run:
```bash
supabase login
```
- This will open a browser window
- **Make sure to login with emantoraih@outlook.com** (the account that has access to your Supabase project)
- Authorize the CLI access

## Step 3: Link Your Project Directly
After logging in with the correct account, link using your project ref:
```bash
supabase link --project-ref jbumdbqfglovurosqgjx
```

## Step 4: Set the API Key Secret
```bash
supabase secrets set ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

## Step 5: Deploy the Function
```bash
supabase functions deploy generate-quiz
```

---

**Important:** Make sure you're logged into Supabase with **emantoraih@outlook.com** (the account that owns/has access to project `jbumdbqfglovurosqgjx`).

