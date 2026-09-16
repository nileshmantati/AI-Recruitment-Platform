import { Mv, Section } from './Shared';
import { fadeUp, WORKFLOW_STEPS } from './SharedData';
import Badge from '../../ui/Badge';
import { T } from '../../Js/theme';

export default function CompactIntro() {
  return (
    <Section className="pt-18 pb-12 sm:pt-22 sm:pb-16"
      style={{
        background: `radial-gradient(100% 100% at 50% 0%, ${T.primary}12, transparent 60%), radial-gradient(100% 100% at 90% 10%, ${T.secondary}12, transparent 50%)`
      }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
        <Mv variants={fadeUp}>
          <Badge>FEATURES</Badge>
        </Mv>
        <Mv variants={fadeUp}>
          <h1 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            Everything your recruitment workflow needs.
          </h1>
        </Mv>
        <Mv variants={fadeUp}>
          <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed">
            Resumes, candidates, applications, interviews, and analytics — in one connected platform.
          </p>
        </Mv>

        {/* Mini workflow spine */}
        <Mv variants={fadeUp} className="mt-10 w-full overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          <div className="flex items-center justify-start md:justify-center gap-1 sm:gap-2 min-w-max">
            {WORKFLOW_STEPS.map((s, i) => (
              <div key={s.n} className="flex items-center gap-1 sm:gap-2 shrink-0">
                <div
                  className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs font-bold text-white shrink-0 shadow-sm"
                  style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}
                >
                  {s.n}
                </div>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-600 whitespace-nowrap">{s.label}</span>
                {i < WORKFLOW_STEPS.length - 1 && (
                  <div className="w-4 sm:w-8 h-px bg-slate-300 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </Mv>
      </div>
    </Section>
  );
}
