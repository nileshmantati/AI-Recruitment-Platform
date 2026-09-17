import { Section, Mv, fadeUp, StepBadge, GlassCard, IllustrativeLabel } from './Shared';
import { T } from '../../Js/theme';
import { CalendarCheck, UserCheck, CheckCircle, Link2, Clock, ArrowRight } from 'lucide-react';

export default function ShortlistInterview() {
  return (
    <Section className="py-14 sm:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left — copy */}
          <Mv variants={fadeUp}>
            <StepBadge number={7} />
            <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">
              Move From Evaluation to Interview.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-lg">
              When a recruiter shortlists a candidate, the next step is scheduling an interview. The
              recruiter selects a date and time, provides a meeting link, and the platform sends an
              email invitation to the candidate with all the details.
            </p>
            <div className="mt-6 space-y-3">
              {[
                'Shortlist candidates directly from the evaluation view',
                'Schedule with a specific date/time and meeting link',
                'Candidate receives an automated email invitation',
                'Application status moves to Interview Scheduled',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </Mv>

          {/* Right — interview flow mockup */}
          <Mv variants={fadeUp}>
            <div className="space-y-4">
              {/* Candidate card */}
              <GlassCard className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${T.success}15`, color: T.success }}
                    >
                      <UserCheck size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Priya Sharma</p>
                      <p className="text-xs text-slate-500">Senior Frontend Engineer</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                      92%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Shortlisted
                  </span>
                </div>
              </GlassCard>

              {/* Arrow */}
              <div className="flex justify-center">
                <ArrowRight size={18} className="text-indigo-300 rotate-90" />
              </div>

              {/* Schedule interview form */}
              <GlassCard className="p-4 sm:p-5">
                <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-200/60">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${T.primary}15`, color: T.primary }}
                  >
                    <CalendarCheck size={16} />
                  </div>
                  <span className="text-sm font-bold text-slate-800">Schedule Interview</span>
                </div>

                <div className="space-y-3">
                  {/* Date/Time field */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                      <Clock size={12} />
                      Date & Time
                    </label>
                    <div className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-xs text-slate-700">
                      September 22, 2026 — 2:30 PM
                    </div>
                  </div>

                  {/* Meeting link field */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                      <Link2 size={12} />
                      Meeting Link
                    </label>
                    <div className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-xs text-indigo-600">
                      https://meet.google.com/abc-defg-hij
                    </div>
                  </div>
                </div>

                {/* Schedule button */}
                <div
                  className="mt-4 w-full rounded-xl py-2.5 text-center text-sm font-semibold text-white shadow-md"
                  style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}
                >
                  Schedule Interview
                </div>
              </GlassCard>

              {/* Arrow */}
              <div className="flex justify-center">
                <ArrowRight size={18} className="text-indigo-300 rotate-90" />
              </div>

              {/* Confirmation */}
              <div
                className="flex items-center gap-2.5 rounded-xl px-4 py-3 border"
                style={{ background: `${T.success}10`, borderColor: `${T.success}30` }}
              >
                <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                <div>
                  <span className="text-sm font-semibold text-emerald-700 block">Interview Scheduled</span>
                  <span className="text-[11px] text-emerald-600">Email invitation sent to candidate</span>
                </div>
              </div>

              <IllustrativeLabel />
            </div>
          </Mv>
        </div>
      </div>
    </Section>
  );
}
