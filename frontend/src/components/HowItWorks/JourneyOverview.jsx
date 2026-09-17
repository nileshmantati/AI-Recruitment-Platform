import { Section, Mv, fadeUp, HIW_STEPS, GlassCard } from './Shared';
import { T } from '../../Js/theme';
import Badge from '../../ui/Badge';

export default function JourneyOverview() {
  return (
    <Section className="pt-18 pb-14 sm:pt-22 sm:pb-20" style={{
      background: `radial-gradient(100% 100% at 50% 0%, ${T.primary}12, transparent 60%), radial-gradient(100% 100% at 90% 10%, ${T.secondary}12, transparent 50%), ${T.bg}`
    }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Mv variants={fadeUp} className="text-center mb-10 sm:mb-14">
          <Badge color={T.secondary}>HOW IT WORKS</Badge>
          <h1 className="mt-4 sm:mt-5 text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            From job posting to recruitment decision.
          </h1>
          <p className="mt-3 sm:mt-4 max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed">
            Follow a job and a candidate through every step of the recruitment workflow — from the moment
            a role is created to the final hiring insight.
          </p>
        </Mv>

        {/* Large Desktop (1280px+): horizontal 8-step timeline */}
        <div className="hidden xl:flex items-start justify-center gap-0 relative">
          {/* Connecting line behind */}
          <div className="absolute top-8 left-[6%] right-[6%] h-px bg-gradient-to-r from-indigo-200 via-purple-200 to-cyan-200 z-0" />

          {HIW_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <Mv key={step.n} variants={fadeUp} className="flex flex-col items-center text-center relative z-10 flex-1 px-1">
                <Mv
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: step.n * 0.15 }}
                  className="w-14 h-14 xl:w-16 xl:h-16 rounded-2xl flex items-center justify-center shadow-md border border-white/60 mb-3 bg-white"
                  style={{ color: T.primary }}
                >
                  <Icon size={26} strokeWidth={1.8} />
                </Mv>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1">
                  {String(step.n).padStart(2, '0')}
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-800">{step.label}</span>
                <span className="text-[11px] text-slate-500 mt-0.5 leading-snug max-w-[110px]">{step.desc}</span>
              </Mv>
            );
          })}
        </div>

        {/* Tablet / Medium Screens (640px - 1279px): 4-column x 2-row grid */}
        <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 xl:hidden">
          {HIW_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <Mv key={step.n} variants={fadeUp}>
                <GlassCard className="p-3.5 sm:p-4 h-full flex flex-col items-center text-center">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shadow-xs border border-white/60 mb-2 bg-white"
                    style={{ color: T.primary }}
                  >
                    <Icon size={20} strokeWidth={2} />
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                    Step {String(step.n).padStart(2, '0')}
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">{step.label}</p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">{step.desc}</p>
                </GlassCard>
              </Mv>
            );
          })}
        </div>

        {/* Mobile (<640px): self-contained vertical timeline (zero overlap, centered line) */}
        <div className="sm:hidden flex flex-col">
          {HIW_STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <Mv key={step.n} variants={fadeUp} className="flex items-start gap-3">
                {/* Centered line & icon column */}
                <div className="flex flex-col items-center shrink-0 self-stretch">
                  <Mv
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: step.n * 0.1 }}
                    className="w-8 h-8 rounded-xl flex items-center justify-center shadow-xs border border-slate-200/80 bg-white shrink-0 z-10"
                    style={{ color: T.primary }}
                  >
                    <Icon size={15} strokeWidth={2} />
                  </Mv>
                  {i < HIW_STEPS.length - 1 && (
                    <div className="w-0.5 flex-1 my-1 bg-gradient-to-b from-indigo-300 via-purple-200 to-cyan-200 rounded-full" />
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
