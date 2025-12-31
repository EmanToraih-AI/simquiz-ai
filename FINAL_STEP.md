# Final Step - Update Model Name

Great! Your Edge Function is now working! ✅ The JWT token is correct and JWT verification is OFF.

The only remaining issue is the Anthropic model name. I've updated the code - now you just need to update it in the Supabase dashboard:

## Update the Model Name in Supabase Dashboard:

1. Go to: https://supabase.com/dashboard/project/jbumdbqfglovurosqgjx/functions/generate-quiz/code

2. Find this line (around line 31):
   ```typescript
   const { prompt, model = 'claude-3-5-sonnet-20240620', max_tokens = 4000 } = await req.json()
   ```

3. Change it to:
   ```typescript
   const { prompt, model = 'claude-3-5-sonnet-20241022', max_tokens = 4000 } = await req.json()
   ```

4. Click "Deploy" or save (it should auto-deploy)

5. Restart your dev server:
   ```bash
   # Stop the server (Ctrl+C) and restart:
   npm run dev
   ```

6. Refresh your browser and try generating a quiz again!

---

## Summary of What We Fixed:

✅ JWT verification is OFF  
✅ Correct anon key (JWT token) is in `.env`  
✅ Function is deployed and working  
✅ Just need to update the model name to `claude-3-5-sonnet-20241022`

