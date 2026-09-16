import { Mv, Section } from './Shared';
import { fadeUp } from './SharedData';
import Badge from '../../ui/Badge';
import { Target, TrendingUp } from 'lucide-react';

function CandidateRankMock() {
  const candidates = [
    { id: '01', name: 'John Doe', skills: ['Python', 'Django', 'REST API'], score: 94, top: true },
    { id: '02', name: 'Jane Smith', skills: ['Python', 'React', 'SQL'], score: 87, top: false },
    { id: '03', name: 'Alex Patel', skills: ['Django', 'MySQL'], score: 82, top: false },
  ];

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-50 to-indigo-50/30 rounded-3xl transform rotate-2 scale-105 -z-10 border border-slate-100" />
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 flex flex-col gap-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ranked Candidates</h3>
          <TrendingUp size={16} className="text-slate-400" />
        </div>
        {candidates.map(c => (
          <div
            key={c.id}
            className={`relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 ${
              c.top
                ? 'bg-slate-50 shadow-sm border border-slate-200'
                : 'bg-white border border-slate-100 hover:border-slate-200 hover:shadow-sm'
            }`}
          >
            {c.top && (
              <div className="absolute -top-2.5 -right-2 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                ⭐ Top Match
              </div>
            )}
            <div className={`font-mono text-base font-bold ${c.top ? 'text-indigo-600' : 'text-slate-400'}`}>
              {c.id}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-900 truncate">{c.name}</h4>
              <div className="flex flex-wrap gap-1 mt-1">
                {c.skills.map(s => (
                  <span key={s} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">{s}</span>
                ))}
              </div>
            </div>
            <Mv 
              className={`text-xl font-black ${c.top ? 'text-indigo-600' : 'text-slate-700'}`}
              animate={c.top ? { scale: [1, 1.05, 1], opacity: [1, 0.8, 1] } : {}}
              transition={c.top ? { repeat: Infinity, duration: 2, ease: "easeInOut" } : {}}
            >
              {c.score}%
            </Mv>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CandidateMatching() {
  return (
    <Section className="py-16 sm:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: copy + requirement chips */}
          <Mv variants={fadeUp} className="max-w-xl">
            <Badge><Target size={14} className="mr-1" />AI MATCHING</Badge>
            <h2 className="mt-6 text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Match People to Roles, Not Just Keywords
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
              The AI compares each candidate's extracted profile against the job's requirements and produces a ranked list based on alignment — skills, experience level, and education. The score is a starting point for evaluation, not a final decision.
            </p>
            <div className="mt-6">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Job Requirements</span>
              <div className="mt-3 flex flex-wrap gap-2">
                {['Python', 'Django', 'REST API', '2+ Years', 'B.Tech CS'].map(r => (
                  <span key={r} className="px-3 py-1.5 rounded-full text-xs font-semibold border border-slate-200 bg-slate-50 text-slate-700">{r}</span>
                ))}
              </div>
            </div>
          </Mv>

          {/* Right: ranked candidate list */}
          <Mv variants={fadeUp}>
            <CandidateRankMock />
          </Mv>
        </div>
      </div>
    </Section>
  );
}
