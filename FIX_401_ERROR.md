# Fix 401 Error - Two Options

You're getting a 401 error because the Edge Function requires JWT verification. Here are two ways to fix it:

## Option 1: Disable JWT Verification (Easier - Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/jbumdbqfglovurosqgjx/functions/generate-quiz/details

2. In the "Function Configuration" section, find "Verify JWT with legacy secret"

3. **Turn it OFF** (toggle should be gray/off)

4. Click "Save changes"

5. Now your function will accept requests without strict JWT verification

## Option 2: Fix the Anon Key Format

Your `.env` file shows:
```
VITE_SUPABASE_ANON_KEY=sb_publishable_iWNU2sU8exedTlj6nSyAaw_a0IcQmVa
```

This looks unusual. The anon key should typically be a JWT token (starts with `eyJ...`).

To get the correct anon key:

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/jbumdbqfglovurosqgjx/settings/api

2. Under "Project API keys", find "anon public" key

3. Copy the entire key (it should be a long JWT token)

4. Update your `.env` file:
   ```
   VITE_SUPABASE_ANON_KEY=<paste the correct anon key here>
   ```

5. Restart your dev server: `npm run dev`

---

**I recommend Option 1** (disabling JWT verification) as it's simpler and your function doesn't need user authentication anyway - it just needs to proxy the Anthropic API call.

