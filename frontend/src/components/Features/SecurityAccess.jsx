import { Mv, Section } from './Shared';
import { fadeUp } from './SharedData';
import { LockKeyhole, Users, ShieldCheck } from 'lucide-react';

export default function SecurityAccess() {
  return (
    <Section className="py-12 sm:py-16 bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Mv variants={fadeUp} className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Built Around Controlled Access
          </h2>
        </Mv>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: LockKeyhole, title: 'JWT Authentication', desc: 'Token-based authentication secures every API request between the client and server.' },
            { icon: Users, title: 'Role-Based Experience', desc: 'Recruiters and candidates see separate dashboards, routes, and data scoped to their role.' },
            { icon: ShieldCheck, title: 'Protected Routes', desc: 'Dashboard and management routes require authentication. Unauthorized access redirects to login.' },
          ].map((f, i) => (
            <Mv key={i} variants={fadeUp} className="bg-white rounded-2xl p-6 border border-slate-200 text-center hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700 mx-auto mb-4">
                <f.icon size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-600">{f.desc}</p>
            </Mv>
          ))}
        </div>
      </div>
    </Section>
  );
}
