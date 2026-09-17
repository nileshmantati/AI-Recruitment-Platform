import { Section, Mv, fadeUp, HIW_STEPS, GlassCard } from './Shared';
import { T } from '../../Js/theme';

export default function WorkflowSummary() {
  return (
    <Section className="py-14 sm:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Mv variants={fadeUp} className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">
            From Resume Upload to Recruitment Decision.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            The complete workflow at a glance — eight connected steps from job creation to insights.
          </p>
        </Mv>

        {/* Large Desktop (1280px+): horizontal timeline */}
        <div className="hidden xl:block">
          <Mv variants={fadeUp}>
            <GlassCard className="p-6 sm:p-8">
              <div className="relative">
                {/* Connecting line */}
                <div className="absolute top-7 left-[6%] right-[6%] h-px bg-gradient-to-r from-indigo-200 via-purple-200 to-cyan-200 z-0" />

                <div className="flex items-start justify-between gap-2 relative z-10">
                  {HIW_STEPS.map((step) => {
                    const Icon = step.icon;
                    return (
                      <div key={step.n} className="flex flex-col items-center text-center flex-1 px-1">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md text-white mb-3"
                          style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}
                        >
                          <Icon size={22} />
                        </div>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1">
                          {String(step.n).padStart(2, '0')}
                        </span>
                        <p className="text-xs font-bold text-slate-800 mb-0.5">{step.label}</p>
                        <p className="text-[10px] text-slate-500 leading-snug max-w-[110px]">{step.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </GlassCard>
          </Mv>
        </div>

        {/* Tablet / Medium Screens (640px - 1279px): 4-column x 2-row grid inside GlassCard */}
        <div className="hidden sm:block xl:hidden">
          <Mv variants={fadeUp}>
            <GlassCard className="p-5 sm:p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {HIW_STEPS.map((step) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.n} className="flex flex-col items-center text-center p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-xs text-white mb-2"
                        style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}
                      >
                        <Icon size={20} />
                      </div>
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                        Step {String(step.n).padStart(2, '0')}
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">{step.label}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{step.desc}</p>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </Mv>
        </div>

        {/* Mobile (<640px): self-contained vertical timeline (zero overlap, centered line) */}
        <div className="sm:hidden flex flex-col">
          {HIW_STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <Mv key={step.n} variants={fadeUp} className="flex items-start gap-3">
                {/* Centered line & icon column */}
                <div className="flex flex-col items-center shrink-0 self-stretch">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0 z-10"
                    style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}
                  >
                    <Icon size={14} />
                  </div>
                  {i < HIW_STEPS.length - 1 && (
                    <div className="w-0.5 flex-1 my-1 bg-gradient-to-b from-indigo-400 via-purple-300 to-cyan-300 rounded-full" />
                  )}
                </div>

                {/* Content card */}
                <GlassCard className="p-3 flex-1 mb-2.5">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                    Step {String(step.n).padStart(2, '0')}
                  </span>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">{step.label}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{step.desc}</p>
                </GlassCard>
              </Mv>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
