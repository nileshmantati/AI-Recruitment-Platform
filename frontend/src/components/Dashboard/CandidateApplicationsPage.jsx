import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FileText, Search, Filter, ChevronDown, Clock, Briefcase, IndianRupee, Sparkles, Eye } from 'lucide-react';
import { T } from '../../Js/theme';

const STATUS_MAP = {
    PENDING: { label: 'Pending', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    EVALUATED: { label: 'AI Evaluated', cls: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    SHORTLISTED: { label: 'Shortlisted', cls: 'bg-green-50 text-green-700 border-green-200' },
    REJECTED: { label: 'Rejected', cls: 'bg-red-50 text-red-700 border-red-200' },
    INTERVIEW_SCHEDULED: { label: 'Interview Scheduled', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    ERROR: { label: 'Error', cls: 'bg-gray-100 text-gray-700 border-gray-200' },
};

const STATUS_FILTERS = ['All', 'PENDING', 'EVALUATED', 'SHORTLISTED', 'REJECTED', 'INTERVIEW_SCHEDULED'];

const getTimeAgo = (date) => {
    if (!date) return 'Recently';
    const d = Math.floor((Date.now() - new Date(date)) / 864e5);
    if (d === 0) return 'Today'; if (d === 1) return 'Yesterday';
    if (d < 7) return `${d}d ago`; if (d < 30) return `${Math.floor(d / 7)}w ago`;
    return `${Math.floor(d / 30)}mo ago`;
};

const ScoreBadge = ({ score }) => {
    if (!score || score === 0) return null;
    const cls = score >= 85 ? 'bg-green-50 text-green-700 border-green-200' : score >= 65 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200';
    return <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${cls}`}><Sparkles size={11} />{score}% match</span>;
};

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };

const CandidateApplicationsPage = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [showFilter, setShowFilter] = useState(false);
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        (async () => {
            try { const res = await api.get('applications/my/'); setApplications(res.data); }
            catch { toast.error('Failed to load applications.'); }
            finally { setLoading(false); }
        })();
    }, []);

    const filtered = useMemo(() => {
        let r = [...applications];
        if (search) { const q = search.toLowerCase(); r = r.filter(a => a.job_details?.title?.toLowerCase().includes(q)); }
        if (statusFilter !== 'All') r = r.filter(a => a.status === statusFilter);
        return r;
    }, [applications, search, statusFilter]);

    const stats = useMemo(() => ({
        total: applications.length,
        shortlisted: applications.filter(a => a.status === 'SHORTLISTED').length,
        interviews: applications.filter(a => a.status === 'INTERVIEW_SCHEDULED').length,
        pending: applications.filter(a => a.status === 'PENDING').length,
    }), [applications]);

    if (loading) return (
        <div className="flex h-[80vh] items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-slate-200 border-t-indigo-600" />
        </div>
    );

    return (
        <motion.main variants={container} initial="hidden" animate="show"
            className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
            {/* Header */}
            <motion.div variants={fadeUp}>
                <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">My Applications</h1>
                <p className="mt-1 text-sm text-slate-500">Track the status of all your job applications</p>
            </motion.div>

            {/* Stats */}
            <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                    { label: 'Total Applied', value: stats.total, color: T.primary },
                    { label: 'Shortlisted', value: stats.shortlisted, color: '#22C55E' },
                    { label: 'Interviews', value: stats.interviews, color: '#6366F1' },
                    { label: 'Pending', value: stats.pending, color: '#F59E0B' },
                ].map(s => (
                    <div key={s.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                        <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
                        <p className="text-xs font-semibold text-slate-500">{s.label}</p>
                    </div>
                ))}
            </motion.div>

            {/* Search + Filter */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
                <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-400 transition-all">
                    <Search size={15} className="text-slate-400 shrink-0" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by job title..."
                        className="w-full bg-transparent text-sm outline-none text-slate-700 placeholder:text-slate-400" />
                </div>
                <div className="relative">
                    <button onClick={() => setShowFilter(p => !p)}
                        className="flex items-center gap-2 !rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 shadow-sm transition">
                        <Filter size={14} /> {statusFilter === 'All' ? 'All Status' : (STATUS_MAP[statusFilter]?.label || statusFilter)}
                        <ChevronDown size={13} className={`transition-transform ${showFilter ? 'rotate-180' : ''}`} />
                    </button>
                    {showFilter && (
                        <div className="absolute right-0 top-12 z-20 w-52 rounded-xl border border-slate-100 bg-white py-1 shadow-xl">
                            {STATUS_FILTERS.map(s => (
                                <button key={s} onClick={() => { setStatusFilter(s); setShowFilter(false); }}
                                    className={`w-full px-4 py-2 text-left text-sm transition ${statusFilter === s ? 'bg-indigo-50 font-semibold text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                                    {s === 'All' ? 'All Status' : (STATUS_MAP[s]?.label || s)}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Applications List */}
            <motion.div variants={container} className="space-y-3">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20 text-center">
                        <FileText size={40} className="mb-3 text-slate-300" />
                        <h3 className="font-bold text-slate-700">{search || statusFilter !== 'All' ? 'No matching applications' : 'No applications yet'}</h3>
                        <p className="mt-1 text-sm text-slate-500">Browse jobs and apply to get started</p>
                    </div>
                ) : filtered.map(app => {
                    const status = STATUS_MAP[app.status] || { label: app.status, cls: 'bg-slate-100 text-slate-700 border-slate-200' };
                    const isExpanded = expanded === app.id;
                    return (
                        <motion.div key={app.id} variants={fadeUp}
                            className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">
                                {/* Icon */}
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white"
                                    style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>
                                    <Briefcase size={20} />
                                </div>
                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <h4 className="font-bold text-slate-900 capitalize truncate">{app.job_details?.title || 'Job Title'}</h4>
                                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${status.cls}`}>{status.label}</span>
                                        <ScoreBadge score={app.resume_score} />
                                    </div>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                                        <span className="flex items-center gap-1"><Clock size={11} />Applied {getTimeAgo(app.applied_at)}</span>
                                        {app.job_details?.salary && <span className="flex items-center gap-1"><IndianRupee size={11} />{app.job_details.salary}</span>}
                                    </div>
                                </div>
                                {/* Actions */}
                                <div className="flex items-center gap-2 shrink-0">
                                    {app.ai_feedback && (
                                        <button onClick={() => setExpanded(isExpanded ? null : app.id)}
                                            className="flex items-center gap-1.5 !rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition">
                                            <Eye size={13} /> {isExpanded ? 'Hide' : 'AI Feedback'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* AI Feedback Drawer */}
                            {isExpanded && app.ai_feedback && (
                                <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 space-y-3">
                                    <div>
                                        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-600">✓ Strengths</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {app.ai_feedback.strengths?.map((s, i) => (
                                                <span key={i} className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-medium text-emerald-700">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                    {app.ai_feedback.missing_skills?.length > 0 && (
                                        <div>
                                            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-rose-600">⚠ To Improve</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {app.ai_feedback.missing_skills?.map((s, i) => (
                                                    <span key={i} className="rounded-lg bg-rose-50 border border-rose-200 px-2.5 py-1 text-xs font-medium text-rose-700">{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {app.ai_feedback.summary && <p className="text-sm text-slate-600 leading-relaxed">{app.ai_feedback.summary}</p>}
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </motion.div>
        </motion.main>
    );
};

export default CandidateApplicationsPage;
