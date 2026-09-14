import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Video, Clock, Search, Briefcase, CheckCircle, AlertCircle, User } from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { T } from '../../../Js/theme';
import { KpiCard } from '../../../ui/DashboardUI';

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD';

const TIPS = [
    { icon: '📋', tip: 'Research the company and role thoroughly before the interview.' },
    { icon: '🎤', tip: 'Practice answering common behavioral interview questions using STAR method.' },
    { icon: '⏰', tip: 'Test your audio/video setup 15 minutes before the scheduled time.' },
    { icon: '📝', tip: 'Prepare thoughtful questions to ask the interviewer.' },
    { icon: '💡', tip: 'Review your resume and be ready to discuss every point on it.' },
];

const CandidateInterviewsPage = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [now] = useState(() => Date.now());

    useEffect(() => {
        (async () => {
            try { const res = await api.get('applications/my/'); setApplications(res.data); }
            catch { toast.error('Failed to load interviews.'); }
            finally { setLoading(false); }
        })();
    }, []);

    const interviews = useMemo(() =>
        applications.filter(a => a.status === 'INTERVIEW_SCHEDULED'),
        [applications]
    );

    const filtered = useMemo(() => {
        if (!search) return interviews;
        const q = search.toLowerCase();
        return interviews.filter(a => a.job_details?.title?.toLowerCase().includes(q));
    }, [interviews, search]);

    const scoreColor = (s) => s >= 85 ? 'text-green-700 bg-green-50 border-green-200' : s >= 65 ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-red-700 bg-red-50 border-red-200';

    if (loading) {
        return (
            <div className="flex h-[85vh] w-full items-center justify-center bg-slate-50/50">
                <div className="flex flex-col items-center gap-4 text-center p-8 max-w-sm">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
                        <i className="bi bi-robot text-indigo-600 text-3xl"></i>
                    </div>
                    <div>
                        <h4 className="font-extrabold text-slate-800 text-lg">Loading Interview data...</h4>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <motion.main variants={container} initial="hidden" animate="show"
            className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
            {/* Header */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900">My Interviews</h1>
                    <p className="mt-1 text-sm sm:text-base text-slate-500">Track your scheduled interviews and prepare to ace them</p>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-sm sm:text-base font-bold text-indigo-700 shadow-sm">
                    <Video size={16} /> {interviews.length} scheduled
                </div>
            </motion.div>

            {/* Stats */}
            <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                    { label: 'Scheduled', value: interviews.length, color: '#6366F1', icon: Calendar },
                    { label: 'This Week', value: interviews.filter(a => { const d = Math.floor((new Date(a.updated_at) - now) / 864e5); return d >= 0 && d <= 7; }).length, color: '#F59E0B', icon: Clock },
                    { label: 'Completed', value: 0, color: '#22C55E', icon: CheckCircle },
                ].map((s, i) => <KpiCard key={i} icon={s.icon} label={s.label} value={s.value} color={s.color} />)}
            </motion.div>

            {/* Search */}
            {interviews.length > 0 && (
                <motion.div variants={fadeUp} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-400 transition-all">
                    <Search size={16} className="text-slate-400 shrink-0" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by job title..."
                        className="w-full bg-transparent text-sm sm:text-base outline-none text-slate-700 placeholder:text-slate-400" />
                </motion.div>
            )}

            {/* Interviews List */}
            <motion.div variants={container} className="space-y-4">
                {filtered.length === 0 ? (
                    <motion.div variants={fadeUp} className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: `${T.primary}10` }}>
                            <Calendar size={28} style={{ color: T.primary }} />
                        </div>
                        <h3 className="font-extrabold text-slate-800 text-lg sm:text-xl">{search ? 'No matching interviews' : 'No interviews scheduled yet'}</h3>
                        <p className="mt-2 max-w-sm text-sm sm:text-base text-slate-500">
                            {search ? 'Try a different search.' : 'When a recruiter shortlists you and schedules an interview, it will appear here.'}
                        </p>
                    </motion.div>
                ) : filtered.map(app => (
                    <motion.div key={app.id} variants={fadeUp}
                        className="group rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden hover:shadow-md hover:border-indigo-200 transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">
                            {/* Avatar */}
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white font-extrabold text-xl sm:text-2xl shadow-md"
                                style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>
                                {(app.job_details?.title || 'J')[0].toUpperCase()}
                            </div>
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h4 className="text-base sm:text-lg font-bold text-slate-900 capitalize truncate">{app.job_details?.title}</h4>
                                    <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs sm:text-sm font-bold text-indigo-700">
                                        <Video size={13} className="mr-1" /> Interview Scheduled
                                    </span>
                                    {app.resume_score > 0 && (
                                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs sm:text-sm font-bold ${scoreColor(app.resume_score)}`}>
                                            {app.resume_score}% match
                                        </span>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm text-slate-600 font-medium">
                                    <span className="flex items-center gap-1"><Calendar size={13} />Date: {formatDate(app.interview_date)}</span>
                                    <span className="flex items-center gap-1"><Clock size={13} />Time: TBD / Via Email</span>
                                    <span className="flex items-center gap-1"><User size={13} />Recruiter: {app.recruiter_name || 'Hiring Team'}</span>
                                </div>
                            </div>
                            {/* Mode badge */}
                            <div className="flex flex-col items-end gap-2 shrink-0">
                                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs sm:text-sm font-bold text-indigo-700">
                                    <Video size={13} /> Video Call
                                </span>
                            </div>
                        </div>
                        {/* Prep tip */}
                        <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 flex items-start gap-2">
                            <AlertCircle size={15} className="shrink-0 mt-0.5 text-amber-500" />
                            <p className="text-xs sm:text-sm text-slate-600">
                                <span className="font-semibold text-slate-800">Prep tip: </span>
                                {TIPS[Math.abs(app.id % TIPS.length)]?.tip}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Interview Tips */}
            <motion.div variants={fadeUp} className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4" style={{ background: `${T.primary}06` }}>
                    <Briefcase size={18} style={{ color: T.primary }} />
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-800">Interview Preparation Tips</h3>
                </div>
                <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
                    {TIPS.map((t, i) => (
                        <div key={i} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5">
                            <span className="text-xl sm:text-2xl">{t.icon}</span>
                            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">{t.tip}</p>
                        </div>
                    ))}
                </div>
            </motion.div>
        </motion.main>
    );
};

export default CandidateInterviewsPage;
