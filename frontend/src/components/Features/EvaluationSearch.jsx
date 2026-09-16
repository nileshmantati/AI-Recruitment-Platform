import { useState, useEffect } from 'react';
import { Mv, Section } from './Shared';
import { fadeUp } from './SharedData';
import Badge from '../../ui/Badge';
import { Brain, Search, Check, AlertCircle } from 'lucide-react';
import { T } from '../../Js/theme';

function EvaluationMock() {
  return (
    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
      <div className="flex justify-between items-center mb-5 pb-5 border-b border-slate-200">
        <span className="text-sm font-semibold text-slate-600">Overall Match</span>
        <span className="text-2xl font-black" style={{ color: T.primary }}>91%</span>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Skills', value: 'Excellent' },
          { label: 'Experience', value: 'Strong' },
          { label: 'Education', value: 'Good' },
        ].map(r => (
          <div key={r.label}>
            <span className="block text-[10px] text-slate-500 uppercase font-bold">{r.label}</span>
            <span className="block text-sm font-bold text-slate-900">{r.value}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
        <div>
          <h5 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1">
            <Check size={12} className="text-emerald-500" /> Strengths
          </h5>
          <ul className="text-xs text-slate-600 space-y-1.5">
            <li>✓ Django</li>
            <li>✓ Python</li>
            <li>✓ REST APIs</li>
          </ul>
        </div>
        <div>
          <h5 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1">
            <AlertCircle size={12} className="text-amber-500" /> Areas to Explore
          </h5>
          <ul className="text-xs text-slate-600 space-y-1.5">
            <li>• Limited React experience</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function SearchMock() {
  const [placeholder, setPlaceholder] = useState('');
  const fullText = "Senior Python Developer...";

  useEffect(() => {
    let i = 0;
    const intervalId = setInterval(() => {
      setPlaceholder(fullText.slice(0, i));
      i++;
      if (i > fullText.length) {
        clearInterval(intervalId);
      }
    }, 100);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
      {/* Search bar */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <div className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-sm text-slate-900 shadow-sm min-h-[42px] flex items-center">
          {placeholder}
          <span className="inline-block w-0.5 h-4 bg-slate-400 ml-0.5 animate-pulse" />
        </div>
      </div>
      {/* Filter chips */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Skill', value: 'Python' },
          { label: 'Experience', value: '2+ Years' },
          { label: 'AI Score', value: '80%+' },
          { label: 'Status', value: 'Shortlisted', badge: true },
        ].map(f => (
          <div key={f.label} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
            <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">{f.label}</span>
            {f.badge ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-600">{f.value}</span>
            ) : (
              <span className="block text-sm font-semibold text-slate-900">{f.value}</span>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-center pt-4 border-t border-slate-200 border-dashed">
        <span className="text-sm font-semibold px-4 py-1.5 rounded-full" style={{ color: T.primary, background: `${T.primary}15` }}>
          24 candidates found
        </span>
      </div>
    </div>
  );
}


export default function EvaluationSearch() {
  return (
    <Section className="py-16 sm:py-24 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Section 4 — AI Evaluation */}
          <Mv variants={fadeUp} className="bg-white rounded-3xl p-8 sm:p-10 shadow-lg border border-slate-200 flex flex-col hover:shadow-xl transition-shadow">
            <Badge><Brain size={14} className="mr-1" />AI EVALUATION</Badge>
            <h3 className="mt-6 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              See the Candidate Behind the Resume
            </h3>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Review AI-generated evaluations that break down each candidate's skills, experience, and education into clear ratings, with specific strengths and areas to explore listed for quick review.
            </p>
            <div className="mt-auto pt-8">
              <EvaluationMock />
            </div>
          </Mv>

          {/* Section 5 — Smart Search */}
          <Mv variants={fadeUp} className="bg-white rounded-3xl p-8 sm:p-10 shadow-lg border border-slate-200 flex flex-col hover:shadow-xl transition-shadow">
            <Badge color={T.secondary}><Search size={14} className="mr-1" />SMART SEARCH</Badge>
            <h3 className="mt-6 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Search the Talent Pool Your Way
            </h3>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Filter candidates by skills, experience level, AI score, or application status. Search across your entire talent pool from one unified interface.
            </p>
            <div className="mt-auto pt-8">
              <SearchMock />
            </div>
          </Mv>
        </div>
      </div>
    </Section>
  );
}
