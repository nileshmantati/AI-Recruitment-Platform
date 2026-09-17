import { useRef, useEffect, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Section, Mv, fadeUp, StepBadge, GlassCard, IllustrativeLabel } from './Shared';
import { T } from '../../Js/theme';
import { ChartNoAxesCombined, Users, FileText, UserCheck, CalendarCheck, ArrowRight } from 'lucide-react';

const CHART_DATA = [
  { name: 'Week 1', applications: 12 },
  { name: 'Week 2', applications: 28 },
  { name: 'Week 3', applications: 22 },
  { name: 'Week 4', applications: 35 },
  { name: 'Week 5', applications: 42 },
  { name: 'Week 6', applications: 58 },
];

const METRICS = [
  { icon: FileText, label: 'Total Applications', value: 156, color: T.primary },
  { icon: Users, label: 'AI Evaluated', value: 142, color: T.secondary },
  { icon: UserCheck, label: 'Shortlisted', value: 34, color: T.success },
  { icon: CalendarCheck, label: 'Interviews', value: 18, color: T.accent },
];

const FUNNEL = [
  { label: 'Applied', count: 156, width: '100%', color: '#64748B' },
  { label: 'Evaluated', count: 142, width: '91%', color: '#0EA5E9' },
  { label: 'Shortlisted', count: 34, width: '22%', color: '#10B981' },
  { label: 'Interview', count: 18, width: '12%', color: '#6366F1' },
];

/* ── Simple counter ── */
const Counter = ({ end }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const reduced = useReducedMotion();
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      const id = requestAnimationFrame(() => setV(end));
      return () => cancelAnimationFrame(id);
    }
    let raf;
    const dur = 1400;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      setV(Math.round((1 - Math.pow(1 - p, 3)) * end));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, end, reduced]);
  return <span ref={ref}>{v}</span>;
};

export default function Analytics() {
  return (
    <Section className="py-14 sm:py-20" style={{ background: T.bg }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Mv variants={fadeUp} className="text-center mb-10 sm:mb-14">
          <StepBadge number={8} />
          <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">
            See What Your Recruitment Pipeline Is Telling You.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Aggregated analytics show recruiters how candidates flow through each stage — from initial
            application volume to interview conversion — providing visibility into pipeline health.
          </p>
        </Mv>

        {/* Metric cards */}
        <Mv variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {METRICS.map((m) => {
            const Icon = m.icon;
            return (
              <GlassCard key={m.label} className="p-4 sm:p-5 text-center">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: `${m.color}15`, color: m.color }}
                >
                  <Icon size={20} />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                  <Counter end={m.value} />
                </p>
                <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
                  {m.label}
                </p>
              </GlassCard>
            );
          })}
        </Mv>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <Mv variants={fadeUp} className="lg:col-span-2">
            <GlassCard className="p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <ChartNoAxesCombined size={16} className="text-indigo-500" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Application Trend</span>
              </div>
              <div className="w-full h-48 sm:h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={CHART_DATA}>
                    <defs>
                      <linearGradient id="hiw-area-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={T.primary} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={T.primary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: '#1e293b', border: 'none', borderRadius: '12px',
                        fontSize: '12px', color: '#e2e8f0', padding: '8px 12px',
                      }}
                    />
                    <Area
                      type="monotone" dataKey="applications"
                      stroke={T.primary} strokeWidth={2}
                      fill="url(#hiw-area-grad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </Mv>

          {/* Funnel */}
          <Mv variants={fadeUp}>
            <GlassCard className="p-5 sm:p-6 h-full">
              <div className="flex items-center gap-2 mb-5">
                <ArrowRight size={16} className="text-indigo-500 rotate-90" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Pipeline Funnel</span>
              </div>
              <div className="space-y-3">
                {FUNNEL.map((f) => (
                  <div key={f.label}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700">{f.label}</span>
                      <span className="font-bold" style={{ color: f.color }}>{f.count}</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: f.width, background: f.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60">
                <IllustrativeLabel />
              </div>
            </GlassCard>
          </Mv>
        </div>
      </div>
    </Section>
  );
}
