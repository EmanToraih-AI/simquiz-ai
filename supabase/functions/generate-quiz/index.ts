import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')

// Extract video ID from YouTube URL
function extractVideoId(url: string): string {
  const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^&\n?#]+)/)
  if (!match?.[1]) throw new Error('Invalid YouTube URL')
  return match[1]
}

// Clean timestamps from transcript text
// Handles formats like: "00:00:15 text", "00:15 text", "[00:00:15] text", "0:09 text", etc.
function cleanTranscript(transcript: string): string {
  if (!transcript || transcript.trim().length === 0) {
    return transcript
  }
  
  // Remove timestamp patterns:
  // - [00:00:15] or [00:15] or [0:09]
  // - 00:00:15 or 00:15 or 0:09 at start of line
  // - (00:00:15) or (00:15) or (0:09)
  let cleaned = transcript
    // Remove brackets with timestamps: [00:00:15] or [00:15] or [0:09]
    .replace(/\[\d{1,2}:\d{2}(?::\d{2})?\]/g, '')
    // Remove parentheses with timestamps: (00:00:15) or (00:15) or (0:09)
    .replace(/\(\d{1,2}:\d{2}(?::\d{2})?\)/g, '')
    // Remove timestamps at start of line: 00:00:15 or 00:15 or 0:09
    .replace(/^\d{1,2}:\d{2}(?::\d{2})?\s+/gm, '')
    // Remove standalone timestamps on their own line
    .replace(/^\d{1,2}:\d{2}(?::\d{2})?$/gm, '')
  
  // Clean up multiple spaces and normalize whitespace
  cleaned = cleaned
    .split('\n')
    .map(line => line.trim())
    .filter(line => {
      // Remove lines that are only timestamps or whitespace
      return line.length > 0 && !/^\d{1,2}:\d{2}(?::\d{2})?$/.test(line)
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
  
  // If cleaning removed everything, return original (shouldn't happen, but safety check)
  if (cleaned.length === 0 && transcript.trim().length > 0) {
    return transcript.trim()
  }
  
  return cleaned
}

// Fetch YouTube transcript (server-side, no CORS issues!)
async function getYouTubeTranscript(videoUrl: string): Promise<string> {
  const videoId = extractVideoId(videoUrl)
  
  try {
    // Try YouTube's official transcript API
    const response = await fetch(
      `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=json3`
    )
    
    if (!response.ok) {
      throw new Error(`YouTube API returned ${response.status}. The video may not have captions enabled.`)
    }
    
    const data = await response.json()
    const transcript = data.events
      ?.filter((e: any) => e.segs)
      .map((e: any) => e.segs.map((s: any) => s.utf8).join(''))
      .join(' ') || ''
    
    if (!transcript) {
      throw new Error('No transcript found. The video may not have captions enabled.')
    }
    
    return transcript
  } catch (error) {
    throw new Error(`Failed to fetch YouTube transcript: ${error.message}`)
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    if (!ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    // Support both old format (prompt) and new format (videoUrl/transcript)
    const body = await req.json()
    const { prompt, videoUrl, transcript, numQuestions, coverageMode, model = 'claude-sonnet-4-20250514', max_tokens = 4000 } = body

    // If prompt is provided (old format), use it directly
    if (prompt) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        return new Response(
          JSON.stringify({ error: `Anthropic API error: ${response.status} ${errorText}` }),
          {
            status: response.status,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        )
      }

      const data = await response.json()
      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    // New format: fetch transcript if videoUrl provided
    let finalTranscript = transcript
    if (videoUrl && !transcript) {
      try {
        finalTranscript = await getYouTubeTranscript(videoUrl)
      } catch (error: any) {
        return new Response(
          JSON.stringify({ error: error.message }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        )
      }
    }

    if (!finalTranscript) {
      return new Response(
        JSON.stringify({ error: 'Either videoUrl or transcript is required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    // Clean timestamps from transcript (handles manually pasted transcripts with timestamps)
    finalTranscript = cleanTranscript(finalTranscript)

    // Check if transcript is still valid after cleaning
    if (!finalTranscript || finalTranscript.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Transcript is empty or invalid after processing. Please check your transcript and try again.' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    if (!numQuestions || !coverageMode) {
      return new Response(
        JSON.stringify({ error: 'numQuestions and coverageMode are required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    // Build the prompt
    const isComprehensive = coverageMode === 'comprehensive'
    const promptText = `You are an expert medical educator creating ${isComprehensive ? 'comprehensive' : 'video-specific'} assessment questions.

TRANSCRIPT: ${finalTranscript.substring(0, 3000)}${finalTranscript.length > 3000 ? '...' : ''}

${isComprehensive ? `
COMPREHENSIVE MODE - Generate ${numQuestions} questions:
- 40% test what happened in this video
- 60% test broader best practices for topics mentioned
Example: If video mentions "PPE" → ask "What did learner forget?" (video) AND "Why are gloves important in all patient care?" (comprehensive)
` : `
VIDEO-ONLY MODE - Generate ${numQuestions} questions:
- Questions ONLY answerable by watching this specific video
- Focus on specific details, names, what was said/done
- Do NOT ask general knowledge questions
`}

Return ONLY valid JSON:
{
  "title": "Quiz title",
  "topics": ["topic1", "topic2"],
  "questions": [
    {
      "id": 1,
      "question": "Question text?",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correctAnswer": 0,
      "explanation": "Clear explanation",
      "difficulty": "basic",
      "source": "${isComprehensive ? 'video or expanded' : 'video'}"
    }
  ]
}

Generate ${numQuestions} questions now. No other text.`

    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens,
        messages: [{ role: 'user', content: promptText }],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return new Response(
        JSON.stringify({ error: `Anthropic API error: ${response.status} ${errorText}` }),
        {
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    const data = await response.json()
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
})
