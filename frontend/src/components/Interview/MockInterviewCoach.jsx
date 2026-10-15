import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  Award,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
  BrainCircuit,
  Lightbulb,
  ThumbsUp,
  Send,
  Loader2,
  RotateCcw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import PrimaryButton from '../PrimaryButton';
import { generateMockQuestions, evaluateMockAnswer } from '../../services/api';
import toast from 'react-hot-toast';
import { T } from '../../Js/theme';

const POPULAR_ROLES = [
  'Full Stack Developer',
  'Frontend React Engineer',
  'Python Backend Engineer',
  'Data Scientist',
  'DevOps / Cloud Engineer',
  'Product Manager',
];

const INTERVIEW_TYPES = [
  { id: 'technical', label: 'Technical Deep-Dive', desc: 'Architecture, core tools, and technical problem solving' },
  { id: 'system_design', label: 'System Design & Scalability', desc: 'High-level architectures, data flow, and trade-offs' },
  { id: 'behavioral', label: 'Behavioral & Leadership', desc: 'STAR methodology, teamwork, and conflict resolution' },
];

const EXPERIENCE_LEVELS = ['Junior (0-2 yrs)', 'Mid-Level (3-5 yrs)', 'Senior (5+ yrs)'];

export default function MockInterviewCoach({ isOpen, onClose, initialRole = '' }) {
  // Wizard steps: 'setup' | 'interview' | 'question_feedback' | 'scorecard'
  const [step, setStep] = useState('setup');

  // Setup form
  const [role, setRole] = useState(initialRole || 'Full Stack Developer');
  const [prevInitialRole, setPrevInitialRole] = useState(initialRole);

  if (initialRole !== prevInitialRole) {
    setPrevInitialRole(initialRole);
    if (initialRole) setRole(initialRole);
  }

  const [experienceLevel, setExperienceLevel] = useState('Mid-Level (3-5 yrs)');
  const [interviewType, setInterviewType] = useState('technical');

  // Interview state
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  // Audio / Speech
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);

  // History & Evaluations: array of { question, answer, evaluation }
  const [evaluations, setEvaluations] = useState([]);
  const [currentEvaluation, setCurrentEvaluation] = useState(null);
  const [expandedIdeal, setExpandedIdeal] = useState(false);

  // Clean up speech synthesis & recognition on unmount or close
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  if (!isOpen) return null;

  // 1. Start Interview: Generate 4 Questions
  const handleStartInterview = async () => {
    if (!role.trim()) {
      toast.error('Please specify a job role.');
      return;
    }
    setLoading(true);
    try {
      const data = await generateMockQuestions(role.trim(), experienceLevel, interviewType);
      const fetchedQuestions = data.questions || [];
      if (fetchedQuestions.length === 0) {
        throw new Error('No questions returned');
      }
      setQuestions(fetchedQuestions);
      setCurrentIndex(0);
      setCurrentAnswer('');
      setEvaluations([]);
      setCurrentEvaluation(null);
      setStep('interview');
      toast.success('Interview session generated! Good luck.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate interview questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Read Question Aloud using Web Speech Synthesis
  const handleSpeakQuestion = (text) => {
    if (!('speechSynthesis' in window)) {
      toast.error('Text-to-speech is not supported in this browser.');
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // 3. Speech-to-Text Microphone toggle
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice typing is not supported in your browser. (Try Chrome or Edge)');
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        toast('Listening... Speak your answer.', { icon: '🎙️' });
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setCurrentAnswer((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
      setIsRecording(false);
    }
  };

  // 4. Submit Answer for current question
  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) {
      toast.error('Please type or speak your answer before submitting.');
      return;
    }

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
    if (isSpeaking && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    const currentQ = questions[currentIndex];
    setEvaluating(true);

    try {
      const evalData = await evaluateMockAnswer(currentQ.question, currentAnswer.trim(), role);
      setCurrentEvaluation(evalData);
      setEvaluations((prev) => [
        ...prev,
        {
          question: currentQ.question,
          category: currentQ.category,
          answer: currentAnswer.trim(),
          evaluation: evalData,
        },
      ]);
      setStep('question_feedback');
      setExpandedIdeal(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to evaluate answer. Please try again.');
    } finally {
      setEvaluating(false);
    }
  };

  // 5. Proceed to next question or final scorecard
  const handleNextQuestion = () => {
    setShowHint(false);
    setCurrentAnswer('');
    setCurrentEvaluation(null);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setStep('interview');
    } else {
      setStep('scorecard');
    }
  };

  // Compute final scorecard stats
  const overallScore = evaluations.length
    ? Math.round(evaluations.reduce((acc, curr) => acc + (curr.evaluation?.score || 0), 0) / evaluations.length)
    : 0;

  const avgClarity = evaluations.length
    ? Math.round(evaluations.reduce((acc, curr) => acc + (curr.evaluation?.clarity_score || 0), 0) / evaluations.length)
    : 0;

  const avgDepth = evaluations.length
    ? Math.round(evaluations.reduce((acc, curr) => acc + (curr.evaluation?.technical_depth_score || 0), 0) / evaluations.length)
    : 0;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50/70 via-white to-cyan-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, color: 'white' }}>
              <BrainCircuit size={22} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-1.5">
                AI Mock Interview Coach
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700">
                  Interactive
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">Practice realistic role questions with real-time feedback</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7">
          <AnimatePresence mode="wait">
            {/* STEP 1: SETUP */}
            {step === 'setup' && (
              <motion.div
                key="setup"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">Target Job Role</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Senior React Developer, ML Engineer..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  />
                  {/* Chips */}
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {POPULAR_ROLES.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${role === r
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">Experience Level</label>
                    <select
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    >
                      {EXPERIENCE_LEVELS.map((lvl) => (
                        <option key={lvl} value={lvl}>{lvl}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">Interview Format</label>
                    <select
                      value={interviewType}
                      onChange={(e) => setInterviewType(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    >
                      {INTERVIEW_TYPES.map((t) => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Info Card */}
                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-3">
                  <Sparkles size={20} className="text-indigo-600 shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    <span className="font-bold text-slate-800">How it works: </span>
                    Gemini AI will generate 4 role-specific questions. You can answer using voice or keyboard. Each answer is scored immediately with actionable tips and ideal sample answers.
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <PrimaryButton
                    onClick={handleStartInterview}
                    disabled={loading}
                    className="w-full sm:w-auto px-7 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Generating Questions...
                      </>
                    ) : (
                      <>
                        Start Interview Simulation <ArrowRight size={18} />
                      </>
                    )}
                  </PrimaryButton>
                </div>
              </motion.div>
            )}

            {/* STEP 2: ACTIVE QUESTION */}
            {step === 'interview' && questions[currentIndex] && (
              <motion.div
                key={`q-${currentIndex}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
              >
                {/* Progress bar */}
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500 mb-1.5">
                    <span>QUESTION {currentIndex + 1} OF {questions.length}</span>
                    <span className="text-indigo-600">{questions[currentIndex].category || 'Interview Question'}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${((currentIndex + 1) / questions.length) * 100}%`,
                        background: `linear-gradient(90deg, ${T.primary}, ${T.secondary})`,
                      }}
                    />
                  </div>
                </div>

                {/* Question Box */}
                <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm relative">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                      "{questions[currentIndex].question}"
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleSpeakQuestion(questions[currentIndex].question)}
                      className={`p-2.5 rounded-xl border transition-all shrink-0 ${isSpeaking
                        ? 'bg-indigo-600 text-white border-indigo-600 animate-pulse'
                        : 'bg-white text-slate-600 border-slate-200 hover:text-indigo-600 hover:border-indigo-300 shadow-sm'
                        }`}
                      title={isSpeaking ? 'Stop Audio' : 'Listen Question'}
                    >
                      <Volume2 size={18} />
                    </button>
                  </div>

                  {/* Hint Toggle */}
                  {questions[currentIndex].hint && (
                    <div className="mt-3 pt-3 border-t border-slate-200/60">
                      <button
                        type="button"
                        onClick={() => setShowHint(!showHint)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <Lightbulb size={14} />
                        {showHint ? 'Hide Preparation Hint' : 'View Focus Hint'}
                      </button>
                      {showHint && (
                        <p className="mt-2 text-xs text-slate-600 bg-white p-3 rounded-xl border border-indigo-100">
                          {questions[currentIndex].hint}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Candidate Answer Box */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      Your Response
                      {isRecording && (
                        <span className="flex items-center gap-1.5 text-xs text-rose-600 font-bold animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-rose-600" />
                          Recording voice...
                        </span>
                      )}
                    </label>

                    {/* Microphone button */}
                    <button
                      type="button"
                      onClick={toggleSpeechRecognition}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${isRecording
                        ? 'bg-rose-50 border-rose-300 text-rose-600 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600'
                        }`}
                    >
                      {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
                      {isRecording ? 'Stop Voice Input' : 'Speak Answer'}
                    </button>
                  </div>

                  <textarea
                    rows={4}
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Type your answer here or click 'Speak Answer' to use speech-to-text..."
                    className="w-full p-4 rounded-2xl border border-slate-200 text-sm text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400 resize-none"
                  />
                  <div className="flex justify-between items-center text-xs text-slate-400 mt-1 px-1">
                    <span>{currentAnswer.trim().split(/\s+/).filter(Boolean).length} words</span>
                    <span>Tip: Be concise and structure your thoughts clearly</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentAnswer('');
                      if (isRecording && recognitionRef.current) recognitionRef.current.stop();
                    }}
                    className="text-xs font-semibold text-slate-400 hover:text-slate-600"
                  >
                    Clear answer
                  </button>

                  <PrimaryButton
                    onClick={handleSubmitAnswer}
                    disabled={evaluating || !currentAnswer.trim()}
                    className="px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-md"
                  >
                    {evaluating ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        AI Evaluating...
                      </>
                    ) : (
                      <>
                        Submit &amp; Evaluate <Send size={15} />
                      </>
                    )}
                  </PrimaryButton>
                </div>
              </motion.div>
            )}

            {/* STEP 3: QUESTION EVALUATION FEEDBACK */}
            {step === 'question_feedback' && currentEvaluation && (
              <motion.div
                key="feedback"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-5"
              >
                {/* Score Banner */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/50 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 block mb-1">
                      QUESTION {currentIndex + 1} RESULT
                    </span>
                    <h3 className="text-xl font-black text-slate-900">
                      Score: {currentEvaluation.score}/100 —{' '}
                      <span className={currentEvaluation.score >= 80 ? 'text-emerald-600' : currentEvaluation.score >= 60 ? 'text-indigo-600' : 'text-amber-600'}>
                        {currentEvaluation.verdict || 'Evaluated'}
                      </span>
                    </h3>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-center px-3 py-1.5 rounded-xl bg-white border border-slate-100 shadow-sm">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Clarity</span>
                      <span className="text-base font-extrabold text-slate-800">{currentEvaluation.clarity_score || currentEvaluation.score}%</span>
                    </div>
                    <div className="text-center px-3 py-1.5 rounded-xl bg-white border border-slate-100 shadow-sm">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Tech Depth</span>
                      <span className="text-base font-extrabold text-slate-800">{currentEvaluation.technical_depth_score || currentEvaluation.score}%</span>
                    </div>
                  </div>
                </div>

                {/* Strengths & Improvements */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
                    <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CheckCircle2 size={15} className="text-emerald-600" /> Key Strengths
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {(currentEvaluation.strengths || ['Good attempt covering the basics.']).map((s, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100">
                    <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <AlertCircle size={15} className="text-amber-600" /> Areas to Improve
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {(currentEvaluation.improvements || ['Add real-world project context.']).map((im, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{im}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Sample Ideal Answer Dropdown */}
                {currentEvaluation.sample_ideal_answer && (
                  <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50/50">
                    <button
                      type="button"
                      onClick={() => setExpandedIdeal(!expandedIdeal)}
                      className="w-full flex items-center justify-between p-3.5 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors"
                    >
                      <span className="flex items-center gap-1.5 text-indigo-700">
                        <ThumbsUp size={14} /> Model Answer from Staff Engineer
                      </span>
                      {expandedIdeal ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {expandedIdeal && (
                      <div className="p-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-200 bg-white">
                        {currentEvaluation.sample_ideal_answer}
                      </div>
                    )}
                  </div>
                )}

                {/* Footer action */}
                <div className="pt-2 flex justify-end">
                  <PrimaryButton onClick={handleNextQuestion} className="px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-md">
                    {currentIndex + 1 < questions.length ? (
                      <>
                        Next Question <ArrowRight size={16} />
                      </>
                    ) : (
                      <>
                        View Final Scorecard <Award size={16} />
                      </>
                    )}
                  </PrimaryButton>
                </div>
              </motion.div>
            )}

            {/* STEP 4: FINAL SCORECARD */}
            {step === 'scorecard' && (
              <motion.div
                key="scorecard"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 text-center"
              >
                {/* Trophy Header */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-3 shadow-xl" style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.secondary})`, color: 'white' }}>
                    <Award size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">Mock Interview Complete!</h3>
                  <p className="text-sm text-slate-500 mt-1">Role: <span className="font-bold text-slate-800">{role}</span></p>
                </div>

                {/* Overall Score Dial */}
                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 max-w-md mx-auto grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-2xl bg-white shadow-sm border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Overall</span>
                    <span className="text-2xl sm:text-3xl font-black text-indigo-600">{overallScore}%</span>
                  </div>
                  <div className="text-center p-3 rounded-2xl bg-white shadow-sm border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Clarity</span>
                    <span className="text-2xl sm:text-3xl font-black text-slate-800">{avgClarity}%</span>
                  </div>
                  <div className="text-center p-3 rounded-2xl bg-white shadow-sm border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Depth</span>
                    <span className="text-2xl sm:text-3xl font-black text-slate-800">{avgDepth}%</span>
                  </div>
                </div>

                {/* Question Breakdown List */}
                <div className="text-left space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Question Breakdown</h4>
                  {evaluations.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-slate-100 bg-white shadow-xs flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold uppercase text-indigo-600 block">Q{idx + 1} · {item.category || 'Technical'}</span>
                        <p className="text-xs font-medium text-slate-800 truncate">{item.question}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${item.evaluation?.score >= 80 ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'
                        }`}>
                        {item.evaluation?.score || 0}%
                      </span>
                    </div>
                  ))}
                </div>

                {/* Reset / Done Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('setup');
                      setEvaluations([]);
                      setQuestions([]);
                    }}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <RotateCcw size={15} /> Practice Another Role
                  </button>

                  <PrimaryButton onClick={onClose} className="px-6 py-2.5 rounded-xl text-xs sm:text-sm">
                    Done &amp; Close Coach
                  </PrimaryButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
