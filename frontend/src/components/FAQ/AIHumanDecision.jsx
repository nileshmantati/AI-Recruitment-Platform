import { motion } from 'framer-motion';
import { Brain, UserCheck, CheckCircle2 } from 'lucide-react';
import { fadeUp } from './Shared';

export default function AIHumanDecision() {
  const steps = [
    {
      step: '01',
      title: 'AI Analysis',
      desc: 'Parses resume text, scores qualifications, and highlights strengths & skill gaps.',
      icon: Brain,
      color: 'text-indigo-400 bg-indigo-500/20 border-indigo-500/30',
    },
    {
      step: '02',
      title: 'Recruiter Review',
      desc: 'Hiring managers inspect raw credentials, portfolios, and contextual experience.',
      icon: UserCheck,
      color: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
    },
    {
      step: '03',
      title: 'Human Decision',
      desc: 'Recruiters manually choose to shortlist, schedule interviews, or decline.',
      icon: CheckCircle2,
      color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
    },
  ];

  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-50px' }}
      className="max-w-4xl mx-auto px-4 sm:px-6 mb-16"
    >
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 text-center max-w-2xl mx-auto mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <span>Human-in-the-Loop Architecture</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white mb-2">
            AI Supports the Process. Recruiters Make the Decision.
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Machine learning accelerates parsing and relevancy scoring, while human hiring teams retain sole authority over shortlisting and hiring outcomes.
          </p>
        </div>

        {/* 3 Step Flow */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {steps.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.step}
                className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 backdrop-blur-sm flex flex-col justify-between relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className={`p-2 rounded-xl border ${st.color}`}>
                      <Icon size={16} />
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 font-mono">
                      {st.step}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-white mb-1">
                    {st.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
