import { Section, Mv, fadeUp, StepBadge, GlassCard, IllustrativeLabel } from './Shared';
import { T } from '../../Js/theme';
import { Target, Briefcase, User, CheckCircle, Minus } from 'lucide-react';

const JOB_REQUIREMENTS = [
  { skill: 'React', weight: 'Required' },
  { skill: 'TypeScript', weight: 'Required' },
  { skill: 'Tailwind CSS', weight: 'Required' },
  { skill: 'REST APIs', weight: 'Required' },
  { skill: 'GraphQL', weight: 'Preferred' },
];

const CANDIDATES = [
  { name: 'Priya Sharma', role: 'Sr. Frontend Eng.', score: 92, matched: ['React', 'TypeScript', 'Tailwind CSS', 'REST APIs'] },
  { name: 'Arjun Patel', role: 'Full Stack Dev', score: 78, matched: ['React', 'TypeScript', 'REST APIs'] },
  { name: 'Meera Reddy', role: 'UI Developer', score: 65, matched: ['React', 'Tailwind CSS'] },
];

const getScoreColor = (s) => s >= 85 ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : s >= 65 ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-rose-600 bg-rose-50 border-rose-200';

export default function CandidateMatching() {
  return (
    <Section className="py-14 sm:py-20" style={{ background: T.bg }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Right — copy (comes first on mobile) */}
          <Mv variants={fadeUp} className="order-1 lg:order-2">
            <StepBadge number={4} />
            <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">
              Match Candidates to the Role.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-lg">
              The platform compares each candidate&rsquo;s analyzed resume against the job&rsquo;s required skills
              and description. Candidates are ranked by alignment — the closer the match between what the
              role needs and what the candidate offers, the higher the score.
            </p>
            <p className="mt-3 text-sm text-slate-500 leading-relaxed max-w-lg">
              Recruiters see an ordered list of candidates with match percentages, making it straightforward
              to identify which applicants align most closely with the position.
            </p>
          </Mv>

          {/* Left — split-view mockup */}
          <Mv variants={fadeUp} className="order-2 lg:order-1">
            <GlassCard className="p-0 overflow-hidden">
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-200/60 flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${T.primary}15`, color: T.primary }}
                >
                  <Target size={16} />
                </div>
                <span className="text-sm font-bold text-slate-800">Candidate–Job Matching</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/60">
                {/* Left: Job requirements */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Briefcase size={14} className="text-indigo-500" />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Job Requirements</span>
                  </div>
                  <div className="space-y-2">
                    {JOB_REQUIREMENTS.map((req) => (
                      <div key={req.skill} className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-xs font-semibold text-slate-800">{req.skill}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${req.weight === 'Required' ? 'text-indigo-600' : 'text-slate-400'}`}>
                          {req.weight}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Ranked matches */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <User size={14} className="text-indigo-500" />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Ranked Candidates</span>
                  </div>
                  <div className="space-y-2.5">
                    {CANDIDATES.map((c, i) => (
                      <div key={c.name} className={`p-3 rounded-xl border ${i === 0 ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-100 bg-white'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-xs font-bold text-slate-800">{c.name}</p>
                            <p className="text-[10px] text-slate-500">{c.role}</p>
                          </div>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${getScoreColor(c.score)}`}>
                            {c.score}%
                          </span>
                        </div>
                        {/* Match indicators */}
                        <div className="flex flex-wrap gap-1">
                          {JOB_REQUIREMENTS.slice(0, 4).map((req) => {
                            const matched = c.matched.includes(req.skill);
                            return (
                              <span
                                key={req.skill}
                                className={`inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                                  matched ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
                                }`}
                              >
                                {matched ? <CheckCircle size={8} /> : <Minus size={8} />}
                                {req.skill}
                              </span>
                            );
                          })}
                        </div>
                      </div>
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
