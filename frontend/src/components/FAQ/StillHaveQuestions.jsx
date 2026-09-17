import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, FileSearch, Sparkles } from 'lucide-react';
import { fadeUp } from './Shared';

export default function StillHaveQuestions() {
  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-50px' }}
      className="max-w-4xl mx-auto px-4 sm:px-6 pb-20 text-center"
    >
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
          Still have questions?
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mb-5 leading-relaxed">
          Experience the platform firsthand — analyze your resume or browse current open roles.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/resume-analyzer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 hover:text-indigo-600 hover:border-indigo-300 shadow-2xs transition-all no-underline"
          >
            <Sparkles size={14} className="text-indigo-600" />
            <span>Try Resume Analyzer</span>
          </Link>

          <Link
            to="/findjobs"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs sm:text-sm font-semibold hover:bg-indigo-700 shadow-2xs transition-all no-underline"
          >
            <FileSearch size={14} />
            <span>Browse Jobs</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
