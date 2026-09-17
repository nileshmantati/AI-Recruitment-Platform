import { BriefcaseBusiness, User, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RoleQuickAccess({ onSelectLens }) {
  const cards = [
    {
      id: 'recruiter',
      role: 'recruiter',
      category: 'All',
      title: 'I am a Recruiter',
      subtitle: 'Hiring teams & talent managers',
      desc: 'Learn about posting jobs, ranking candidates by score, AI interview question generation, and scheduling interviews.',
      icon: BriefcaseBusiness,
      accent: 'border-indigo-200 bg-indigo-50/50 hover:border-indigo-400 text-indigo-700',
      tag: 'Recruiter Hub',
    },
    {
      id: 'candidate',
      role: 'candidate',
      category: 'All',
      title: 'I am a Candidate',
      subtitle: 'Job applicants & active seekers',
      desc: 'Understand application status tracking, match score transparency, standalone resume analysis, and interview notifications.',
      icon: User,
      accent: 'border-purple-200 bg-purple-50/50 hover:border-purple-400 text-purple-700',
      tag: 'Candidate Hub',
    },
    {
      id: 'ai-explorer',
      role: 'all',
      category: 'AI & Resume',
      title: 'Exploring the AI',
      subtitle: 'Models, limits & architecture',
      desc: 'Clarifications on how Gemini 2.5 Flash extracts resume text, calculates scores, avoids automatic rejections, and handles errors.',
      icon: Sparkles,
      accent: 'border-emerald-200 bg-emerald-50/50 hover:border-emerald-400 text-emerald-700',
      tag: 'AI Deep Dive',
    },
  ];

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-14">
      <div className="mb-4">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wider">
          What Are You Looking For?
        </h2>
        <p className="text-xs text-slate-500">
          Filter platform FAQs immediately to your perspective
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.button
              key={card.id}
              type="button"
              whileHover={{ y: -3, transition: { duration: 0.15 } }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectLens(card.role, card.category)}
              className={`p-5 rounded-2xl border text-left bg-white shadow-sm transition-all flex flex-col justify-between group ${card.accent}`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-white shadow-xs border border-slate-200/60">
                    <Icon size={20} className="currentColor" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border border-slate-200/60 text-slate-600">
                    {card.tag}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-0.5 group-hover:text-indigo-600 transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs font-semibold text-slate-400 mb-2">
                  {card.subtitle}
                </p>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {card.desc}
                </p>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 pt-2 border-t border-slate-100 group-hover:gap-2 transition-all">
                <span>View {card.title} FAQs</span>
                <ArrowRight size={14} />
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
