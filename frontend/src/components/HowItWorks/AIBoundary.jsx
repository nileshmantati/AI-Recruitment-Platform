import { Section, Mv, fadeUp, GlassCard } from './Shared';
import { T } from '../../Js/theme';
import { ShieldCheck, Sparkles, Target, ClipboardList, FileText, ArrowRight, User } from 'lucide-react';

const AI_CAPABILITIES = [
  { icon: Sparkles, label: 'Analyze', desc: 'Extract and structure resume content' },
  { icon: Target, label: 'Match', desc: 'Compare candidates to job requirements' },
  { icon: ClipboardList, label: 'Evaluate', desc: 'Generate fit scores and insights' },
  { icon: FileText, label: 'Summarize', desc: 'Surface strengths and gaps' },
];

export default function AIBoundary() {
  return (
    <Section className="py-14 sm:py-20" style={{ background: T.bg }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Mv variants={fadeUp} className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">
            AI Supports the Process. Recruiters Make the Decision.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            The platform uses AI to analyze resumes, match candidates, and surface structured insights.
            All recruitment decisions — shortlisting, rejection, interview scheduling — are made by the recruiter.
          </p>
        </Mv>

        {/* Diagram */}
        <Mv variants={fadeUp}>
          <div className="max-w-4xl mx-auto">
            {/* Desktop: horizontal flow */}
            <div className="hidden md:grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-4 items-center">
              {/* AI box */}
              <GlassCard className="p-5 border-indigo-200/60">
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${T.primary}15`, color: T.primary }}
                  >
                    <Sparkles size={16} />
                  </div>
                  <span className="text-sm font-bold text-slate-800">AI Processing</span>
                </div>
                <div className="space-y-2">
                  {AI_CAPABILITIES.map((cap) => {
                    const Icon = cap.icon;
                    return (
                      <div key={cap.label} className="flex items-center gap-2.5 py-1.5 px-2.5 rounded-lg bg-indigo-50/50 border border-indigo-100">
                        <Icon size={13} className="text-indigo-500 shrink-0" />
                        <div>
                          <span className="text-[11px] font-bold text-slate-700">{cap.label}</span>
                          <span className="text-[10px] text-slate-500 ml-1">{cap.desc}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>

              {/* Arrow */}
              <div className="flex items-center">
                <ArrowRight size={24} className="text-indigo-300" />
              </div>

              {/* Recruiter Review */}
              <GlassCard className="p-5 border-emerald-200/60 flex flex-col items-center text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-sm"
                  style={{ background: `${T.success}15`, color: T.success }}
                >
                  <User size={26} />
                </div>
                <span className="text-sm font-bold text-slate-800">Recruiter Review</span>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Reviews AI-generated insights, assesses candidates in context,
                  and applies professional judgment.
                </p>
              </GlassCard>

              {/* Arrow */}
              <div className="flex items-center">
                <ArrowRight size={24} className="text-emerald-300" />
              </div>

              {/* Decision */}
              <GlassCard className="p-5 border-purple-200/60 flex flex-col items-center text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-sm"
                  style={{ background: `${T.accent}15`, color: T.accent }}
                >
                  <ShieldCheck size={26} />
                </div>
                <span className="text-sm font-bold text-slate-800">Recruitment Decision</span>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Shortlist, schedule interviews, or pass — every outcome
                  is determined by the recruiter.
                </p>
              </GlassCard>
            </div>

            {/* Mobile: vertical flow */}
            <div className="md:hidden space-y-4">
              <GlassCard className="p-5 border-indigo-200/60">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={16} className="text-indigo-500" />
                  <span className="text-sm font-bold text-slate-800">AI Processing</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {AI_CAPABILITIES.map((cap) => {
                    const Icon = cap.icon;
                    return (
                      <div key={cap.label} className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-indigo-50/50 border border-indigo-100">
                        <Icon size={12} className="text-indigo-500 shrink-0" />
                        <span className="text-[11px] font-bold text-slate-700">{cap.label}</span>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>

              <div className="flex justify-center">
                <ArrowRight size={18} className="text-indigo-300 rotate-90" />
              </div>

              <GlassCard className="p-5 border-emerald-200/60 text-center">
                <User size={24} className="text-emerald-500 mx-auto mb-2" />
                <span className="text-sm font-bold text-slate-800">Recruiter Review</span>
                <p className="text-xs text-slate-500 mt-1">Reviews insights & applies judgment</p>
              </GlassCard>

              <div className="flex justify-center">
                <ArrowRight size={18} className="text-emerald-300 rotate-90" />
              </div>

              <GlassCard className="p-5 border-purple-200/60 text-center">
                <ShieldCheck size={24} className="text-purple-500 mx-auto mb-2" />
                <span className="text-sm font-bold text-slate-800">Recruitment Decision</span>
                <p className="text-xs text-slate-500 mt-1">Every outcome is determined by the recruiter</p>
              </GlassCard>
            </div>
          </div>
        </Mv>
      </div>
    </Section>
  );
}
