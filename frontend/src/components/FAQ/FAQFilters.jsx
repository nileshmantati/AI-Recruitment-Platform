import { motion } from 'framer-motion';
import { Layers, Brain, BriefcaseBusiness, UserCheck, ShieldCheck } from 'lucide-react';
import { FAQ_CATEGORIES } from './faqData.js';
import { fadeUp } from './Shared';

const CATEGORY_ICONS = {
  All: Layers,
  'AI & Matching': Brain,
  'Recruiters & Pipeline': BriefcaseBusiness,
  Candidates: UserCheck,
  'Security & Access': ShieldCheck,
};

export default function FAQFilters({
  activeCategory,
  setActiveCategory,
  categoryCounts = {},
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
      className="max-w-4xl mx-auto px-2 sm:px-4 mb-10"
    >
      <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-2 no-scrollbar gap-2">
        {FAQ_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          const Icon = CATEGORY_ICONS[cat] || Layers;
          const count = categoryCounts[cat];

          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${isActive
                ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/10'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 shadow-2xs'
                }`}
            >
              <Icon size={15} className={isActive ? 'text-indigo-400' : 'text-slate-400'} />
              <span>{cat}</span>
              {count !== undefined && (
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${isActive ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-500'
                    }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
