/* eslint-disable react-refresh/only-export-components */
import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import {
  BriefcaseBusiness, FileText, Sparkles, Target,
  ClipboardList, Users, CalendarCheck, ChartNoAxesCombined
} from 'lucide-react';

/* ── Animation variants (reuses project pattern) ── */
export const fadeUp = {
  hidden: { opacity: 0, y: 25 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export const staggerSlow = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: 'easeOut' } },
};

/* ── Workflow steps (process-based, not capability-based) ── */
export const HIW_STEPS = [
  { n: 1, label: 'Job', icon: BriefcaseBusiness, desc: 'Create job requirements' },
  { n: 2, label: 'Apply', icon: FileText, desc: 'Candidate submits application' },
  { n: 3, label: 'AI Analysis', icon: Sparkles, desc: 'Resume analysis and scoring' },
  { n: 4, label: 'Match', icon: Target, desc: 'Match candidates to the role' },
  { n: 5, label: 'Evaluate', icon: ClipboardList, desc: 'Review AI-generated insights' },
  { n: 6, label: 'Pipeline', icon: Users, desc: 'Manage application statuses' },
  { n: 7, label: 'Interview', icon: CalendarCheck, desc: 'Schedule and conduct interviews' },
  { n: 8, label: 'Insights', icon: ChartNoAxesCombined, desc: 'Review recruitment analytics' },
];

/* ── Real application statuses (from backend model) ── */
export const REAL_STATUSES = [
  { key: 'PENDING', label: 'Pending', color: '#64748B', bg: 'bg-slate-100', text: 'text-slate-700' },
  { key: 'EVALUATED', label: 'Evaluated', color: '#0EA5E9', bg: 'bg-cyan-50', text: 'text-cyan-700' },
  { key: 'SHORTLISTED', label: 'Shortlisted', color: '#10B981', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  { key: 'INTERVIEW_SCHEDULED', label: 'Interview Scheduled', color: '#6366F1', bg: 'bg-indigo-50', text: 'text-indigo-700' },
  { key: 'REJECTED', label: 'Rejected', color: '#EF4444', bg: 'bg-rose-50', text: 'text-rose-700' },
];

/* ── Reusable section wrapper with InView animation ── */
export const Section = ({ children, className = '', id, ...rest }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const reduced = useReducedMotion();
  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      variants={reduced ? { hidden: { opacity: 1 }, show: { opacity: 1 } } : stagger}
      className={className}
      {...rest}
    >
      {children}
    </motion.section>
  );
};

export const Mv = motion.div;

/* ── Step indicator pill (highlights active step in the spine) ── */
export const StepPill = ({ step, active = false, compact = false }) => {
  const Icon = step.icon;
  return (
    <div className={`flex items-center gap-1.5 sm:gap-2 shrink-0 ${active ? 'opacity-100' : 'opacity-60'}`}>
      <div
        className={`flex items-center justify-center rounded-full text-white shrink-0 shadow-sm transition-all duration-300 ${compact ? 'w-6 h-6 text-[10px]' : 'w-7 h-7 sm:w-8 sm:h-8 text-xs'
          } ${active ? 'ring-2 ring-indigo-300 ring-offset-1' : ''}`}
        style={{ background: active ? 'linear-gradient(135deg, #4F46E5, #8B5CF6)' : '#94a3b8' }}
      >
        {step.n}
      </div>
      {!compact && <Icon size={14} className={active ? 'text-indigo-600' : 'text-slate-400'} />}
      <span className={`text-[10px] sm:text-xs font-semibold whitespace-nowrap ${active ? 'text-indigo-700' : 'text-slate-500'}`}>
        {step.label}
      </span>
    </div>
  );
};

/* ── Connecting line between step pills ── */
export const StepLine = ({ active = false }) => (
  <div className={`w-4 sm:w-8 h-px shrink-0 transition-colors duration-500 ${active ? 'bg-indigo-400' : 'bg-slate-300'}`} />
);

/* ── Illustrative data label ── */
export const IllustrativeLabel = () => (
  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-2">
    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
    Illustrative data
  </span>
);

/* ── Section step badge (e.g. "Step 01") ── */
export const StepBadge = ({ number }) => (
  <span
    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
    style={{ color: '#4F46E5', background: '#4F46E51A' }}
  >
    Step {String(number).padStart(2, '0')}
  </span>
);

/* ── Glass card wrapper ── */
export const GlassCard = ({ children, className = '', ...props }) => (
  <div
    className={`rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-md shadow-sm ${className}`}
    {...props}
  >
    {children}
  </div>
);
