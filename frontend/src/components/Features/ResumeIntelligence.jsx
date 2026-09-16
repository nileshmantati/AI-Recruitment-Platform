import { useRef } from 'react';
import { useInView } from 'framer-motion';
import { Mv, Section } from './Shared';
import { fadeUp } from './SharedData';
import Badge from '../../ui/Badge';
import { Sparkles, FileText, Check } from 'lucide-react';
import { ScoreRing, SkillPill } from '../../ui/ResumeAnalyzerExternal';
import { T } from '../../Js/theme';

function ResumeAnalysisMock() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: `${T.primary}15`, color: T.primary }}>
          <FileText size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Resume Analysis</h3>
          <p className="text-sm font-medium text-slate-500">John Doe · Python Developer</p>
        </div>
      </div>

      {/* Score */}
      <div className="flex items-center gap-6 mb-6">
        <ScoreRing score={inView ? 92 : 0} size={72} />
        <div>
          <span className="text-sm font-semibold text-slate-700">AI Match Score</span>
          <p className="text-xs text-slate-500 mt-0.5">Based on job requirements</p>
        </div>
      </div>

      {/* Skills */}
      <div className="mb-6">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Extracted Skills</h4>
        <div className="flex flex-wrap gap-2">
          {['Python', 'Django', 'REST API', 'React', 'MySQL'].map(s => (
            <SkillPill key={s} name={s} owned />
          ))}
        </div>
      </div>

      {/* Experience */}
      <div className="flex justify-between items-center py-3 border-t border-slate-100">
        <span className="text-sm text-slate-500">Experience</span>
        <span className="text-sm font-bold text-slate-900">2.5 Years</span>
      </div>

      {/* Insight */}
      <div className="mt-3 rounded-xl p-3 border border-indigo-100" style={{ background: `${T.primary}08` }}>
        <p className="text-xs text-slate-700">
          <Sparkles size={12} className="inline mr-1" style={{ color: T.primary }} />
          Strong alignment with backend requirements. Limited frontend experience — consider evaluating React depth in interview.
        </p>
      </div>
    </div>
  );
}

export default function ResumeIntelligence() {
  return (
    <Section className="py-16 sm:py-24" id="resume-intelligence">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Mv variants={fadeUp} className="rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left: copy */}
            <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
              <Badge>
                <Sparkles size={14} className="mr-1" />AI RESUME INTELLIGENCE
              </Badge>
              <h2 className="mt-6 text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                Turn Resumes Into Recruitment Intelligence
              </h2>
              <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
                The system parses uploaded resumes, extracts structured data — skills, experience, education — and generates an AI match score and insight summary for each candidate.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  'Automatic resume parsing and data extraction',
                  'Skill identification and categorization',
                  'Experience and education analysis',
                  'AI-generated match score per job requirement',
                  'Insight summary with strengths and areas to explore',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-700 text-sm font-medium">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shrink-0 mt-0.5">
                      <Check size={12} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: mock panel */}
            <div className="bg-slate-50 p-8 sm:p-12 lg:p-16 flex items-center justify-center border-t lg:border-t-0 lg:border-l border-slate-200">
              <ResumeAnalysisMock />
            </div>
          </div>
        </Mv>
      </div>
    </Section>
  );
}
