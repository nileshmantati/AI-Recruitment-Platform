import { useRef } from 'react';
import { useInView } from 'framer-motion';
import { Mv, Section } from './Shared';
import { fadeUp, chartData } from './SharedData';
import Badge from '../../ui/Badge';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { ChartNoAxesCombined, Users, ClipboardList, TrendingUp, CheckCircle2 } from 'lucide-react';
import { T } from '../../Js/theme';

function AnalyticsKPIs() {
  const kpis = [
    { label: 'Candidates', value: '1,248', icon: Users, color: '#0EA5E9' },
    { label: 'Applications', value: '856', icon: ClipboardList, color: T.primary },
    { label: 'Shortlisted', value: '142', icon: TrendingUp, color: '#10B981' },
    { label: 'Interviews', value: '67', icon: CheckCircle2, color: '#F59E0B' },
  ];
  return (
    <div className="grid grid-cols-2 gap-4">
      {kpis.map((k, i) => (
        <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
          <div className="h-9 w-9 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform" style={{ background: `${k.color}15`, color: k.color }}>
            <k.icon size={18} />
          </div>
          <span className="block text-2xl font-black text-slate-900">{k.value}</span>
          <span className="block text-xs font-semibold text-slate-500 uppercase mt-1">{k.label}</span>
        </div>
      ))}
    </div>
  );
}

function AnalyticsChart() {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg">
      <h3 className="text-base font-bold text-slate-900 mb-6">Applications Over Time</h3>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="featColorApps" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={T.primary} stopOpacity={0.3} />
                <stop offset="95%" stopColor={T.primary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
            <RechartsTooltip
              contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: T.primary, fontWeight: 'bold' }}
            />
            <Area type="monotone" dataKey="applications" stroke={T.primary} strokeWidth={3} fillOpacity={1} fill="url(#featColorApps)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function FunnelVisual() {
  const stages = [
    { stage: 'Applications', count: 856, width: '100%', bg: '#1e293b' },
    { stage: 'AI Evaluated', count: 642, width: '85%', bg: T.primary },
    { stage: 'Shortlisted', count: 142, width: '50%', bg: '#6366f1' },
    { stage: 'Interview', count: 67, width: '30%', bg: '#818cf8' },
    { stage: 'Selected', count: 31, width: '15%', bg: '#10B981' },
  ];
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <div ref={ref} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg flex flex-col h-full">
      <h3 className="text-base font-bold text-slate-900 mb-6">Hiring Funnel</h3>
      <div className="flex-1 flex flex-col justify-between">
        {stages.map((s, i) => (
          <div key={i} className="w-full relative mb-4 last:mb-0">
            <div className="flex justify-between items-end mb-1 px-1">
              <span className="text-xs font-semibold text-slate-600">{s.stage}</span>
              <span className="text-sm font-bold text-slate-900">{s.count}</span>
            </div>
            <div className="h-7 w-full bg-slate-50 rounded-lg overflow-hidden flex justify-center border border-slate-100">
              <Mv
                className="h-full rounded-md"
                style={{ background: s.bg }}
                initial={{ width: 0 }}
                animate={{ width: inView ? s.width : 0 }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RecruitmentAnalytics() {
  return (
    <Section className="py-16 sm:py-24 bg-white border-y border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
          <Mv variants={fadeUp} className="max-w-xl">
            <Badge><ChartNoAxesCombined size={14} className="mr-1" />RECRUITMENT ANALYTICS</Badge>
            <h2 className="mt-6 text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              See What Your Recruitment Pipeline Is Telling You
            </h2>
            <p className="mt-4 text-base text-slate-600 leading-relaxed">
              Monitor candidate volume, application trends, shortlist rates, and interview counts. Track how candidates move through your pipeline over time.
            </p>
          </Mv>
          <Mv variants={fadeUp}>
            <AnalyticsKPIs />
          </Mv>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Mv variants={fadeUp} className="lg:col-span-2">
            <AnalyticsChart />
          </Mv>
          <Mv variants={fadeUp}>
            <FunnelVisual />
          </Mv>
        </div>
      </div>
    </Section>
  );
}
