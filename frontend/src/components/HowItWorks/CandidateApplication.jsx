import { Section, Mv, fadeUp, StepBadge, GlassCard, IllustrativeLabel } from './Shared';
import { T } from '../../Js/theme';
import { FileText, UploadCloud, CheckCircle, Search, Eye, ArrowRight } from 'lucide-react';

const FLOW_STEPS = [
  { icon: Search, label: 'Browse Jobs', desc: 'Find a role that fits' },
  { icon: Eye, label: 'View Details', desc: 'Review requirements and salary' },
  { icon: UploadCloud, label: 'Upload Resume', desc: 'Attach a PDF resume' },
  { icon: FileText, label: 'Submit', desc: 'Application enters the pipeline' },
];

export default function CandidateApplication() {
  return (
    <Section className="py-14 sm:py-20" style={{ background: T.bg }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left — application mockup */}
          <Mv variants={fadeUp} className="order-2 lg:order-1">
            <GlassCard className="p-6 sm:p-8 relative overflow-hidden">
              {/* Job card preview */}
              <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 mb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Open Position</span>
                    <h4 className="text-base font-bold text-slate-900 mt-1">Senior Frontend Engineer</h4>
                    <p className="text-xs text-slate-500 mt-1">React, TypeScript, Tailwind CSS</p>
                    <p className="text-xs text-slate-500 mt-0.5">₹12,00,000 - ₹18,00,000</p>
                  </div>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${T.primary}15`, color: T.primary }}
                  >
                    <FileText size={20} />
                  </div>
                </div>
              </div>

              {/* Upload zone mockup */}
              <div className="rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 p-5 text-center mb-4">
                <UploadCloud size={28} className="text-indigo-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">Resume_Priya_Sharma.pdf</p>
                <p className="text-[10px] text-slate-400 mt-0.5">PDF · 248 KB</p>
              </div>

              {/* Apply button */}
              <div
                className="w-full rounded-xl py-2.5 text-center text-sm font-semibold text-white shadow-md"
                style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}
              >
                Apply Now
              </div>

              {/* Confirmation */}
              <div
                className="mt-4 flex items-center gap-2 rounded-xl px-4 py-3 border"
                style={{ background: `${T.success}10`, borderColor: `${T.success}30` }}
              >
                <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                <div>
                  <span className="text-sm font-semibold text-emerald-700 block">Application Submitted</span>
                  <span className="text-[11px] text-emerald-600">Status: Pending</span>
                </div>
              </div>

              <IllustrativeLabel />
            </GlassCard>
          </Mv>

          {/* Right — copy */}
          <Mv variants={fadeUp} className="order-1 lg:order-2">
            <StepBadge number={2} />
            <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">
              Candidates Enter the Pipeline.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-lg">
              A candidate discovers an open role, reviews the job details, uploads their resume as a PDF,
              and submits the application. The submission enters the recruiter&rsquo;s workflow with an
              initial status of <strong>Pending</strong>.
            </p>

            {/* Mini flow */}
            <div className="mt-8 space-y-0">
              {FLOW_STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={step.label}>
                    <div className="flex items-center gap-3 py-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: `${T.primary}15`, color: T.primary }}
                      >
                        <Icon size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{step.label}</p>
                        <p className="text-xs text-slate-500">{step.desc}</p>
                      </div>
                    </div>
                    {i < FLOW_STEPS.length - 1 && (
                      <div className="flex items-center ml-4 py-0.5">
                        <ArrowRight size={12} className="text-slate-300 rotate-90" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Mv>
        </div>
      </div>
    </Section>
  );
}
