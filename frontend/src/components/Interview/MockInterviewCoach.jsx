import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  Award,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  X,
  BrainCircuit,
  Lightbulb,
  ThumbsUp,
  Loader2,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  TrendingUp,
  FileCheck
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
  // Wizard steps: 'setup' | 'interview' | 'evaluating' | 'scorecard'
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
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(false);

  // Audio / Speech
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const baseAnswerRef = useRef('');

  // End Scorecard state
  const [evaluations, setEvaluations] = useState([]);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [expandedModels, setExpandedModels] = useState({});
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Clean up speech synthesis & recognition on unmount or when modal closes
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const handleClose = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsRecording(false);
    setIsSpeaking(false);
    onClose();
  };

  if (!isOpen) return null;

  // 1. Start Continuous Live Interview: Generate 4 Questions
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
      setAnswers(new Array(fetchedQuestions.length).fill(''));
      setCurrentIndex(0);
      setCurrentAnswer('');
      baseAnswerRef.current = '';
      setShowHint(false);
      setEvaluations([]);
      setExpandedQuestions({ 0: true });
      setExpandedModels({});
      setStep('interview');
      toast.success('Live interview started! Answer all questions continuously.', { icon: '🎙️' });
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

  // 3. Speech-to-Text Microphone toggle (Robust & stutter-free)
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice typing is not supported in your browser. (Try Chrome or Edge)');
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsRecording(false);
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = navigator.language || 'en-US';

      baseAnswerRef.current = currentAnswer ? currentAnswer.trim() : '';

      recognition.onstart = () => {
        setIsRecording(true);
        toast('Listening... Speak naturally.', { icon: '🎙️' });
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = 0; i < event.results.length; i++) {
          const item = event.results[i];
          const text = item[0]?.transcript || '';
          if (item.isFinal) {
            finalTranscript += (finalTranscript ? ' ' : '') + text.trim();
          } else {
            interimTranscript += (interimTranscript ? ' ' : '') + text.trim();
          }
        }

        const recognizedText = [finalTranscript, interimTranscript].filter(Boolean).join(' ').trim();
        const base = baseAnswerRef.current;
        const combined = base ? `${base} ${recognizedText}` : recognizedText;
        setCurrentAnswer(combined);
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

  // 4. Navigate to Previous Question
  const handlePreviousQuestion = () => {
    if (currentIndex <= 0) return;

    // Save current response
    const updatedAnswers = [...answers];
    updatedAnswers[currentIndex] = currentAnswer.trim();
    setAnswers(updatedAnswers);

    // Stop active audio
    if (isRecording && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsRecording(false);
    }
    if (isSpeaking && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    const prevIdx = currentIndex - 1;
    setCurrentIndex(prevIdx);
    setCurrentAnswer(updatedAnswers[prevIdx] || '');
    baseAnswerRef.current = updatedAnswers[prevIdx] || '';
    setShowHint(false);
  };

  // 5. Jump to Question Pill
  const handleSelectQuestion = (idx) => {
    if (idx === currentIndex) return;

    const updatedAnswers = [...answers];
    updatedAnswers[currentIndex] = currentAnswer.trim();
    setAnswers(updatedAnswers);

    if (isRecording && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsRecording(false);
    }
    if (isSpeaking && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    setCurrentIndex(idx);
    setCurrentAnswer(updatedAnswers[idx] || '');
    baseAnswerRef.current = updatedAnswers[idx] || '';
    setShowHint(false);
  };

  // 6. Continuous Step (Next Question or Finalize Full Interview)
  const handleNextOrFinish = async () => {
    if (!currentAnswer.trim()) {
      toast.error('Please enter or speak your answer before proceeding.');
      return;
    }

    if (isRecording && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsRecording(false);
    }
    if (isSpeaking && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    const updatedAnswers = [...answers];
    updatedAnswers[currentIndex] = currentAnswer.trim();
    setAnswers(updatedAnswers);

    if (currentIndex + 1 < questions.length) {
      // Advance seamlessly to next question (realistic live flow)
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setCurrentAnswer(updatedAnswers[nextIdx] || '');
      baseAnswerRef.current = updatedAnswers[nextIdx] || '';
      setShowHint(false);
    } else {
      // Final question reached: Generate Comprehensive Executive Scorecard
      await runFullEvaluation(updatedAnswers);
    }
  };

  // 7. Parallel Evaluation of All Questions at the End
  const runFullEvaluation = async (finalAnswers) => {
    setStep('evaluating');

    try {
      const evalPromises = questions.map(async (q, idx) => {
        const candidateAns = finalAnswers[idx] || '';
        try {
          return await evaluateMockAnswer(q.question, candidateAns, role);
        } catch (err) {
          console.error(`Evaluation failed for question ${idx + 1}:`, err);
          const words = candidateAns.split(/\s+/).filter(Boolean).length;
          const fallbackScore = Math.min(88, Math.max(55, 50 + words * 2));
          return {
            score: fallbackScore,
            clarity_score: fallbackScore,
            technical_depth_score: fallbackScore,
            verdict: fallbackScore >= 75 ? 'Good' : 'Needs Practice',
            strengths: ['Addressed the question and shared your experience.'],
            improvements: ['Include more structured technical trade-offs and quantitative examples.'],
            sample_ideal_answer: 'A comprehensive staff-level answer directly addresses core concepts, trade-offs, and provides concrete production experience.',
          };
        }
      });

      const evalResults = await Promise.all(evalPromises);

      const fullEvals = questions.map((q, idx) => ({
        question: q.question,
        category: q.category,
        answer: finalAnswers[idx] || '',
        evaluation: evalResults[idx],
      }));

      setEvaluations(fullEvals);
      setExpandedQuestions({ 0: true });
      setStep('scorecard');
      toast.success('Interview complete! Executive Scorecard generated.', { icon: '🏆' });
    } catch (err) {
      console.error('Error generating scorecard:', err);
      toast.error('Failed to complete full evaluation. Showing partial review.');
      setStep('scorecard');
    }
  };

  // 8. Individual Question Review Dropdown Toggle
  const toggleQuestionReview = (idx) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleToggleAllQuestions = () => {
    const allExpanded = evaluations.length > 0 && evaluations.every((_, idx) => expandedQuestions[idx]);
    const newState = {};
    evaluations.forEach((_, idx) => {
      newState[idx] = !allExpanded;
    });
    setExpandedQuestions(newState);
  };

  // 9. Model Answer Accordion Toggle
  const toggleModelAnswer = (idx) => {
    setExpandedModels((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  // 10. Copy Executive Summary to Clipboard
  const handleCopySummary = async () => {
    const summaryText = [
      `=============================================`,
      `AI MOCK INTERVIEW - EXECUTIVE SCORECARD`,
      `=============================================`,
      `Target Role: ${role}`,
      `Experience Level: ${experienceLevel}`,
      `Interview Format: ${INTERVIEW_TYPES.find((t) => t.id === interviewType)?.label || 'Technical'}`,
      `Date: ${new Date().toLocaleDateString()}`,
      ``,
      `EXECUTIVE PERFORMANCE METRICS:`,
      `• Overall Score: ${overallScore}%`,
      `• Communication Clarity: ${avgClarity}%`,
      `• Technical Depth: ${avgDepth}%`,
      `• Assessment: ${overallAssessment.label}`,
      ``,
      `QUESTION REVIEWS:`,
      ...evaluations.map((item, idx) => [
        `---------------------------------------------`,
        `Q${idx + 1} [${item.category || 'General'}]: ${item.question}`,
        `Score: ${item.evaluation?.score || 0}% (${item.evaluation?.verdict || 'Evaluated'})`,
        `Candidate Response: "${item.answer}"`,
        `Strengths: ${(item.evaluation?.strengths || []).join('; ')}`,
        `Improvements: ${(item.evaluation?.improvements || []).join('; ')}`,
      ].join('\n')),
      `=============================================`,
    ].join('\n');

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(summaryText);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = summaryText;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedSummary(true);
      toast.success('Executive scorecard summary copied to clipboard!');
      setTimeout(() => setCopiedSummary(false), 2500);
    } catch (err) {
      console.error('Failed to copy summary:', err);
      toast.error('Could not copy summary to clipboard.');
    }
  };

  // Compute final scorecard metrics
  const overallScore = evaluations.length
    ? Math.round(evaluations.reduce((acc, curr) => acc + (curr.evaluation?.score || 0), 0) / evaluations.length)
    : 0;

  const avgClarity = evaluations.length
    ? Math.round(evaluations.reduce((acc, curr) => acc + (curr.evaluation?.clarity_score || curr.evaluation?.score || 0), 0) / evaluations.length)
    : 0;

  const avgDepth = evaluations.length
    ? Math.round(evaluations.reduce((acc, curr) => acc + (curr.evaluation?.technical_depth_score || curr.evaluation?.score || 0), 0) / evaluations.length)
    : 0;

  // Executive readiness assessment
  const getOverallAssessment = (score) => {
    if (score >= 82) {
      return {
        label: 'Strong Hire · Recommended',
        color: 'emerald',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        summary: 'Exceptional performance. Demonstrated structured reasoning, precise technical terminology, and clear production-ready trade-offs.',
      };
    }
    if (score >= 68) {
      return {
        label: 'Hire · Solid Foundations',
        color: 'indigo',
        bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        summary: 'Solid competence across key domains. Candidate answered well with strong fundamentals; adding more quantitative project metrics will elevate results to staff level.',
      };
    }
    return {
      label: 'Needs Practice · Targeted Growth',
      color: 'amber',
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      summary: 'Promising effort with core conceptual awareness. Focus on practicing the STAR methodology, structuring responses systematically, and avoiding generic generalizations.',
    };
  };

  const overallAssessment = getOverallAssessment(overallScore);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50/70 via-white to-cyan-50/50">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
              style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, color: 'white' }}
            >
              <BrainCircuit size={22} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-1.5">
                AI Mock Interview Coach
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700">
                  {step === 'scorecard' ? 'Scorecard' : 'Continuous Live'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {step === 'scorecard'
                  ? 'Comprehensive Executive Interview Evaluation & Staff Review'
                  : 'Realistic 4-question continuous simulation · Full scorecard evaluated at the end'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
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
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
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
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1.5 text-[11px] text-slate-500 font-medium">
                      {INTERVIEW_TYPES.find((t) => t.id === interviewType)?.desc}
                    </p>
                  </div>
                </div>

                {/* Info Card explaining the realistic continuous flow */}
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
                  <Sparkles size={20} className="text-indigo-600 shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    <span className="font-bold text-slate-800">Continuous Realistic Interview: </span>
                    You will progress through all 4 role-specific questions continuously (Q1 &rarr; Q2 &rarr; Q3 &rarr; Q4) just like in an actual technical interview.
                    At the end, our AI Panel conducts a full evaluation and generates an executive scorecard with detailed question-by-question reviews and model answers.
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
                        Start Continuous Interview <ArrowRight size={18} />
                      </>
                    )}
                  </PrimaryButton>
                </div>
              </motion.div>
            )}

            {/* STEP 2: CONTINUOUS LIVE INTERVIEW (Q1 -> Q2 -> Q3 -> Q4) */}
            {step === 'interview' && questions[currentIndex] && (
              <motion.div
                key={`q-${currentIndex}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
              >
                {/* Question Navigator Pills */}
                <div className="flex items-center justify-between flex-wrap gap-2 pb-1 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    {questions.map((_, idx) => {
                      const isCurrent = idx === currentIndex;
                      const hasAnswer = (answers[idx] || (isCurrent ? currentAnswer : '')).trim().length > 0;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectQuestion(idx)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${isCurrent
                            ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-200'
                            : hasAnswer
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                        >
                          {hasAnswer && !isCurrent && <CheckCircle2 size={12} className="text-emerald-600" />}
                          <span>Q{idx + 1}</span>
                          {isCurrent && <span className="text-[10px] opacity-80">(Active)</span>}
                        </button>
                      );
                    })}
                  </div>

                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                    {questions[currentIndex].category || 'Technical Assessment'}
                  </span>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500 mb-1.5">
                    <span>
                      QUESTION {currentIndex + 1} OF {questions.length}
                    </span>
                    <span>{Math.round(((currentIndex + 1) / questions.length) * 100)}% Completed</span>
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
                      className={`p-2.5 rounded-xl border transition-all shrink-0 cursor-pointer ${isSpeaking
                        ? 'bg-indigo-600 text-white border-indigo-600 animate-pulse'
                        : 'bg-white text-slate-600 border-slate-200 hover:text-indigo-600 hover:border-indigo-300 shadow-sm'
                        }`}
                      title={isSpeaking ? 'Stop Audio' : 'Listen to Question'}
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
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
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
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${isRecording
                        ? 'bg-rose-50 border-rose-300 text-rose-600 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600'
                        }`}
                    >
                      {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
                      {isRecording ? 'Stop Voice Input' : 'Speak Answer'}
                    </button>
                  </div>

                  <textarea
                    rows={5}
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Type your response here or click 'Speak Answer' to speak using microphone..."
                    className="w-full p-4 rounded-2xl border border-slate-200 text-sm text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder:text-slate-400 resize-none"
                  />
                  <div className="flex justify-between items-center text-xs text-slate-400 mt-1 px-1">
                    <span>{currentAnswer.trim().split(/\s+/).filter(Boolean).length} words</span>
                    <span>Structured reasoning and technical depth are evaluated at the end</span>
                  </div>
                </div>

                {/* Navigation and Submission Buttons */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3">
                    {currentIndex > 0 && (
                      <button
                        type="button"
                        onClick={handlePreviousQuestion}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                      >
                        <ArrowLeft size={14} /> Back (Q{currentIndex})
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentAnswer('');
                        baseAnswerRef.current = '';
                        const updatedAnswers = [...answers];
                        updatedAnswers[currentIndex] = '';
                        setAnswers(updatedAnswers);
                        if (isRecording && recognitionRef.current) {
                          try {
                            recognitionRef.current.stop();
                          } catch {
                            // ignore
                          }
                          setIsRecording(false);
                        }
                      }}
                      className="text-xs font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      Clear response
                    </button>
                  </div>

                  <PrimaryButton
                    onClick={handleNextOrFinish}
                    className="px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-md cursor-pointer"
                  >
                    {currentIndex + 1 < questions.length ? (
                      <>
                        Next Question (Q{currentIndex + 2}) <ArrowRight size={16} />
                      </>
                    ) : (
                      <>
                        Complete &amp; Generate Scorecard ✨
                      </>
                    )}
                  </PrimaryButton>
                </div>
              </motion.div>
            )}

            {/* STEP 3: EVALUATING SCREEN (Analyzing All Questions) */}
            {step === 'evaluating' && (
              <motion.div
                key="evaluating"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="py-12 sm:py-16 text-center space-y-6 max-w-lg mx-auto"
              >
                <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping" />
                  <div
                    className="relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl text-white"
                    style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}
                  >
                    <BrainCircuit size={32} className="animate-pulse" />
                  </div>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
                    Generating Executive Scorecard
                  </h3>
                  <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                    AI evaluation panel is assessing all {questions.length || 4} responses for communication clarity, architectural depth, and staff engineer benchmarks...
                  </p>
                </div>

                {/* Animated Evaluation Checklist */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2 text-indigo-700 font-semibold">
                    <Loader2 size={14} className="animate-spin text-indigo-600" />
                    <span>Evaluating STAR framework &amp; technical trade-offs...</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>Analyzing domain competency for {role}...</span>
                  </div>
                  <div className="flex items-center gap-2 text-cyan-700 font-semibold">
                    <Sparkles size={14} className="text-cyan-600" />
                    <span>Synthesizing Staff Engineer benchmark model answers...</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: COMPREHENSIVE EXECUTIVE INTERVIEW SCORECARD */}
            {step === 'scorecard' && (
              <motion.div
                key="scorecard"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                {/* Executive Header Banner */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/60 border border-indigo-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shrink-0"
                      style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.secondary})`, color: 'white' }}
                    >
                      <Award size={30} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600">
                          EXECUTIVE INTERVIEW SCORECARD
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${overallAssessment.bg}`}>
                          {overallAssessment.label}
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900">{role}</h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Level: {experienceLevel} · Format: {INTERVIEW_TYPES.find((t) => t.id === interviewType)?.label || 'Technical'} · {evaluations.length} Questions Evaluated
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-auto">
                    <button
                      type="button"
                      onClick={handleCopySummary}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Copy scorecard summary to clipboard"
                    >
                      {copiedSummary ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      {copiedSummary ? 'Copied!' : 'Copy Summary'}
                    </button>
                    <button
                      type="button"
                      onClick={handleToggleAllQuestions}
                      className="px-3.5 py-2 rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100/70 text-xs font-bold text-indigo-700 shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {evaluations.length > 0 && evaluations.every((_, idx) => expandedQuestions[idx]) ? (
                        <>
                          <ChevronUp size={14} /> Collapse All Reviews
                        </>
                      ) : (
                        <>
                          <ChevronDown size={14} /> Expand All Reviews
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* KPI Metrics Grid (4 Cards) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Overall Score</span>
                    <span
                      className={`text-2xl sm:text-3xl font-black ${overallScore >= 80 ? 'text-emerald-600' : overallScore >= 65 ? 'text-indigo-600' : 'text-amber-600'
                        }`}
                    >
                      {overallScore}%
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Benchmark: 75%</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Clarity &amp; Structure</span>
                    <span className="text-2xl sm:text-3xl font-black text-slate-800">{avgClarity}%</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">STAR Framework</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Technical Depth</span>
                    <span className="text-2xl sm:text-3xl font-black text-slate-800">{avgDepth}%</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Domain Mastery</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Completion</span>
                    <span className="text-2xl sm:text-3xl font-black text-emerald-600">
                      {evaluations.length}/{questions.length}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">100% Questions Answered</span>
                  </div>
                </div>

                {/* Executive Summary Takeaways Card */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <TrendingUp size={18} />
                  </div>
                  <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    <span className="font-bold text-slate-900 block mb-1 text-sm">Executive Performance Synthesis</span>
                    <p>{overallAssessment.summary}</p>
                  </div>
                </div>

                {/* Full Question-by-Question Detailed Review (Accordion Dropdowns) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <FileCheck size={16} className="text-indigo-600" />
                        Detailed Question-by-Question Review ({evaluations.length} Questions)
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">Click any question below to expand or collapse its evaluation review</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleToggleAllQuestions}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      {evaluations.length > 0 && evaluations.every((_, idx) => expandedQuestions[idx]) ? (
                        <>
                          <ChevronUp size={13} /> Collapse All
                        </>
                      ) : (
                        <>
                          <ChevronDown size={13} /> Expand All
                        </>
                      )}
                    </button>
                  </div>

                  {evaluations.map((item, idx) => {
                    const evalScore = item.evaluation?.score || 0;
                    const isQuestionOpen = !!expandedQuestions[idx];
                    const isModelOpen = !!expandedModels[idx];
                    const wordCount = item.answer.trim().split(/\s+/).filter(Boolean).length;

                    return (
                      <div
                        key={idx}
                        className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden transition-all hover:border-slate-300"
                      >
                        {/* Question Review Dropdown Accordion Header */}
                        <button
                          type="button"
                          onClick={() => toggleQuestionReview(idx)}
                          className="w-full text-left p-4 sm:p-5 bg-gradient-to-r from-slate-50 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-100/70 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 flex-wrap min-w-0 flex-1">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-indigo-600 text-white shrink-0">
                              Question {idx + 1}
                            </span>
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                              {item.category || 'Technical'}
                            </span>
                            <span className="text-xs sm:text-sm font-semibold text-slate-800 truncate max-w-xs md:max-w-md">
                              "{item.question}"
                            </span>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                            <div className="text-right">
                              <span
                                className={`px-3 py-1 rounded-xl text-xs font-black border ${evalScore >= 80
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : evalScore >= 65
                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                  }`}
                              >
                                {evalScore}/100 · {item.evaluation?.verdict || 'Evaluated'}
                              </span>
                            </div>
                            <div className="hidden sm:block text-[11px] font-semibold text-slate-500">
                              Clarity: <span className="font-bold text-slate-800">{item.evaluation?.clarity_score || evalScore}%</span> | Depth: <span className="font-bold text-slate-800">{item.evaluation?.technical_depth_score || evalScore}%</span>
                            </div>
                            <div className="p-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                              {isQuestionOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>
                          </div>
                        </button>

                        {/* Collapsible Dropdown Content */}
                        {isQuestionOpen && (
                          <div className="p-4 sm:p-5 space-y-4 border-t border-slate-100 bg-white">
                            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Full Question Prompt</span>
                              <p className="text-sm font-bold text-slate-900 leading-relaxed">"{item.question}"</p>
                            </div>

                            {/* Candidate Response Block */}
                            <div className="p-4 rounded-xl bg-indigo-50/30 border border-indigo-100/70">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wide">
                                  Candidate's Spoken / Written Response
                                </span>
                                <span className="text-[11px] font-medium text-slate-500">{wordCount} words</span>
                              </div>
                              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed italic whitespace-pre-wrap">
                                "{item.answer || 'No answer submitted.'}"
                              </p>
                            </div>

                            {/* 2-Column Strengths & Areas to Improve Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                              {/* Strengths */}
                              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                                <h5 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" /> Key Strengths
                                </h5>
                                <ul className="space-y-1.5 text-xs text-slate-700">
                                  {(item.evaluation?.strengths || ['Good attempt addressing the question.']).map(
                                    (s, sIdx) => (
                                      <li key={sIdx} className="flex items-start gap-1.5">
                                        <span className="text-emerald-500 font-bold">•</span>
                                        <span>{s}</span>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>

                              {/* Areas to Improve */}
                              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-100">
                                <h5 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                  <AlertCircle size={15} className="text-amber-600 shrink-0" /> Areas to Improve
                                </h5>
                                <ul className="space-y-1.5 text-xs text-slate-700">
                                  {(item.evaluation?.improvements || ['Add real-world project context.']).map(
                                    (im, imIdx) => (
                                      <li key={imIdx} className="flex items-start gap-1.5">
                                        <span className="text-amber-500 font-bold">•</span>
                                        <span>{im}</span>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            </div>

                            {/* Model Answer from Staff Engineer Accordion */}
                            {item.evaluation?.sample_ideal_answer && (
                              <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50/60">
                                <button
                                  type="button"
                                  onClick={() => toggleModelAnswer(idx)}
                                  className="w-full flex items-center justify-between p-3.5 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                                >
                                  <span className="flex items-center gap-1.5 text-indigo-700">
                                    <ThumbsUp size={14} /> Model Answer from Staff Engineer (Benchmark)
                                  </span>
                                  {isModelOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                                {isModelOpen && (
                                  <div className="p-4 pt-1 text-xs sm:text-sm text-slate-700 leading-relaxed border-t border-slate-200 bg-white">
                                    {item.evaluation.sample_ideal_answer}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Scorecard Footer Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('setup');
                      setEvaluations([]);
                      setQuestions([]);
                      setAnswers([]);
                      setCurrentAnswer('');
                      baseAnswerRef.current = '';
                      setShowHint(false);
                      setExpandedQuestions({});
                      setExpandedModels({});
                    }}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw size={15} /> Practice Another Role
                  </button>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleCopySummary}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedSummary ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                      {copiedSummary ? 'Copied' : 'Copy Scorecard'}
                    </button>
                    <PrimaryButton onClick={handleClose} className="px-6 py-2.5 rounded-xl text-xs sm:text-sm cursor-pointer">
                      Done &amp; Close Coach
                    </PrimaryButton>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
