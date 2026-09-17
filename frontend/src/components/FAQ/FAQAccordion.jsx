import {
  Brain,
  ShieldCheck,
  Target,
  FileText,
  ClipboardList,
  BriefcaseBusiness,
  UserCheck,
  Lightbulb,
  LockKeyhole,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeUp } from './Shared';

const ICON_MAP = {
  Brain,
  ShieldCheck,
  Target,
  FileText,
  ClipboardList,
  BriefcaseBusiness,
  UserCheck,
  Lightbulb,
  LockKeyhole,
};

export default function FAQAccordion({
  items = [],
  openItems = new Set(),
  toggleItem,
}) {
  // Group items by category for clean browsing
  const groupedByCategory = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  let globalIndex = 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-16" id="faq-accordion-container">
      <div className="space-y-8">
        {Object.entries(groupedByCategory).map(([categoryName, catItems]) => (
          <div key={categoryName} className="space-y-3">
            {/* Category Sub-header */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-40px' }}
              className="flex items-center gap-2.5 pb-2 border-b border-slate-200/80"
            >
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                {categoryName}
              </h2>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {catItems.length} {catItems.length === 1 ? 'question' : 'questions'}
              </span>
            </motion.div>

            {/* Questions list */}
            <div className="space-y-2.5">
              {catItems.map((item) => {
                globalIndex += 1;
                const itemNum = String(globalIndex).padStart(2, '0');
                const isOpen = openItems.has(item.id);
                const Icon = ICON_MAP[item.icon] || Brain;

                return (
                  <motion.div
                    key={item.id}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-40px' }}
                    id={`faq-item-${item.id}`}
                    className={`rounded-2xl border transition-all duration-200 bg-white overflow-hidden shadow-2xs ${
                      isOpen
                        ? 'border-indigo-300 ring-1 ring-indigo-200/50 shadow-sm'
                        : 'border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    {/* Toggle Button */}
                    <button
                      type="button"
                      onClick={() => toggleItem(item.id)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${item.id}`}
                      className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-3 sm:gap-4 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-2xl"
                    >
                      <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                        {/* Number badge / Icon badge */}
                        <div
                          className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs transition-colors ${
                            isOpen
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <Icon size={16} />
                        </div>

                        <div className="min-w-0">
                          <span className="text-sm sm:text-base font-semibold text-slate-900 block leading-snug">
                            <span className="text-slate-400 font-mono text-xs mr-2 font-normal">{itemNum}</span>
                            {item.question}
                          </span>
                        </div>
                      </div>

                      {/* Rotating Chevron */}
                      <div
                        className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center transition-all ${
                          isOpen ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-50 text-slate-400'
                        }`}
                      >
                        <ChevronDown
                          size={18}
                          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </div>
                    </button>

                    {/* Collapsible Answer */}
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          id={`faq-answer-${item.id}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                            <p className="text-slate-700 leading-relaxed">{item.answer}</p>

                            {/* Optional Mini Visual Flow */}
                            {item.optionalVisual && (
                              <div className="mt-4 p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                  <span>{item.optionalVisual.title}</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                                  {item.optionalVisual.steps.map((st, sIdx) => (
                                    <div
                                      key={st.step}
                                      className="p-2.5 rounded-lg bg-white border border-slate-200/70 shadow-2xs relative"
                                    >
                                      <div className="flex items-center gap-1.5 mb-1">
                                        <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center">
                                          {st.step}
                                        </span>
                                        <span className="text-xs font-bold text-slate-800 truncate">
                                          {st.title}
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-slate-500 leading-tight">
                                        {st.desc}
                                      </p>
                                      {sIdx < item.optionalVisual.steps.length - 1 && (
                                        <ArrowRight
                                          size={12}
                                          className="hidden sm:block text-slate-300 absolute -right-2 top-1/2 -translate-y-1/2 z-10"
                                        />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
