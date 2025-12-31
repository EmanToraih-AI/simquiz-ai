# Update Model Name in Supabase Dashboard

The correct model name is `claude-sonnet-4-20250514`. I've updated the local code files, but you also need to update it in the Supabase dashboard:

## Steps:

1. **Go to your function in Supabase:**
   - https://supabase.com/dashboard/project/jbumdbqfglovurosqgjx/functions/generate-quiz/code

2. **Find line 31** (or search for "model =") and change:
   ```typescript
   const { prompt, model = 'claude-3-5-sonnet-20240620', max_tokens = 4000 } = await req.json()
   ```
   
   To:
   ```typescript
   const { prompt, model = 'claude-sonnet-4-20250514', max_tokens = 4000 } = await req.json()
   ```

3. **Save/Deploy** the function (it should auto-deploy when you save)

4. **Restart your dev server** (if it's running):
   ```bash
   # Stop (Ctrl+C) and restart:
   npm run dev
   ```

5. **Refresh your browser** and try generating a quiz again!

---

**The function is working correctly** - it was just using the wrong Anthropic model name. After updating it in the dashboard, everything should work! ✅

