import { Section, Mv, fadeUp, StepBadge, GlassCard, IllustrativeLabel } from './Shared';
import { T } from '../../Js/theme';
import { BriefcaseBusiness, CheckCircle, Type, AlignLeft, Wrench, IndianRupee } from 'lucide-react';

const FORM_FIELDS = [
  { label: 'Job Title', placeholder: 'Senior Frontend Engineer', icon: Type, value: 'Senior Frontend Engineer' },
  { label: 'Description', placeholder: 'We are looking for...', icon: AlignLeft, value: 'Build and maintain responsive web applications using React, collaborate with design and backend teams, and mentor junior developers.', textarea: true },
  { label: 'Required Skills', placeholder: 'React, TypeScript, CSS...', icon: Wrench, value: 'React, TypeScript, Tailwind CSS, REST APIs, Git' },
  { label: 'Salary', placeholder: '₹12,00,000 - ₹18,00,000', icon: IndianRupee, value: '₹12,00,000 - ₹18,00,000' },
];

export default function CreateJob() {
  return (
    <Section className="py-14 sm:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left — copy */}
          <Mv variants={fadeUp}>
            <StepBadge number={1} />
            <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">
              Start With the Role.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed max-w-lg">
              A recruiter creates a new job posting by defining the role title, writing a description,
              listing the required skills, and setting a salary range. These details become the foundation
              that the platform uses to evaluate and match candidates.
            </p>

            <div className="mt-6 space-y-3">
              {['Title, description, skills, and salary', 'Skills stored as structured data for AI matching', 'Job becomes visible to candidates immediately'].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </Mv>

          {/* Right — form mockup */}
          <Mv variants={fadeUp}>
            <GlassCard className="p-6 sm:p-8 relative overflow-hidden">
              {/* Top bar */}
              <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-200/60">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${T.primary}22, ${T.accent}22)`, color: T.primary }}
                >
                  <BriefcaseBusiness size={18} />
                </div>
                <span className="text-sm font-bold text-slate-800">Post a New Job</span>
              </div>

              {/* Form fields */}
              <div className="space-y-4">
                {FORM_FIELDS.map((field) => {
                  const Icon = field.icon;
                  return (
                    <div key={field.label}>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                        <Icon size={12} />
                        {field.label}
                      </label>
                      {field.textarea ? (
                        <div className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-xs text-slate-700 leading-relaxed min-h-[60px]">
                          {field.value}
                        </div>
                      ) : (
                        <div className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-xs text-slate-700">
                          {field.value}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Confirmation state overlay */}
              <div
                className="mt-6 flex items-center gap-2 rounded-xl px-4 py-3 border"
                style={{ background: `${T.success}10`, borderColor: `${T.success}30` }}
              >
                <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                <span className="text-sm font-semibold text-emerald-700">Job Requirements Saved</span>
              </div>

              <IllustrativeLabel />
            </GlassCard>
          </Mv>
        </div>
      </div>
    </Section>
  );
}
