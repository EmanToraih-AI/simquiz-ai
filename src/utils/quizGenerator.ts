const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: string;
  source: string;
}

interface Quiz {
  title: string;
  topics: string[];
  questions: QuizQuestion[];
}

// YouTube transcript fetching is now handled server-side in the Edge Function
// This avoids CORS issues and allows YouTube URLs to work automatically!

export async function generateQuiz(
  transcript: string,
  numQuestions: number,
  coverageMode: 'video-content-only' | 'comprehensive'
): Promise<Quiz> {

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key are required. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
  }

  try {
    // Call Supabase Edge Function which will:
    // 1. Fetch YouTube transcript server-side (if videoUrl provided) - no CORS issues!
    // 2. Generate the quiz using Anthropic API
    const response = await fetch(`${supabaseUrl}/functions/v1/generate-quiz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey
      },
      body: JSON.stringify({
        transcript,
        numQuestions,
        coverageMode,
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      try {
        const errorData = JSON.parse(errorText);
        // Check if it's an Anthropic API error (function is working, but Anthropic rejected)
        if (errorData.error && typeof errorData.error === 'string' && errorData.error.includes('Anthropic API error')) {
          // Extract the actual Anthropic error
          const anthropicErrorMatch = errorData.error.match(/Anthropic API error: \d+ ({.*})/);
          if (anthropicErrorMatch) {
            try {
              const anthropicErr = JSON.parse(anthropicErrorMatch[1]);
              if (anthropicErr.error?.message) {
                errorMessage = `Anthropic API: ${anthropicErr.error.message}`;
              }
            } catch {
              errorMessage = errorData.error;
            }
          } else {
            errorMessage = errorData.error;
          }
        } else {
          errorMessage = errorData.error || errorMessage;
        }
      } catch {
        // Use default error message
      }
      
      // Only show "function not found" if we get a 404 AND no response body (true 404)
      if (response.status === 404 && (!errorText || errorText.trim() === '')) {
        throw new Error('Supabase Edge Function not found. Please deploy the generate-quiz function. See supabase/functions/generate-quiz/ for the function code.');
      } else if (response.status === 500 && errorMessage.includes('ANTHROPIC_API_KEY')) {
        throw new Error('Anthropic API key not configured in Supabase. Please add ANTHROPIC_API_KEY to your Supabase project secrets.');
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const content = data.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) throw new Error('Invalid AI response format');

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to reach the API. Please check your internet connection and that the Supabase Edge Function is deployed.');
    }
    throw error;
  }

}
