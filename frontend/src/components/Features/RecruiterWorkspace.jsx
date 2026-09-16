import { Mv, Section } from './Shared';
import { fadeUp } from './SharedData';
import { BriefcaseBusiness, Users, ClipboardList, CalendarCheck } from 'lucide-react';
import { T } from '../../Js/theme';

function RecruiterBento() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-auto">
      {/* Job Management — tall */}
      <Mv variants={fadeUp} className="bg-white rounded-3xl p-8 border border-slate-200 hover:shadow-xl transition-all flex flex-col group lg:row-span-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700 mb-6 group-hover:scale-110 group-hover:text-indigo-600 transition-all">
          <BriefcaseBusiness size={24} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Job Management</h3>
        <p className="text-sm text-slate-600 mb-6">Create, edit, and manage job openings. Track which roles are active and which are still in draft.</p>
        <div className="mt-auto flex gap-3">
          <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-100 text-center">
            <span className="block text-3xl font-black text-slate-900">24</span>
            <span className="block text-xs font-semibold text-slate-500 uppercase mt-1">Active</span>
          </div>
          <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-100 text-center">
            <span className="block text-3xl font-black text-slate-400">8</span>
            <span className="block text-xs font-semibold text-slate-400 uppercase mt-1">Drafts</span>
          </div>
        </div>
      </Mv>

      {/* Candidate Management — wide */}
      <Mv variants={fadeUp} className="bg-white rounded-3xl p-8 border border-slate-200 hover:shadow-xl transition-all flex flex-col group lg:col-span-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700 mb-6 group-hover:scale-110 group-hover:text-indigo-600 transition-all">
          <Users size={24} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Candidate Management</h3>
        <p className="text-sm text-slate-600 mb-6">Browse, filter, and review candidate profiles. View parsed resumes, AI scores, and application history.</p>
        <div className="mt-auto bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center gap-4">
          <div className="flex -space-x-3">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${i}&backgroundColor=e2e8f0`} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
            <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-500">
              +1k
            </div>
          </div>
          <div className="ml-2">
            <span className="block text-lg font-black text-slate-900">1,248</span>
            <span className="block text-xs font-semibold text-slate-500 uppercase">Total Candidates</span>
          </div>
        </div>
      </Mv>

      {/* Application Tracking */}
      <Mv variants={fadeUp} className="bg-white rounded-3xl p-8 border border-slate-200 hover:shadow-xl transition-all flex flex-col group">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700 mb-6 group-hover:scale-110 group-hover:text-indigo-600 transition-all">
          <ClipboardList size={24} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Application Tracking</h3>
        <p className="text-sm text-slate-600 mb-4">Track every application's status as it moves through the pipeline.</p>
        <div className="mt-auto grid grid-cols-3 gap-2">
          {[
            { label: 'Apps', val: '856' },
            { label: 'Short', val: '142' },
            { label: 'Intv', val: '67' },
          ].map(s => (
            <div key={s.label} className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
              <span className="block text-lg font-black text-slate-900">{s.val}</span>
              <span className="block text-[10px] font-semibold text-slate-500 uppercase">{s.label}</span>
            </div>
          ))}
        </div>
      </Mv>

      {/* Interview Management */}
      <Mv variants={fadeUp} className="bg-white rounded-3xl p-8 border border-slate-200 hover:shadow-xl transition-all flex flex-col group">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700 mb-6 group-hover:scale-110 group-hover:text-indigo-600 transition-all">
          <CalendarCheck size={24} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Interview Management</h3>
        <p className="text-sm text-slate-600 mb-4">Schedule and manage interviews. Generate AI-powered questions.</p>
        <div className="mt-auto bg-slate-50 rounded-2xl p-4 border border-slate-100 shadow-sm relative">
          <div className="absolute top-0 left-0 w-1 h-full rounded-l-2xl" style={{ background: T.primary }} />
          <div className="ml-3">
            <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: T.primary }}>Upcoming</span>
            <h4 className="text-sm font-bold text-slate-900">John Doe</h4>
            <p className="text-xs text-slate-500 mb-2">Python Developer</p>
            <div className="flex justify-between items-center bg-white rounded-lg px-3 py-2 border border-slate-100">
              <span className="text-xs font-medium text-slate-600">Today · 5:00 PM</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-600">Scheduled</span>
            </div>
          </div>
        </div>
      </Mv>
    </div>
  );
}

export default function RecruiterWorkspace() {
  return (
    <Section className="py-16 sm:py-24 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Mv variants={fadeUp} className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Everything a Recruiter Needs, In One Workspace
          </h2>
        </Mv>
        <RecruiterBento />
      </div>
    </Section>
  );
}
