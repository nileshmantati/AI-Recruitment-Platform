import { Section, Mv, fadeUp, StepBadge, GlassCard, REAL_STATUSES, IllustrativeLabel } from './Shared';
import { T } from '../../Js/theme';
import { Users, ArrowRight } from 'lucide-react';

/* Pipeline columns using real status values (excludes ERROR for display) */
const PIPELINE = [
  { ...REAL_STATUSES[0], count: 24 }, // PENDING
  { ...REAL_STATUSES[1], count: 18 }, // EVALUATED
  { ...REAL_STATUSES[2], count: 8 },  // SHORTLISTED
  { ...REAL_STATUSES[3], count: 5 },  // INTERVIEW_SCHEDULED
  { ...REAL_STATUSES[4], count: 6 },  // REJECTED
];

export default function Pipeline() {
  return (
    <Section className="py-14 sm:py-20" style={{ background: T.bg }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Mv variants={fadeUp} className="text-center mb-10 sm:mb-14">
          <StepBadge number={6} />
          <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">
            Move Candidates Through the Recruitment Pipeline.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Each application moves through a defined set of statuses as the recruiter reviews, evaluates,
            shortlists, or schedules interviews. The pipeline provides a clear view of where every
            candidate stands at any point.
          </p>
        </Mv>

        {/* Kanban-style pipeline */}
        <Mv variants={fadeUp}>
          <GlassCard className="p-5 sm:p-8">
            {/* Desktop horizontal */}
            <div className="hidden md:flex items-start gap-3 overflow-x-auto pb-2">
              {PIPELINE.map((col, i) => (
                <div key={col.key} className="flex items-start gap-3 flex-1 min-w-[140px]">
                  <div className="flex-1">
                    {/* Column header */}
                    <div
                      className="rounded-xl px-4 py-3 mb-3 border"
                      style={{ background: `${col.color}10`, borderColor: `${col.color}30` }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: col.color }}>
                          {col.label}
                        </span>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: `${col.color}20`, color: col.color }}
                        >
                          {col.count}
                        </span>
                      </div>
                    </div>

                    {/* Sample cards */}
                    <div className="space-y-2">
                      {Array.from({ length: Math.min(col.count, 3) }).map((_, j) => (
                        <div key={j} className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm">
                          <div className="w-full h-2 rounded bg-slate-100 mb-1.5" />
                          <div className="w-3/4 h-2 rounded bg-slate-100 mb-2" />
                          <div className="flex items-center justify-between">
                            <div className="w-5 h-5 rounded-full bg-slate-100" />
                            <div
                              className="w-8 h-3 rounded-full"
                              style={{ background: `${col.color}25` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Arrow between columns */}
                  {i < PIPELINE.length - 1 && (
                    <div className="flex items-center pt-5 shrink-0">
                      <ArrowRight size={16} className="text-slate-300" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile vertical */}
            <div className="md:hidden space-y-3">
              {PIPELINE.map((col, i) => (
                <div key={col.key}>
                  <div
                    className="rounded-xl px-4 py-3 border flex items-center justify-between"
                    style={{ background: `${col.color}10`, borderColor: `${col.color}30` }}
                  >
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: col.color }}>
                      {col.label}
                    </span>
                    <span
                      className="text-sm font-bold"
                      style={{ color: col.color }}
                    >
                      {col.count}
                    </span>
                  </div>
                  {i < PIPELINE.length - 1 && (
                    <div className="flex justify-center py-1">
                      <ArrowRight size={14} className="text-slate-300 rotate-90" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
              <IllustrativeLabel />
              <div className="flex items-center gap-1.5">
                <Users size={13} className="text-slate-400" />
                <span className="text-[10px] font-medium text-slate-400">Pipeline based on actual application statuses</span>
              </div>
            </div>
          </GlassCard>
        </Mv>
      </div>
    </Section>
  );
}
