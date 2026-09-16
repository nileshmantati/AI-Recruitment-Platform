import { Mv, Section } from './Shared';
import { fadeUp } from './SharedData';
import Badge from '../../ui/Badge';
import { ClipboardList } from 'lucide-react';

function WorkflowTimeline() {
  const steps = [
    { status: 'PENDING', label: 'Application', desc: 'Candidate submits resume and applies to a job listing.', color: '#64748B' },
    { status: 'EVALUATED', label: 'AI Evaluation', desc: 'System parses the resume, scores skills, and generates an evaluation.', color: '#0EA5E9' },
    { status: 'SHORTLISTED', label: 'Shortlist', desc: 'Recruiter reviews AI evaluation and shortlists the candidate.', color: '#10B981' },
    { status: 'INTERVIEW_SCHEDULED', label: 'Interview', desc: 'Interview is scheduled. AI generates relevant questions.', color: '#6366F1' },
    { status: 'SELECTED', label: 'Decision', desc: 'Recruiter makes the final hiring decision based on all collected data.', color: '#F59E0B' },
  ];

  return (
    <div className="relative max-w-3xl mx-auto">
      {/* Connecting line */}
      <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 bg-slate-200" />

      <div className="space-y-8">
        {steps.map((s, i) => (
          <Mv
            key={s.status}
            variants={{
              hidden: { opacity: 0, x: -20 },
              show: { opacity: 1, x: 0, transition: { delay: i * 0.12, duration: 0.4 } },
            }}
            className="relative flex gap-6 sm:gap-8"
          >
            {/* Circle */}
            <div
              className="relative z-10 flex h-12 w-12 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-full text-white text-sm sm:text-base font-bold shadow-lg"
              style={{ background: s.color }}
            >
              {i + 1}
            </div>
            {/* Content */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm flex-1 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">{s.label}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border" style={{ color: s.color, borderColor: `${s.color}40`, background: `${s.color}10` }}>
                  {s.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm text-slate-600">{s.desc}</p>
            </div>
          </Mv>
        ))}
      </div>
    </div>
  );
}

export default function ConnectedWorkflow() {
  return (
    <Section className="py-16 sm:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Mv variants={fadeUp} className="text-center max-w-3xl mx-auto mb-16">
          <Badge><ClipboardList size={14} className="mr-1" />RECRUITMENT WORKFLOW</Badge>
          <h2 className="mt-6 text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            One Candidate. One Connected Journey.
          </h2>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">
            Every application moves through a tracked pipeline — from submission to final decision. Each stage maps to a real status in the system.
          </p>
        </Mv>
        <WorkflowTimeline />
      </div>
    </Section>
  );
}
