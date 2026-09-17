import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeUp } from './Shared';
import { T } from '../../Js/theme.js';

export default function FAQIntro() {
  return (
    <section className="relative pt-18 pb-14 sm:pt-22 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
      {/* Background ambient radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-96 h-56 rounded-full blur-[100px] pointer-events-none opacity-25"
        style={{ background: `radial-gradient(100% 100% at 50% 0%, ${T.primary}12, transparent 60%), radial-gradient(100% 100% at 90% 10%, ${T.secondary}12, transparent 50%), ${T.bg}` }}
      />

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="relative z-10"
      >
        {/* Small badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border border-indigo-200/80 bg-indigo-50/80 text-indigo-700 shadow-xs">
          <Sparkles size={13} className="text-indigo-600" />
          <span>Platform FAQ</span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
          Frequently asked{' '}
          <span
            className="text-transparent bg-clip-text"
            style={{ backgroundImage: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}
          >
            questions.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Everything you need to know about AI resume analysis, candidate ranking, recruitment pipelines, and role permissions.
        </p>
      </motion.div>
    </section>
  );
}
