# Alternative: Deploy Edge Function via Supabase Dashboard

Since the CLI linking is having account access issues, you can deploy the Edge Function directly through the Supabase Dashboard:

## Option 1: Use Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard/project/jbumdbqfglovurosqgjx
   - Make sure you're logged in with **emantoraih@outlook.com**

2. **Navigate to Edge Functions:**
   - Click on "Edge Functions" in the left sidebar
   - Click "Create a new function"

3. **Create the Function:**
   - Function name: `generate-quiz`
   - Copy the code from `supabase/functions/generate-quiz/index.ts`

4. **Set the Secret:**
   - Go to Project Settings → Edge Functions → Secrets
   - Add a new secret:
     - Name: `ANTHROPIC_API_KEY`
     - Value: `your_anthropic_api_key_here`

5. **Deploy:**
   - The function should auto-deploy when you save, or click "Deploy"

## Option 2: Fix CLI Login

If you want to use the CLI:

1. **Logout and login again:**
   ```bash
   supabase logout
   supabase login
   ```
   **IMPORTANT:** When the browser opens, make absolutely sure you login with **emantoraih@outlook.com**

2. **Verify you can see the project:**
   ```bash
   supabase projects list
   ```
   You should see `jbumdbqfglovurosqgjx` in the list

3. **Then link:**
   ```bash
   supabase link --project-ref jbumdbqfglovurosqgjx
   ```

