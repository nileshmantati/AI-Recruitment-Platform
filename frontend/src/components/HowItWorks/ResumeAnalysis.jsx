import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Section, Mv, fadeUp, StepBadge, GlassCard, IllustrativeLabel } from './Shared';
import { T } from '../../Js/theme';
import {
  Sparkles, User, Briefcase, CheckCircle, AlertCircle,
  Lightbulb, Brain, ScanSearch, FileText
} from 'lucide-react';

/* ── Illustrative resume data (mirrors real AI output) ── */
const MOCK_RESUME = {
  name: 'Priya Sharma',
  role: 'Senior Frontend Engineer',
  score: 92,
  skills: ['React', 'TypeScript', 'Tailwind CSS', 'REST APIs', 'Git'],
  missingSkills: ['GraphQL', 'Testing Library'],
  strengths: ['Strong React component architecture with 4+ years of production experience'],
  experience: 85,
  insight: 'Candidate demonstrates consistent frontend specialization with measurable project outcomes.',
};

/* ── Animated counter ── */
const AnimatedScore = ({ target }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const reduced = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      const id = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(id);
    }
    let rafId;
    const duration = 1800;
    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [inView, target, reduced]);

  return <span ref={ref}>{value}</span>;
};

/* ── Scanning shimmer overlay ── */
const ScanEffect = () => {
  const reduced = useReducedMotion();
  if (reduced) return null;
  return (
    <motion.div
      className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-2xl"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 2, duration: 0.5 }}
    >
      <motion.div
        className="absolute left-0 right-0 h-1 rounded-full"
        style={{ background: `linear-gradient(90deg, transparent, ${T.primary}60, transparent)` }}
        initial={{ top: '0%' }}
        animate={{ top: '100%' }}
        transition={{ duration: 2, ease: 'easeInOut' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent" />
    </motion.div>
  );
};

export default function ResumeAnalysis() {
  return (
    <Section className="py-16 sm:py-24 bg-white relative overflow-hidden">
      {/* Subtle background gradient */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background: `radial-gradient(800px 500px at 20% 30%, ${T.primary}08, transparent), radial-gradient(600px 400px at 80% 70%, ${T.accent}08, transparent)`,
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <Mv variants={fadeUp} className="text-center mb-12 sm:mb-16">
          <StepBadge number={3} />
          <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">
            Turn a Resume Into Structured Candidate Information.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            When a candidate submits a resume, the platform extracts the text, identifies skills and experience,
            generates a match score against the job requirements, and surfaces strengths and gaps for recruiter review.
          </p>
        </Mv>

        {/* Main analysis mockup */}
        <Mv variants={fadeUp}>
          <div className="max-w-4xl mx-auto">
            <GlassCard className="p-0 relative overflow-hidden">
              <ScanEffect />

              {/* Top gradient bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />

              <div className="p-6 sm:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-8 pb-6 border-b border-slate-200/60">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${T.primary}20, ${T.accent}20)`, color: T.primary }}
                    >
                      <ScanSearch size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">AI Resume Analysis</h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center gap-1">
                          <Brain size={10} /> AI Processed
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <FileText size={11} /> Resume_Priya_Sharma.pdf
                      </p>
                    </div>
                  </div>
                  <IllustrativeLabel />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                  {/* Left column — candidate info & score */}
                  <div className="md:col-span-1 space-y-5">
                    {/* Candidate */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                        <User size={14} className="text-indigo-500" />
                        {MOCK_RESUME.name}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Briefcase size={12} className="text-slate-400" />
                        {MOCK_RESUME.role}
                      </div>
                    </div>

                    {/* Score ring */}
                    <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-5 text-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
                      <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-2">Match Score</p>
                      <div className="text-5xl font-black text-white tracking-tight">
                        <AnimatedScore target={MOCK_RESUME.score} />
                        <span className="text-lg text-indigo-300 font-semibold">%</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1.5">Based on job requirements</p>
                    </div>

                    {/* Experience bar */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-slate-700">Experience Relevancy</span>
                        <span className="font-bold text-indigo-600">{MOCK_RESUME.experience}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg, ${T.primary}, ${T.accent})` }}
                          initial={{ width: '0%' }}
                          whileInView={{ width: `${MOCK_RESUME.experience}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Middle column — skills */}
                  <div className="md:col-span-1 space-y-5">
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                        <Sparkles size={12} className="text-indigo-500" />
                        Identified Skills
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {MOCK_RESUME.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                        Missing Skills
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {MOCK_RESUME.missingSkills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <CheckCircle size={12} className="text-emerald-500" />
                        Strengths
                      </h4>
                      {MOCK_RESUME.strengths.map((s, i) => (
                        <p key={i} className="text-xs text-slate-700 leading-relaxed">
                          ✓ {s}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Right column — AI insight */}
                  <div className="md:col-span-1">
                    <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 p-4 h-full flex flex-col">
                      <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Lightbulb size={12} />
                        AI Insight
                      </h4>
                      <p className="text-sm text-slate-700 leading-relaxed flex-1">
                        {MOCK_RESUME.insight}
                      </p>
                      <div className="mt-4 pt-3 border-t border-indigo-200/50">
                        <div className="flex items-start gap-2">
                          <AlertCircle size={13} className="text-slate-400 mt-0.5 shrink-0" />
                          <p className="text-[11px] text-slate-500 leading-snug">
                            AI-generated insight for recruiter review. Not an automated decision.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </Mv>

        {/* Processing flow underneath */}
        <Mv variants={fadeUp} className="mt-10 sm:mt-14">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-center">
            {[
              { icon: FileText, label: 'Upload' },
              { icon: ScanSearch, label: 'Extract Text' },
              { icon: Sparkles, label: 'Analyze Skills' },
              { icon: Brain, label: 'Generate Score' },
              { icon: Lightbulb, label: 'Surface Insights' },
            ].map((step, i, arr) => {
              const Icon = step.icon;
              return (
                <div key={step.label} className="flex items-center gap-3 sm:gap-4">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${T.primary}12`, color: T.primary }}
                    >
                      <Icon size={18} />
                    </div>
                    <span className="text-[10px] sm:text-xs font-semibold text-slate-600">{step.label}</span>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="w-6 sm:w-10 h-px bg-indigo-200 -mt-4" />
                  )}
                </div>
              );
            })}
          </div>
        </Mv>
      </div>
    </Section>
  );
}
