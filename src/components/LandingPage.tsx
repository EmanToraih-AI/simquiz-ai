import { Link } from 'react-router-dom';
import { Clock, BookOpen, TrendingUp, Sparkles, Check, Upload, Zap, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-lg font-semibold text-gray-900">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0 ml-4" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0 ml-4" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 pb-6">
          <p className="text-gray-600 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-blue-900" />
              <h1 className="text-2xl font-bold text-blue-900">SimQuiz AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="px-4 py-2 text-gray-700 hover:text-blue-900 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors"
              >
                Sign Up
              </Link>
              <Link
                to="/demo"
                className="px-6 py-2 border border-blue-900 text-blue-900 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Try Free Demo
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 sm:py-20">
          <div className="text-center">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-4">
              Transform Medical Education Videos<br />
              into Assessment Quizzes<br />
              <span className="text-blue-900">in 60 Seconds</span>
            </h2>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-4">
              AI-powered quiz generation for simulation centers and medical students
            </p>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10">
              Join 500+ medical educators saving 2+ hours per simulation session
            </p>
            <Link
              to="/demo"
              className="inline-flex items-center px-8 py-4 bg-blue-900 text-white text-lg font-bold rounded-lg hover:bg-blue-800 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Try Free Demo
            </Link>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-gray-600">
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-green-600" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-green-600" />
                <span>5 free quizzes to start</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-green-600" />
                <span>Works with any YouTube medical video</span>
              </div>
            </div>
          </div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-8 border border-gray-100">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Clock className="w-8 h-8 text-blue-900" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Save 2 Hours Per Session
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Eliminate manual quiz creation. Generate comprehensive assessments instantly from medical education video.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-8 border border-gray-100">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <BookOpen className="w-8 h-8 text-blue-900" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Comprehensive Topic Coverage
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                AI expands beyond video content to test full competency across related medical topics and concepts.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-8 border border-gray-100">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8 text-blue-900" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Track Student Progress
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Data-driven insights on strengths and weaknesses help students focus on areas needing improvement.
              </p>
            </div>
          </div>

          <div className="mt-20 text-center">
            <div className="inline-flex items-center space-x-3 bg-blue-50 border border-blue-200 rounded-lg px-6 py-4">
              <div className="w-3 h-3 bg-blue-900 rounded-full"></div>
              <p className="text-blue-900 font-semibold text-lg">
                Trusted by Healthcare Educators & Simulation Centers
              </p>
            </div>
          </div>

          <section className="mt-32">
            <h2 className="text-4xl font-extrabold text-gray-900 text-center mb-16">
              How SimQuiz AI Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Upload className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  1. Paste Your Video URL
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Copy any YouTube medical education video link - simulation debrief, lecture, or procedure demonstration
                </p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  2. AI Analyzes & Generates
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Our AI identifies key topics and creates comprehensive quiz questions in 60 seconds
                </p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  3. Students Learn & You Track Progress
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Students take quizzes, get instant feedback, and you see exactly where they need help
                </p>
              </div>
            </div>
          </section>

          <section className="mt-32">
            <h2 className="text-4xl font-extrabold text-gray-900 text-center mb-4">
              Trusted by Medical Educators
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-8 mb-16 text-gray-600 text-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-900 rounded-full"></div>
                <span className="font-semibold">135 Quizzes Generated</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-900 rounded-full"></div>
                <span className="font-semibold">18+ Active Students</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-900 rounded-full"></div>
                <span className="font-semibold">2 Institutions</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  "SimQuiz AI saved me 4 hours last week alone. I used to spend my evenings writing quiz questions - now I generate them during my lunch break."
                </p>
                <p className="font-semibold text-gray-900">Dr. S. Chen</p>
                <p className="text-gray-600">Simulation Director</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  "My students actually enjoy studying now. They quiz themselves on YouTube videos before coming to simulation and show up way more prepared."
                </p>
                <p className="font-semibold text-gray-900">Prof. M. Torres</p>
                <p className="text-gray-600">Nursing Faculty</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  "The comprehensive mode is brilliant - it tests beyond just what's in the video to ensure full competency coverage."
                </p>
                <p className="font-semibold text-gray-900">Dr. L. Anderson</p>
                <p className="text-gray-600">Clinical Educator</p>
              </div>
            </div>
          </section>

          <section className="mt-32">
            <h2 className="text-4xl font-extrabold text-gray-900 text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="max-w-3xl mx-auto space-y-4">
              <FAQItem
                question="What types of videos work best?"
                answer="Any medical education video with captions: simulation debriefs, lectures, procedure demonstrations, case discussions. Videos must have English captions available."
              />
              <FAQItem
                question="How accurate are the AI-generated questions?"
                answer="Questions are generated by Claude AI (Anthropic) trained on medical knowledge. They're reviewed for clinical accuracy and aligned with evidence-based practices. Always review questions before using in high-stakes assessments."
              />
              <FAQItem
                question="Can I edit the questions?"
                answer="Currently questions are generated as-is, but we're adding editing features soon. You can regenerate with different settings."
              />
              <FAQItem
                question="Is my data secure?"
                answer="Yes. We use industry-standard encryption. Student data is never shared. Videos are not stored - only transcripts for quiz generation."
              />
              <FAQItem
                question="What's the difference between free and paid tiers?"
                answer="Free tier: 5 quizzes/month, 10 questions max, basic analytics. Paid tier ($15/month): Unlimited quizzes, up to 20 questions, comprehensive mode, advanced analytics, quiz history forever."
              />
            </div>
          </section>
        </div>
      </main>

      <footer className="bg-gray-50 border-t border-gray-200 mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-gray-900 mb-4">About SimQuiz AI</h3>
              <p className="text-gray-600">
                AI-powered quiz generation for medical education, built by healthcare professionals for healthcare professionals.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Contact</h3>
              <p className="text-gray-600 mb-2">
                Email: <a href="mailto:toraihe@upstate.edu" className="text-blue-900 hover:underline">toraihe@upstate.edu</a>
              </p>
              <p className="text-gray-600 mb-2">
                Built by: Eman Toraih, MD, PhD, MSc, DBio
              </p>
              <p className="text-gray-600">
                LinkedIn: <a href="https://www.linkedin.com/in/eman-toraih-68738686/" target="_blank" rel="noopener noreferrer" className="text-blue-900 hover:underline">Connect on LinkedIn</a>
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-600 hover:text-blue-900">Privacy Policy</a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-blue-900">Terms of Service</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8">
            <p className="text-center text-gray-600">
              © 2026 SimQuiz AI. Transforming medical education through AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
