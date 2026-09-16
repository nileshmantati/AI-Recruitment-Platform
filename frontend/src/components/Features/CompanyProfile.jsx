import { Mv, Section } from './Shared';
import { fadeUp } from './SharedData';
import Badge from '../../ui/Badge';
import { Building2, Check } from 'lucide-react';
import { T } from '../../Js/theme';

function CompanyProfileMock() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
      <div className="flex items-center gap-4 mb-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Building2 size={28} />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Acme Technologies</h3>
          <p className="text-xs text-slate-500">SaaS · 50-200 employees</p>
        </div>
      </div>

      {/* Completion progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold text-slate-600">Profile Completion</span>
          <span className="text-xs font-bold" style={{ color: T.primary }}>85%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full rounded-full" style={{ width: '85%', background: `linear-gradient(90deg, ${T.primary}, ${T.accent})` }} />
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-slate-100">
        {[
          { label: 'Basic Info', done: true },
          { label: 'About & Culture', done: true },
          { label: 'Branding', done: true },
          { label: 'AI Preferences', done: false },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-3 text-sm">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${s.done ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
              {s.done ? <Check size={12} /> : <span className="w-2 h-2 rounded-full bg-slate-300" />}
            </div>
            <span className={s.done ? 'text-slate-700 font-medium' : 'text-slate-400'}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CompanyProfile() {
  return (
    <Section className="py-12 sm:py-16 bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <Mv variants={fadeUp}>
            <Badge><Building2 size={14} className="mr-1" />COMPANY PROFILE</Badge>
            <h2 className="mt-6 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Give Your Company a Recruitment Identity
            </h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Set up your company profile with basic info, culture, branding, and AI screening preferences. Candidates see this when browsing your job listings.
            </p>
          </Mv>
          <Mv variants={fadeUp}>
            <CompanyProfileMock />
          </Mv>
        </div>
      </div>
    </Section>
  );
}
