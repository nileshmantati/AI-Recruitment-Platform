import { Section, Mv } from './Shared';
import { fadeUp } from './SharedData';
import { T } from '../../Js/theme';
import { ScanSearch, FileCheck, Target, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StandaloneTools() {
  return (
    <Section className="py-16 sm:py-24" style={{ background: T.bg }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200/60 p-8 sm:p-12 shadow-sm relative overflow-hidden">
          
          {/* Subtle decoration */}
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-indigo-50/50 blur-3xl pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center relative z-10">
            {/* Left Copy */}
            <Mv variants={fadeUp}>
              <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider mb-5"
                style={{ color: T.secondary, background: `${T.secondary}15` }}>
                <ScanSearch size={14} /> Standalone Sandbox
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                Test resumes instantly without creating a job.
              </h2>
              <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed max-w-lg">
                The platform includes a standalone Resume Analyzer tool designed for both recruiters and candidates. 
                Upload any PDF resume, paste a target job description, and get instant, actionable feedback on alignment, 
                missing skills, and improvement strategies.
              </p>
              
              <ul className="mt-6 space-y-3">
                {[
                  { icon: Target, text: 'Instant match scoring against custom requirements' },
                  { icon: FileCheck, text: 'Detailed breakdown of owned vs. missing skills' },
                  { icon: ScanSearch, text: 'Strategic advice for resume improvement' }
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                    <item.icon size={16} className="text-indigo-500 mt-0.5 shrink-0" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Link to="/resume-analyzer" 
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all"
                  style={{ background: `linear-gradient(135deg, ${T.secondary}, ${T.primary})` }}>
                  Try the Analyzer <ArrowRight size={16} />
                </Link>
              </div>
            </Mv>

            {/* Right Graphic Mockup */}
            <Mv variants={fadeUp} className="hidden lg:block relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-indigo-500/10 rounded-2xl transform rotate-3 scale-105" />
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl relative z-10">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <ScanSearch size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Resume Analyzer</h4>
                    <p className="text-[10px] text-slate-500">Standalone evaluation module</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="w-full h-24 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 gap-2">
                    <FileCheck size={20} />
                    <span className="text-xs font-semibold">Drop Resume PDF</span>
                  </div>
                  <div className="w-full h-20 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Target Role Context</span>
                    <div className="w-3/4 h-2 rounded bg-slate-200 mt-2" />
                    <div className="w-1/2 h-2 rounded bg-slate-200 mt-2" />
                  </div>
                  <div className="w-full py-2.5 rounded-lg bg-indigo-600 text-center text-xs font-bold text-white shadow-sm">
                    Analyze Resume
                  </div>
                </div>
              </div>
            </Mv>
          </div>
        </div>
      </div>
    </Section>
  );
}
