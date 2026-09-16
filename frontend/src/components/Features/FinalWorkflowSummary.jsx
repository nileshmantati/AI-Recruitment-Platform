import { Mv, Section } from './Shared';
import { fadeUp } from './SharedData';
import { FileText, Sparkles, Target, Brain, ClipboardList, CalendarCheck, ArrowRight } from 'lucide-react';
import PrimaryButton from '../../components/PrimaryButton';
import { T } from '../../Js/theme';

function FinalWorkflowSteps() {
  const steps = [
    { icon: FileText, label: 'Upload' },
    { icon: Sparkles, label: 'Analyze' },
    { icon: Target, label: 'Match' },
    { icon: Brain, label: 'Evaluate' },
    { icon: ClipboardList, label: 'Manage' },
    { icon: CalendarCheck, label: 'Interview' },
  ];
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
      {steps.map((s, i) => (
        <div key={s.label} className="flex items-center gap-2 sm:gap-4">
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl text-white shadow-lg"
              style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}
            >
              <s.icon size={24} />
            </div>
            <span className="text-xs font-bold text-slate-700">{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <ArrowRight size={16} className="text-slate-300 mb-6" />
          )}
        </div>
      ))}
    </div>
  );
}

export default function FinalWorkflowSummary() {
  return (
    <Section className="py-16 sm:py-24 bg-white border-t border-slate-200">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
        <Mv variants={fadeUp}>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            From Resume Upload to Recruitment Decision
          </h2>
        </Mv>
        <Mv variants={fadeUp} className="mt-12">
          <FinalWorkflowSteps />
        </Mv>
        <Mv variants={fadeUp}>
          <p className="mt-10 text-base text-slate-600">
            One platform. One connected recruitment workflow.
          </p>
        </Mv>
        <Mv variants={fadeUp} className="mt-6">
          <PrimaryButton
            className="rounded-xl px-6 py-3 text-sm"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Explore Platform <ArrowRight size={16} />
          </PrimaryButton>
        </Mv>
      </div>
    </Section>
  );
}
