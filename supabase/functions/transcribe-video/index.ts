import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

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
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'OPENAI_API_KEY not configured. Please add it to your Supabase secrets.' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    // Parse multipart form data
    const formData = await req.formData()
    const videoFile = formData.get('video') as File
    
    if (!videoFile) {
      return new Response(
        JSON.stringify({ error: 'No video file provided' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    // Check file size (Whisper has a 25MB limit)
    const MAX_SIZE = 25 * 1024 * 1024 // 25MB
    if (videoFile.size > MAX_SIZE) {
      return new Response(
        JSON.stringify({ 
          error: `Video file is too large (${(videoFile.size / 1024 / 1024).toFixed(2)}MB). Maximum size is 25MB. Please compress the video or upload a shorter clip.` 
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    // Check file type
    const allowedTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'audio/mpeg', 'audio/wav', 'audio/mp4']
    if (!allowedTypes.includes(videoFile.type)) {
      return new Response(
        JSON.stringify({ 
          error: `Invalid file type: ${videoFile.type}. Supported formats: MP4, MPEG, MOV, AVI, WEBM, MP3, WAV` 
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    // Create form data for OpenAI
    const openaiFormData = new FormData()
    openaiFormData.append('file', videoFile)
    openaiFormData.append('model', 'whisper-1')
    openaiFormData.append('response_format', 'text')
    openaiFormData.append('language', 'en')

    // Call OpenAI Whisper API
    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: openaiFormData,
    })

    if (!whisperResponse.ok) {
      const errorText = await whisperResponse.text()
      return new Response(
        JSON.stringify({ 
          error: `Failed to transcribe video: ${whisperResponse.status} ${whisperResponse.statusText}. ${errorText}` 
        }),
        {
          status: whisperResponse.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    const transcript = await whisperResponse.text()
    
    if (!transcript || transcript.trim().length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Transcription resulted in empty text. The video may not contain any speech or the audio quality is too low.' 
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        transcript: transcript.trim(),
        wordCount: transcript.split(/\s+/).length
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: `Transcription failed: ${error.message}` }),
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

