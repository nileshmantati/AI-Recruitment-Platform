import { Brain, ShieldCheck, Target, UserCheck, CalendarCheck, FileQuestion, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

const ICON_MAP = {
  Brain,
  ShieldCheck,
  Target,
  UserCheck,
  CalendarCheck,
  FileQuestion,
};

export default function FAQPopularBento({ onSelectQuestion }) {
  const popularCards = [
    {
      id: "ai-1",
      tag: "AI & Extraction",
      question: "How does AI resume analysis work in this platform?",
      desc: "Auto-detects PDF/DOCX, extracts text, and parses via Gemini 2.5 Flash.",
      icon: "Brain",
      accent: "text-indigo-600 bg-indigo-50 border-indigo-100",
    },
    {
      id: "ai-2",
      tag: "Decision Boundary",
      question: "Does the AI make the final hiring decision?",
      desc: "No. The AI provides evaluation scores; recruiters make all hiring decisions.",
      icon: "ShieldCheck",
      accent: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      id: "ai-3",
      tag: "Scoring Metric",
      question: "What do the AI scores and match percentages mean?",
      desc: "Quality score for standalone uploads; job requirements benchmark for applications.",
      icon: "Target",
      accent: "text-purple-600 bg-purple-50 border-purple-100",
    },
    {
      id: "can-1",
      tag: "Candidate Tracking",
      question: "Can candidates track applications and AI feedback?",
      desc: "Yes, candidates view real-time status badges, match scores, and skill gaps.",
      icon: "UserCheck",
      accent: "text-sky-600 bg-sky-50 border-sky-100",
    },
    {
      id: "int-1",
      tag: "Interviewing",
      question: "How do recruiters schedule an interview?",
      desc: "Recruiters input datetime and meeting link; automated invitation is sent.",
      icon: "CalendarCheck",
      accent: "text-amber-600 bg-amber-50 border-amber-100",
    },
    {
      id: "ai-4",
      tag: "Edge Cases",
      question: "What happens if resume processing fails?",
      desc: "Background tasks retry 3x. If text fails, status is marked as 'ERROR'.",
      icon: "FileQuestion",
      accent: "text-rose-600 bg-rose-50 border-rose-100",
    },
  ];

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wider">
            Popular Questions
          </h2>
          <p className="text-xs text-slate-500">Quick answers to what most users ask first</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {popularCards.map((card) => {
          const Icon = ICON_MAP[card.icon] || Brain;
          return (
            <motion.button
              key={card.id}
              type="button"
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectQuestion(card.id)}
              className="flex flex-col text-left p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group relative overflow-hidden"
            >
              <div className="flex items-center justify-between w-full mb-2.5">
                <div className={`p-2 rounded-xl border ${card.accent}`}>
                  <Icon size={18} />
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 group-hover:text-indigo-600 transition-colors">
                  <span>{card.tag}</span>
                  <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-900 line-clamp-2 mb-1 group-hover:text-indigo-600 transition-colors">
                {card.question}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mt-auto">
                {card.desc}
              </p>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
