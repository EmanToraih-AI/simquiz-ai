# Supabase Edge Functions

## Deploying the generate-quiz Function

This Edge Function proxies requests to the Anthropic API to avoid CORS issues.

### Prerequisites

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```
   (Find your project ref in your Supabase dashboard URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`)

### Set Environment Variables

Set the Anthropic API key as a secret in Supabase:

```bash
supabase secrets set ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### Deploy the Function

```bash
supabase functions deploy generate-quiz
```

### Local Development (Optional)

To test locally:

```bash
supabase functions serve generate-quiz --env-file .env.local
```

Create `.env.local` with:
```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### Verify Deployment

After deployment, the function will be available at:
`https://YOUR_PROJECT_REF.supabase.co/functions/v1/generate-quiz`

The quiz generator in your frontend will automatically use this endpoint.

