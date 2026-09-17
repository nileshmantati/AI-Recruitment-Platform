import { Mv, Section } from './Shared';
import { fadeUp } from './SharedData';
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
            A powerful toolkit for modern recruitment.
          </h1>
        </Mv>
        <Mv variants={fadeUp}>
          <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed">
            Discover the modular capabilities that power our platform. From deep AI integration to
            secure role-based access, everything you need is built right in.
          </p>
        </Mv>

        {/* Feature chips instead of a timeline */}
        <Mv variants={fadeUp} className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {['Powered by Gemini AI', 'Enterprise Security', 'Rich Analytics', 'Custom Workflows'].map((chip) => (
            <span key={chip} className="px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-white border border-slate-200/60 shadow-sm text-slate-700">
              {chip}
            </span>
          ))}
        </Mv>
      </div>
    </Section>
  );
}
