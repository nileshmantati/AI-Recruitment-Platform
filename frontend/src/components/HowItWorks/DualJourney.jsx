import { Section, Mv, fadeUp, GlassCard } from './Shared';
import { T } from '../../Js/theme';
import {
  BriefcaseBusiness, FileText, Sparkles, Target, ClipboardList,
  Users, UserCheck, CalendarCheck, ChartNoAxesCombined,
  Search, Eye, UploadCloud, Send, Clock
} from 'lucide-react';

const RECRUITER_STEPS = [
  { icon: BriefcaseBusiness, label: 'Create Job', desc: 'Define role & requirements' },
  { icon: FileText, label: 'Receive Application', desc: 'Candidate applies with resume' },
  { icon: Sparkles, label: 'AI Analysis', desc: 'Resume scored & evaluated' },
  { icon: Target, label: 'Matching', desc: 'Candidates ranked by fit' },
  { icon: ClipboardList, label: 'Evaluation', desc: 'Review AI-generated insights' },
  { icon: Users, label: 'Manage Pipeline', desc: 'Update application statuses' },
  { icon: UserCheck, label: 'Shortlist', desc: 'Select top candidates' },
  { icon: CalendarCheck, label: 'Interview', desc: 'Schedule with date & link' },
  { icon: ChartNoAxesCombined, label: 'Insights', desc: 'Review analytics & funnel' },
];

const CANDIDATE_STEPS = [
  { icon: Search, label: 'Discover Jobs', desc: 'Browse open positions' },
  { icon: Eye, label: 'View Details', desc: 'Review job info & skills' },
  { icon: UploadCloud, label: 'Upload Resume', desc: 'Attach PDF resume' },
  { icon: Send, label: 'Apply', desc: 'Submit application' },
  { icon: Clock, label: 'Track Status', desc: 'Monitor application progress' },
  { icon: CalendarCheck, label: 'Interview', desc: 'Receive invitation & attend' },
];

/* Where tracks converge: recruiter step index 1 (Receive Application) ↔ candidate step index 3 (Apply) */
const RECRUITER_CONVERGE = 1;
const CANDIDATE_CONVERGE = 3;

export default function DualJourney() {
  return (
    <Section
      className="py-14 sm:py-24 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${T.primary}08, ${T.accent}06, ${T.secondary}08)`,
      }}
    >
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full blur-[150px] pointer-events-none opacity-30"
        style={{ background: `radial-gradient(circle, ${T.primary}30, ${T.accent}15, transparent)` }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <Mv variants={fadeUp} className="text-center mb-10 sm:mb-16">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
            style={{ color: T.accent, background: `${T.accent}1A` }}
          >
            The Full Picture
          </span>
          <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">
            Two Experiences. One Recruitment Workflow.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            The recruiter and candidate follow separate paths that converge when an application
            is submitted — then diverge again as the recruiter evaluates and the candidate tracks progress.
          </p>
        </Mv>

        {/* Large Desktop (1280px+): side-by-side tracks with center convergence column */}
        <div className="hidden xl:grid grid-cols-[1fr_auto_1fr] gap-6 items-start">
          {/* Recruiter track */}
          <Mv variants={fadeUp}>
            <div className="text-center mb-5">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
                style={{ color: T.primary, background: `${T.primary}15` }}
              >
                Recruiter Journey
              </span>
            </div>
            <div className="space-y-0 relative">
              {/* Vertical line */}
              <div className="absolute left-5 top-5 bottom-5 w-px bg-gradient-to-b from-indigo-300 via-indigo-200 to-indigo-300" />

              {RECRUITER_STEPS.map((step, i) => {
                const Icon = step.icon;
                const isConverge = i === RECRUITER_CONVERGE;
                return (
                  <div key={step.label} className="flex items-start gap-3 py-2 relative">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 relative z-10 border shadow-xs ${isConverge
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white border-indigo-400'
                        : 'bg-white text-indigo-600 border-slate-200'
                        }`}
                    >
                      <Icon size={18} />
                    </div>
                    <div className={`flex-1 rounded-xl p-3 border ${isConverge
                      ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-200 ring-offset-1'
                      : 'bg-white/80 border-slate-200/60'
                      }`}>
                      <p className={`text-xs font-bold ${isConverge ? 'text-indigo-800' : 'text-slate-800'}`}>{step.label}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Mv>

          {/* Center convergence column */}
          <Mv variants={fadeUp} className="flex flex-col items-center pt-28">
            <div className="flex flex-col items-center gap-2">
              <div className="w-px h-16 bg-gradient-to-b from-transparent to-purple-300" />
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg relative"
                style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}
              >
                <Send size={20} />
                <div className="absolute inset-0 rounded-2xl animate-ping opacity-20"
                  style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}
                />
              </div>
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider mt-1">
                Application
              </span>
              <span className="text-[10px] text-slate-500">Paths converge</span>
              <div className="w-px h-16 bg-gradient-to-b from-purple-300 to-transparent" />
            </div>
          </Mv>

          {/* Candidate track */}
          <Mv variants={fadeUp}>
            <div className="text-center mb-5">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
                style={{ color: T.secondary, background: `${T.secondary}15` }}
              >
                Candidate Journey
              </span>
            </div>
            <div className="space-y-0 relative">
              {/* Vertical line */}
              <div className="absolute right-5 top-5 bottom-5 w-px bg-gradient-to-b from-cyan-300 via-cyan-200 to-cyan-300" />

              {CANDIDATE_STEPS.map((step, i) => {
                const Icon = step.icon;
                const isConverge = i === CANDIDATE_CONVERGE;
                return (
                  <div key={step.label} className="flex items-start gap-3 py-2 relative flex-row-reverse">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 relative z-10 border shadow-xs ${isConverge
                        ? 'bg-gradient-to-br from-cyan-500 to-indigo-500 text-white border-cyan-400'
                        : 'bg-white text-cyan-600 border-slate-200'
                        }`}
                    >
                      <Icon size={18} />
                    </div>
                    <div className={`flex-1 rounded-xl p-3 border text-right ${isConverge
                      ? 'bg-cyan-50 border-cyan-200 ring-2 ring-cyan-200 ring-offset-1'
                      : 'bg-white/80 border-slate-200/60'
                      }`}>
                      <p className={`text-xs font-bold ${isConverge ? 'text-cyan-800' : 'text-slate-800'}`}>{step.label}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Mv>
        </div>

        {/* Tablet / Medium Screens (640px - 1279px) & Mobile (<640px) */}
        <div className="xl:hidden space-y-6">
          {/* Convergence callout banner at the top of stacked tracks */}
          <Mv variants={fadeUp} className="text-center mb-6">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-white shadow-sm"
              style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}
            >
              <Send size={14} />
              Paths converge at application submission
            </div>
          </Mv>

          {/* Side-by-side on sm/md/lg, stacked on xs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 items-start">
            {[
              { title: 'Recruiter Journey', steps: RECRUITER_STEPS, color: T.primary, converge: RECRUITER_CONVERGE },
              { title: 'Candidate Journey', steps: CANDIDATE_STEPS, color: T.secondary, converge: CANDIDATE_CONVERGE },
            ].map((track) => (
              <Mv key={track.title} variants={fadeUp}>
                <GlassCard className="p-4 sm:p-5 h-full">
                  <div className="mb-4">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
                      style={{ color: track.color, background: `${track.color}15` }}
                    >
                      {track.title}
                    </span>
                  </div>

                  {/* Clean Flex-based vertical timeline: zero offset mismatch, zero overlap */}
                  <div className="flex flex-col">
                    {track.steps.map((step, i) => {
                      const Icon = step.icon;
                      const isConverge = i === track.converge;
                      return (
                        <div key={step.label} className="flex items-start gap-3">
                          {/* Centered icon & line */}
                          <div className="flex flex-col items-center shrink-0 self-stretch">
                            <div
                              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 shadow-2xs z-10 ${
                                isConverge ? 'text-white shadow-xs' : 'bg-white border border-slate-200'
                              }`}
                              style={isConverge ? { background: `linear-gradient(135deg, ${track.color}, ${T.accent})` } : { color: track.color }}
                            >
                              <Icon size={14} />
                            </div>
                            {i < track.steps.length - 1 && (
                              <div className="w-0.5 flex-1 my-1 rounded-full" style={{ background: `${track.color}35` }} />
                            )}
                          </div>

                          {/* Content */}
                          <div className={`flex-1 p-2 sm:p-2.5 rounded-xl border mb-2 ${
                            isConverge ? 'bg-indigo-50/60 border-indigo-200' : 'bg-white/60 border-slate-100'
                          }`}>
                            <p className={`text-xs font-bold ${isConverge ? 'text-indigo-800' : 'text-slate-800'}`}>
                              {step.label}
                            </p>
                            <p className="text-[11px] text-slate-500 leading-snug">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </GlassCard>
              </Mv>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
