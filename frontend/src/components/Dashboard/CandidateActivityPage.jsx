import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, FileText, CheckCircle, Clock, TrendingUp, Sparkles, BarChart3, Calendar } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { T } from '../../Js/theme';

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };

const STATUS_CONFIG = {
    PENDING: { label: 'Applied', color: '#F59E0B', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock },
    EVALUATED: { label: 'AI Evaluated', color: '#06B6D4', bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', icon: Sparkles },
    SHORTLISTED: { label: 'Shortlisted', color: '#22C55E', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle },
    REJECTED: { label: 'Rejected', color: '#EF4444', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: TrendingUp },
    INTERVIEW_SCHEDULED: { label: 'Interview', color: '#6366F1', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', icon: Calendar },
};

const getTimeAgo = (date) => {
    if (!date) return '';
    const d = Math.floor((Date.now() - new Date(date)) / 864e5);
    if (d === 0) return 'Today'; if (d === 1) return 'Yesterday';
    if (d < 7) return `${d}d ago`; if (d < 30) return `${Math.floor(d / 7)}w ago`;
    return new Date(date).toLocaleDateString();
};

const KpiCard = ({ icon: Icon, label, value, color }) => (
    <motion.div variants={fadeUp} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${color}15` }}>
                <Icon size={18} style={{ color }} />
            </div>
            <div>
                <p className="text-2xl font-extrabold text-slate-900">{value}</p>
                <p className="text-xs font-semibold text-slate-500">{label}</p>
            </div>
        </div>
    </motion.div>
);

const CandidateActivityPage = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try { const res = await api.get('applications/my/'); setApplications(res.data); }
            catch { toast.error('Failed to load activity.'); }
            finally { setLoading(false); }
        })();
    }, []);

    const stats = useMemo(() => ({
        total: applications.length,
        evaluated: applications.filter(a => ['EVALUATED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED'].includes(a.status)).length,
        shortlisted: applications.filter(a => a.status === 'SHORTLISTED').length,
        interviews: applications.filter(a => a.status === 'INTERVIEW_SCHEDULED').length,
        avgScore: applications.length
            ? Math.round(applications.reduce((s, a) => s + (a.resume_score || 0), 0) / applications.length)
            : 0,
    }), [applications]);

    // Build timeline events from applications
    const timeline = useMemo(() => {
        const events = [];
        applications.forEach(app => {
            events.push({ id: `apply-${app.id}`, date: app.applied_at, type: 'PENDING', jobTitle: app.job_details?.title, note: 'You applied for this position' });
            if (app.status !== 'PENDING') {
                events.push({ id: `status-${app.id}`, date: app.updated_at || app.applied_at, type: app.status, jobTitle: app.job_details?.title, score: app.resume_score, note: STATUS_CONFIG[app.status]?.label || app.status });
            }
        });
        return events.sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [applications]);

    if (loading) return (
        <div className="flex h-[80vh] items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-slate-200 border-t-indigo-600" />
        </div>
    );

    return (
        <motion.main variants={container} initial="hidden" animate="show"
            className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
            {/* Header */}
            <motion.div variants={fadeUp}>
                <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Activity</h1>
                <p className="mt-1 text-sm text-slate-500">Your complete application journey and achievements</p>
            </motion.div>

            {/* KPI Grid */}
            <motion.div variants={container} className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                <KpiCard icon={FileText} label="Total Applied" value={stats.total} color={T.primary} />
                <KpiCard icon={Sparkles} label="AI Evaluated" value={stats.evaluated} color="#06B6D4" />
                <KpiCard icon={CheckCircle} label="Shortlisted" value={stats.shortlisted} color="#22C55E" />
                <KpiCard icon={Calendar} label="Interviews" value={stats.interviews} color="#6366F1" />
                <KpiCard icon={BarChart3} label="Avg Score" value={`${stats.avgScore}%`} color="#F59E0B" />
            </motion.div>

            {/* Score distribution bar */}
            {applications.length > 0 && (
                <motion.div variants={fadeUp} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 font-bold text-slate-800 text-sm">Application Status Breakdown</h3>
                    <div className="space-y-3">
                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                            const count = applications.filter(a => a.status === key).length;
                            const pct = applications.length ? Math.round((count / applications.length) * 100) : 0;
                            return (
                                <div key={key} className="flex items-center gap-3">
                                    <span className="w-28 shrink-0 text-xs font-semibold text-slate-500">{cfg.label}</span>
                                    <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-700"
                                            style={{ width: `${pct}%`, background: cfg.color }} />
                                    </div>
                                    <span className="w-8 shrink-0 text-right text-xs font-bold text-slate-700">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* Timeline */}
            <motion.div variants={fadeUp} className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4" style={{ background: `${T.primary}06` }}>
                    <Activity size={16} style={{ color: T.primary }} />
                    <h3 className="font-bold text-slate-800">Activity Timeline</h3>
                    <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-500">{timeline.length} events</span>
                </div>

                {timeline.length === 0 ? (
                    <div className="flex flex-col items-center py-16 text-center">
                        <Activity size={36} className="mb-3 text-slate-300" />
                        <h3 className="font-bold text-slate-700">No activity yet</h3>
                        <p className="mt-1 text-sm text-slate-400">Apply to jobs to see your activity here</p>
                    </div>
                ) : (
                    <div className="relative px-6 py-4">
                        <div className="absolute left-10 top-4 bottom-4 w-px bg-slate-100" />
                        <div className="space-y-5">
                            {timeline.map(ev => {
                                const cfg = STATUS_CONFIG[ev.type] || STATUS_CONFIG.PENDING;
                                const Icon = cfg.icon;
                                return (
                                    <div key={ev.id} className="relative flex items-start gap-4">
                                        <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${cfg.bg} ${cfg.border}`}>
                                            <Icon size={14} className={cfg.text} />
                                        </div>
                                        <div className="flex-1 min-w-0 pt-0.5">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                                                    {cfg.label}
                                                </span>
                                                {ev.score > 0 && (
                                                    <span className="text-[11px] font-bold text-slate-500">{ev.score}% match</span>
                                                )}
                                            </div>
                                            <p className="mt-0.5 text-sm font-semibold text-slate-700 truncate capitalize">{ev.jobTitle || 'Job Position'}</p>
                                            <p className="text-xs text-slate-400">{ev.note} · {getTimeAgo(ev.date)}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </motion.div>
        </motion.main>
    );
};

export default CandidateActivityPage;
