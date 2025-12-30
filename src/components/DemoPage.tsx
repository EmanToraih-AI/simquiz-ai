import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Loader2, CheckCircle2, XCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import { generateQuiz } from '../utils/quizGenerator';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic?: string;
}

interface QuizResult {
  questionId: number;
  selectedAnswer: number;
  correct: boolean;
}

export default function DemoPage() {
  const [inputMode, setInputMode] = useState<'youtube' | 'transcript'>('youtube');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [transcript, setTranscript] = useState('');
  const [numQuestions, setNumQuestions] = useState('10');
  const [coverageMode, setCoverageMode] = useState('comprehensive');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizTitle, setQuizTitle] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);

  const handleGenerateQuiz = async () => {
    if (inputMode === 'youtube' && !youtubeUrl.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    if (inputMode === 'transcript' && !transcript.trim()) {
      setError('Please paste a transcript');
      return;
    }

    if (!import.meta.env.VITE_ANTHROPIC_API_KEY) {
      setError('Add your Anthropic API key to .env.local to enable quiz generation');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const mode = coverageMode === 'video-only' ? 'video-content-only' : 'comprehensive';
      const quiz = await generateQuiz(
        inputMode === 'youtube' ? youtubeUrl : null,
        parseInt(numQuestions),
        mode as 'video-content-only' | 'comprehensive',
        inputMode === 'transcript' ? transcript : undefined
      );

      setQuestions(quiz.questions);
      setQuizTitle(quiz.title);
      setQuizStarted(true);
      setCurrentQuestionIndex(0);
      setQuizResults([]);
      setShowResults(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate quiz. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (!hasAnswered) {
      setSelectedAnswer(answerIndex);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) {
      alert('Please select an answer');
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    setQuizResults([
      ...quizResults,
      {
        questionId: currentQuestion.id,
        selectedAnswer,
        correct: isCorrect
      }
    ]);
    setHasAnswered(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setHasAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  const handleTryAnother = () => {
    setYoutubeUrl('');
    setTranscript('');
    setQuizStarted(false);
    setQuizTitle('');
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setHasAnswered(false);
    setQuizResults([]);
    setShowResults(false);
    setQuestions([]);
    setError(null);
  };

  const calculateScore = () => {
    const correctAnswers = quizResults.filter(result => result.correct).length;
    const percentage = Math.round((correctAnswers / questions.length) * 100);
    return { correctAnswers, total: questions.length, percentage };
  };

  const getTopicsCovered = () => {
    return [...new Set(questions.map(q => q.topic).filter(Boolean))];
  };

  const getStrongAreas = () => {
    const topicPerformance: { [key: string]: { correct: number; total: number } } = {};

    questions.forEach((question, index) => {
      if (!question.topic) return;
      if (!topicPerformance[question.topic]) {
        topicPerformance[question.topic] = { correct: 0, total: 0 };
      }
      topicPerformance[question.topic].total++;
      if (quizResults[index]?.correct) {
        topicPerformance[question.topic].correct++;
      }
    });

    return Object.entries(topicPerformance)
      .filter(([_, performance]) => performance.correct / performance.total >= 0.7)
      .map(([topic]) => topic);
  };

  const getNeedsReview = () => {
    const topicPerformance: { [key: string]: { correct: number; total: number } } = {};

    questions.forEach((question, index) => {
      if (!question.topic) return;
      if (!topicPerformance[question.topic]) {
        topicPerformance[question.topic] = { correct: 0, total: 0 };
      }
      topicPerformance[question.topic].total++;
      if (quizResults[index]?.correct) {
        topicPerformance[question.topic].correct++;
      }
    });

    return Object.entries(topicPerformance)
      .filter(([_, performance]) => performance.correct / performance.total < 0.7)
      .map(([topic]) => topic);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const score = showResults ? calculateScore() : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-blue-900" />
              <h1 className="text-2xl font-bold text-blue-900">SimQuiz AI</h1>
            </Link>
            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Home</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!quizStarted && !isLoading && (
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Generate Your Quiz
            </h2>

            <div className="space-y-6">
              <div>
                <div className="flex space-x-2 mb-4">
                  <button
                    onClick={() => setInputMode('youtube')}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                      inputMode === 'youtube'
                        ? 'bg-blue-900 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    YouTube URL
                  </button>
                  <button
                    onClick={() => setInputMode('transcript')}
                    className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                      inputMode === 'transcript'
                        ? 'bg-blue-900 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Paste Transcript
                  </button>
                </div>

                {inputMode === 'youtube' ? (
                  <div>
                    <label htmlFor="youtube-url" className="block text-lg font-semibold text-gray-700 mb-2">
                      YouTube Video URL
                    </label>
                    <input
                      id="youtube-url"
                      type="text"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="Paste YouTube video URL here"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
                    />
                  </div>
                ) : (
                  <div>
                    <label htmlFor="transcript" className="block text-lg font-semibold text-gray-700 mb-2">
                      Video Transcript
                    </label>
                    <p className="text-sm text-gray-600 mb-2">
                      To get transcript from YouTube: Open video → Click "..." → Show Transcript → Copy all text
                    </p>
                    <textarea
                      id="transcript"
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                      placeholder="Paste the video transcript here..."
                      rows={10}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all resize-y"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="num-questions" className="block text-lg font-semibold text-gray-700 mb-2">
                    Number of Questions
                  </label>
                  <select
                    id="num-questions"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="15">15</option>
                    <option value="20">20</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="coverage-mode" className="block text-lg font-semibold text-gray-700 mb-2">
                    Coverage Mode
                  </label>
                  <select
                    id="coverage-mode"
                    value={coverageMode}
                    onChange={(e) => setCoverageMode(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
                  >
                    <option value="video-only">Video content only</option>
                    <option value="comprehensive">Comprehensive topic coverage</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleGenerateQuiz}
                className="w-full py-4 bg-blue-900 text-white text-lg font-bold rounded-lg hover:bg-blue-800 transition-colors shadow-md hover:shadow-lg"
              >
                Generate Quiz
              </button>

              {error && (
                <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900">Error</p>
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="bg-white rounded-xl shadow-lg p-12 border border-gray-200">
            <div className="flex flex-col items-center justify-center space-y-6">
              <Loader2 className="w-16 h-16 text-blue-900 animate-spin" />
              <p className="text-xl font-semibold text-gray-700">
                Fetching transcript and generating quiz...
              </p>
            </div>
          </div>
        )}

        {quizStarted && !showResults && currentQuestion && (
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-blue-900 uppercase tracking-wide">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  {currentQuestion.topic}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-900 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {currentQuestion.question}
            </h3>

            <div className="space-y-4 mb-8">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === currentQuestion.correctAnswer;
                const showCorrectAnswer = hasAnswered && isCorrect;
                const showIncorrectAnswer = hasAnswered && isSelected && !isCorrect;

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={hasAnswered}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      showCorrectAnswer
                        ? 'border-green-500 bg-green-50'
                        : showIncorrectAnswer
                        ? 'border-red-500 bg-red-50'
                        : isSelected
                        ? 'border-blue-900 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-900 bg-white'
                    } ${hasAnswered ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-medium text-gray-900">
                        {option}
                      </span>
                      {showCorrectAnswer && (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      )}
                      {showIncorrectAnswer && (
                        <XCircle className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {hasAnswered && (
              <div className={`mb-6 p-4 rounded-lg ${
                selectedAnswer === currentQuestion.correctAnswer
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-blue-50 border border-blue-200'
              }`}>
                <p className="text-gray-800 font-medium">
                  {currentQuestion.explanation}
                </p>
              </div>
            )}

            <div className="flex space-x-4">
              {!hasAnswered ? (
                <button
                  onClick={handleSubmitAnswer}
                  className="flex-1 py-3 bg-blue-900 text-white text-lg font-bold rounded-lg hover:bg-blue-800 transition-colors"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="flex-1 py-3 bg-blue-900 text-white text-lg font-bold rounded-lg hover:bg-blue-800 transition-colors"
                >
                  {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'View Results'}
                </button>
              )}
            </div>
          </div>
        )}

        {showResults && score && (
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Quiz Complete!
            </h2>

            <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-xl p-8 mb-8 text-white text-center">
              <p className="text-lg font-semibold mb-2">Your Score</p>
              <p className="text-5xl font-extrabold mb-2">
                {score.correctAnswers}/{score.total}
              </p>
              <p className="text-2xl font-bold">{score.percentage}%</p>
            </div>

            <div className="space-y-6 mb-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Topics Covered
                </h3>
                <div className="flex flex-wrap gap-2">
                  {getTopicsCovered().map((topic, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-blue-100 text-blue-900 rounded-lg font-semibold"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {getStrongAreas().length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center space-x-2">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                    <span>Strong Areas</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {getStrongAreas().map((topic, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-green-100 text-green-900 rounded-lg font-semibold"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {getNeedsReview().length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center space-x-2">
                    <XCircle className="w-6 h-6 text-red-600" />
                    <span>Needs Review</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {getNeedsReview().map((topic, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-red-100 text-red-900 rounded-lg font-semibold"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleTryAnother}
              className="w-full py-4 bg-blue-900 text-white text-lg font-bold rounded-lg hover:bg-blue-800 transition-colors shadow-md hover:shadow-lg"
            >
              Try Another Video
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
