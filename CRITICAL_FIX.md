# Critical Fix - Two Issues to Resolve

You have TWO issues that need to be fixed:

## Issue 1: JWT Verification is Still ON ⚠️

In the Supabase Dashboard, the "Verify JWT with legacy secret" toggle is still **ON** (enabled). This is causing authentication errors.

**Fix:**
1. Go to: https://supabase.com/dashboard/project/jbumdbqfglovurosqgjx/functions/generate-quiz/details
2. Scroll to "Function Configuration"
3. Find "Verify JWT with legacy secret"
4. **Turn it OFF** (toggle should be gray)
5. Click **"Save changes"** (very important!)

## Issue 2: Anon Key Format Looks Wrong ⚠️

Your `.env` file has:
```
VITE_SUPABASE_ANON_KEY=sb_publishable_iWNU2sU8exedTlj6nSyAaw_a0IcQmVa
```

This format (`sb_publishable_...`) is unusual. Supabase anon keys are typically JWT tokens starting with `eyJ...`.

**Fix:**
1. Go to: https://supabase.com/dashboard/project/jbumdbqfglovurosqgjx/settings/api
2. Under "Project API keys", find the **"anon public"** key
3. Copy the entire key (it should be a long JWT token like `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
4. Update your `.env` file:
   ```
   VITE_SUPABASE_ANON_KEY=<paste the correct anon key here>
   ```
5. **Restart your dev server:**
   ```bash
   # Stop the server (Ctrl+C) and restart:
   npm run dev
   ```

## After Both Fixes:

1. Make sure JWT verification is OFF
2. Make sure you have the correct anon key
3. Restart your dev server
4. Refresh your browser
5. Try generating a quiz again

Both of these issues must be fixed for the function to work!

