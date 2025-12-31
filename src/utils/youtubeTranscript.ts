/**
 * Alternative YouTube transcript fetching methods
 * The YouTube API endpoint may be blocked, so we provide alternatives
 */

export async function getYouTubeTranscript(videoUrl: string): Promise<string> {
  const videoId = extractVideoId(videoUrl)

  // Try method 1: YouTube's official API (may be blocked)
  try {
    const response = await fetch(
      `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=json3`,
      { mode: 'no-cors' }
    )

    if (response.ok) {
      const data = await response.json()
      return (
        data.events
          ?.filter((e: any) => e.segs)
          .map((e: any) => e.segs.map((s: any) => s.utf8).join(''))
          .join(' ') || ''
      )
    }
  } catch (error) {
    console.log('Method 1 failed, trying alternative...')
  }

  // Try method 2: Using yt-dlp or similar service (requires backend)
  // For now, we'll throw an error and ask user to paste transcript
  throw new Error(
    'YouTube transcript API is not accessible from the browser. Please:\n' +
      '1. Open the YouTube video\n' +
      '2. Click the "..." menu\n' +
      '3. Select "Show transcript"\n' +
      '4. Copy all the text\n' +
      '5. Use the "Paste Transcript" option instead'
  )
}

function extractVideoId(url: string): string {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^&\n?#]+)/
  )
  if (!match?.[1]) throw new Error('Invalid YouTube URL')
  return match[1]
}

