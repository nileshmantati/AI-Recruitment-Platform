import { Section, Mv, fadeUp, StepBadge, GlassCard, IllustrativeLabel } from './Shared';
import { T } from '../../Js/theme';
import { ClipboardList, CheckCircle, Circle, AlertCircle, Brain } from 'lucide-react';

const EVAL_DATA = {
  name: 'Priya Sharma',
  role: 'Senior Frontend Engineer',
  overall: 92,
  dimensions: [
    { label: 'Skills Match', value: 88 },
    { label: 'Experience Fit', value: 85 },
    { label: 'Role Alignment', value: 94 },
  ],
  strengths: [
    'Strong React and TypeScript proficiency with production experience',
    'Demonstrated ability to build component-based architectures',
    'Consistent career focus in frontend development',
  ],
  areas: [
    'Limited GraphQL exposure — assess willingness to learn',
    'No explicit testing framework experience listed',
  ],
};

const getBarColor = (v) => v >= 85 ? T.success : v >= 65 ? T.warning : T.danger;

export default function Evaluation() {
  return (
    <Section className="py-14 sm:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left — copy */}
          <Mv variants={fadeUp}>
            <StepBadge number={5} />
            <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">
              Understand Candidate Fit.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-lg">
              For each evaluated application, the platform generates a structured assessment — an overall
              match score broken down by skills, experience, and role alignment, along with specific
              strengths and areas the recruiter may want to explore further.
            </p>
            <div
              className="mt-6 flex items-start gap-3 rounded-xl px-4 py-3 border"
              style={{ background: `${T.primary}08`, borderColor: `${T.primary}20` }}
            >
              <AlertCircle size={16} className="text-indigo-500 mt-0.5 shrink-0" />
              <p className="text-sm text-slate-700 leading-relaxed">
                This is an AI-generated insight for recruiter review — it provides structured information
                to support evaluation, not an automated decision.
              </p>
            </div>
          </Mv>

          {/* Right — evaluation card mockup */}
          <Mv variants={fadeUp}>
            <GlassCard className="p-0 overflow-hidden">
              {/* Top bar */}
              <div className="px-5 py-4 border-b border-slate-200/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${T.primary}15`, color: T.primary }}
                  >
                    <ClipboardList size={16} />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-800">{EVAL_DATA.name}</span>
                    <p className="text-[11px] text-slate-500">{EVAL_DATA.role}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center gap-1">
                  <Brain size={10} /> AI Assessment
                </span>
              </div>

              <div className="p-5 sm:p-6 space-y-6">
                {/* Overall score */}
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white shrink-0"
                    style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}
                  >
                    {EVAL_DATA.overall}%
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Overall Match</p>
                    <p className="text-xs text-slate-500">Based on job requirements analysis</p>
                  </div>
                </div>

                {/* Dimension bars */}
                <div className="space-y-3">
                  {EVAL_DATA.dimensions.map((dim) => (
                    <div key={dim.label}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-700">{dim.label}</span>
                        <span className="font-bold" style={{ color: getBarColor(dim.value) }}>{dim.value}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${dim.value}%`, background: getBarColor(dim.value) }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Strengths */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle size={12} /> Strengths
                    </h4>
                    {EVAL_DATA.strengths.map((s, i) => (
                      <p key={i} className="text-[11px] text-slate-700 leading-snug flex items-start gap-1.5">
                        <CheckCircle size={10} className="text-emerald-500 mt-0.5 shrink-0" />
                        {s}
                      </p>
                    ))}
                  </div>

                  {/* Areas to explore */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Circle size={12} /> Areas to Explore
                    </h4>
                    {EVAL_DATA.areas.map((a, i) => (
                      <p key={i} className="text-[11px] text-slate-700 leading-snug flex items-start gap-1.5">
                        <Circle size={10} className="text-amber-500 mt-0.5 shrink-0" />
                        {a}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 border-t border-slate-200/60 bg-slate-50/50">
                <IllustrativeLabel />
              </div>
            </GlassCard>
          </Mv>
        </div>
      </div>
    </Section>
  );
}
