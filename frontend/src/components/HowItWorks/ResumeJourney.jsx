import { Section, Mv, fadeUp, GlassCard } from './Shared';
import { T } from '../../Js/theme';
import { UploadCloud, ScanSearch, Sparkles, Target, Lightbulb, ArrowRight } from 'lucide-react';

const MICRO_STEPS = [
  {
    icon: UploadCloud,
    label: 'Upload',
    desc: 'Candidate submits a PDF resume with their application.',
  },
  {
    icon: ScanSearch,
    label: 'Text Extraction',
    desc: 'The platform reads the document and extracts all text content.',
  },
  {
    icon: Sparkles,
    label: 'Skill & Experience Analysis',
    desc: 'AI identifies skills, experience, and professional background from the extracted text.',
  },
  {
    icon: Target,
    label: 'Job Matching',
    desc: 'The candidate profile is compared against the job\'s required skills and description.',
  },
  {
    icon: Lightbulb,
    label: 'Recruiter Insights',
    desc: 'A structured summary with match score, strengths, and gaps is presented for review.',
  },
];

export default function ResumeJourney() {
  return (
    <Section className="py-14 sm:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Mv variants={fadeUp} className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">
            What Happens After a Resume Is Uploaded?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            A plain-language look at the five steps between a candidate&rsquo;s resume upload and
            the recruiter seeing a structured profile.
          </p>
        </Mv>

        {/* Large Desktop (1024px+): horizontal 5-step micro-flow */}
        <Mv variants={fadeUp} className="hidden lg:block">
          <GlassCard className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-2">
              {MICRO_STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={step.label} className="flex items-start gap-3 flex-1">
                    <div className="flex flex-col items-center text-center flex-1">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-xs border border-slate-200/60"
                        style={{ background: `${T.primary}10`, color: T.primary }}
                      >
                        <Icon size={22} />
                      </div>
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <p className="text-xs font-bold text-slate-800 mb-1">{step.label}</p>
                      <p className="text-[11px] text-slate-500 leading-snug max-w-[150px]">{step.desc}</p>
                    </div>
                    {i < MICRO_STEPS.length - 1 && (
                      <div className="flex items-center pt-5 shrink-0">
                        <ArrowRight size={16} className="text-slate-300" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </Mv>

        {/* Tablet / Medium Screens (640px - 1023px): 3-column + 2-column grid */}
        <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 gap-4 lg:hidden">
          {MICRO_STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <Mv key={step.label} variants={fadeUp}>
                <GlassCard className="p-4 h-full flex flex-col items-center text-center">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-2.5 shadow-xs border border-slate-200/60"
                    style={{ background: `${T.primary}10`, color: T.primary }}
                  >
                    <Icon size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-0.5">
                    Step {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-slate-800 mb-1">{step.label}</p>
                  <p className="text-[11px] text-slate-500 leading-snug">{step.desc}</p>
                </GlassCard>
              </Mv>
            );
          })}
        </div>

        {/* Mobile (<640px): self-contained vertical timeline (zero overlap, centered line) */}
        <div className="sm:hidden flex flex-col">
          {MICRO_STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <Mv key={step.label} variants={fadeUp} className="flex items-start gap-3">
                {/* Centered line & icon column */}
                <div className="flex flex-col items-center shrink-0 self-stretch">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shadow-xs border border-slate-200/80 bg-white shrink-0 z-10"
                    style={{ color: T.primary }}
                  >
                    <Icon size={16} />
                  </div>
                  {i < MICRO_STEPS.length - 1 && (
                    <div className="w-0.5 flex-1 my-1 bg-gradient-to-b from-indigo-300 via-purple-200 to-cyan-200 rounded-full" />
                  )}
                </div>

                {/* Content card */}
                <GlassCard className="p-3 flex-1 mb-2.5">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                    Step {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">{step.label}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{step.desc}</p>
                </GlassCard>
              </Mv>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
