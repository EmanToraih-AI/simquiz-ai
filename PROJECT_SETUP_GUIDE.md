# SimQuiz AI - Complete Setup Guide

## Project Overview
SimQuiz AI is a medical education web application that generates quiz questions from YouTube videos or transcripts using Claude AI.

## Tech Stack
- React 18.3
- TypeScript
- Vite 5.4
- Tailwind CSS
- React Router 7
- Lucide React (icons)
- Claude AI (Anthropic API)

## Quick Start

### 1. Create New Vite Project
```bash
npm create vite@latest simquiz-ai -- --template react-ts
cd simquiz-ai
```

### 2. Install Dependencies
```bash
npm install react-router-dom lucide-react @supabase/supabase-js
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 3. Configure Tailwind

**tailwind.config.js:**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

**src/index.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4. Create .env File
```
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Project Structure
```
simquiz-ai/
├── src/
│   ├── components/
│   │   ├── LandingPage.tsx
│   │   └── DemoPage.tsx
│   ├── utils/
│   │   └── quizGenerator.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

## Getting Your Anthropic API Key

1. Visit https://console.anthropic.com/
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Copy to .env file

## Running the Application

```bash
npm run dev
```

Visit http://localhost:5173

## Building for Production

```bash
npm run build
```

## Key Features

### Landing Page
- Hero section with trust badges
- Value proposition cards
- How It Works section
- Testimonials from medical educators
- FAQ section with collapsible items
- Footer with contact info

### Demo/Quiz Page
- Two input modes:
  - YouTube URL (auto-fetches transcript)
  - Manual transcript paste
- Coverage modes:
  - Video content only
  - Comprehensive topic coverage
- 5-20 questions per quiz
- Interactive quiz interface
- Real-time feedback
- Score summary with topic analysis

## File Contents

All source files are located in the original project directory.
Copy the following files exactly as they appear:

1. src/main.tsx
2. src/App.tsx
3. src/index.css
4. src/components/LandingPage.tsx
5. src/components/DemoPage.tsx
6. src/utils/quizGenerator.ts
7. tailwind.config.js
8. vite.config.ts

## Environment Variables

### Required
- `VITE_ANTHROPIC_API_KEY` - Your Anthropic API key for Claude AI

### Optional (for future features)
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

## Troubleshooting

### Issue: Quiz generation fails
- Check that VITE_ANTHROPIC_API_KEY is set correctly
- Ensure you have API credits in your Anthropic account
- For YouTube mode: Verify video has English captions

### Issue: Build errors
- Run `npm install` to ensure all dependencies are installed
- Check that all files are in correct directories
- Verify TypeScript configuration

### Issue: Tailwind styles not working
- Ensure tailwind.config.js has correct content paths
- Check that @tailwind directives are in src/index.css
- Restart dev server after config changes

## Contact

Built by: Eman Toraih, MD, PhD, MSc, DBio
Email: toraihe@upstate.edu
LinkedIn: https://www.linkedin.com/in/eman-toraih-68738686/

## License

Built for SUNY Upstate Medical & Healthcare Educators
