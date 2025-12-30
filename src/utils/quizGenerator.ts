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

function extractVideoId(url: string): string {
  const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^&\n?#]+)/);
  if (!match?.[1]) throw new Error('Invalid YouTube URL');
  return match[1];
}

async function getYouTubeTranscript(videoUrl: string): Promise<string> {
  const videoId = extractVideoId(videoUrl);

  try {
    const response = await fetch(
      `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=json3`
    );

    if (!response.ok) {
      throw new Error('Transcript not available');
    }

    const data = await response.json();
    return data.events
      ?.filter((e: any) => e.segs)
      .map((e: any) => e.segs.map((s: any) => s.utf8).join(''))
      .join(' ') || '';
  } catch {
    throw new Error('Could not fetch transcript. Video may not have captions or may be private.');
  }
}

export async function generateQuiz(
  videoUrl: string | null,
  numQuestions: number,
  coverageMode: 'video-content-only' | 'comprehensive',
  directTranscript?: string
): Promise<Quiz> {

  let transcript: string;

  if (directTranscript) {
    transcript = directTranscript;
  } else if (videoUrl) {
    transcript = await getYouTubeTranscript(videoUrl);
  } else {
    throw new Error('Either videoUrl or directTranscript must be provided');
  }

  const isComprehensive = coverageMode === 'comprehensive';

  const prompt = `You are an expert medical educator creating ${isComprehensive ? 'comprehensive' : 'video-specific'} assessment questions.

TRANSCRIPT: ${transcript.substring(0, 3000)}${transcript.length > 3000 ? '...' : ''}

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

Generate ${numQuestions} questions now. No other text.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY || '',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.content[0].text;
  const jsonMatch = content.match(/\{[\s\S]*\}/);

  if (!jsonMatch) throw new Error('Invalid AI response');

  return JSON.parse(jsonMatch[0]);
}
