import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { T } from '../../../Js/theme';
import {
    FileText, Search, Filter, ChevronDown, Eye, Briefcase, Calendar,
    ArrowLeft, CheckCircle, XCircle, Sparkles, MapPin, IndianRupee
} from 'lucide-react';

const STATUS_OPTIONS = ['All', 'PENDING', 'EVALUATED', 'SHORTLISTED', 'REJECTED', 'INTERVIEW_SCHEDULED'];

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const getTimeAgo = (date) => {
    if (!date) return 'Recently';
    const diff = Date.now() - new Date(date).getTime();
    const d = Math.floor(diff / 864e5);
    if (d === 0) return 'Today';
    if (d === 1) return 'Yesterday';
    if (d < 7) return `${d}d ago`;
    if (d < 30) return `${Math.floor(d / 7)}w ago`;
    return `${Math.floor(d / 30)}mo ago`;
};

const getScoreColor = (score) => {
    if (!score || score === 0) return 'text-slate-500 bg-slate-50 border-slate-200';
    if (score >= 85) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 65) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
};

const getStatusStyle = (status) => {
    const map = {
        PENDING: 'bg-slate-100 text-slate-700 border-slate-200',
        EVALUATED: 'bg-cyan-50 text-cyan-700 border-cyan-200',
        SHORTLISTED: 'bg-green-50 text-green-700 border-green-200',
        REJECTED: 'bg-red-50 text-red-700 border-red-200',
        INTERVIEW_SCHEDULED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    };
    return map[status] || 'bg-slate-100 text-slate-700 border-slate-200';
};

const formatStatus = (status) => {
    if (!status) return '';
    return status.replace('_', ' ');
};

const CandidateApplicationDetails = ({ app, setSelectedApp }) => {
    return (
        <motion.main
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex-1 pb-12"
        >
            <div className="mx-auto max-w-4xl space-y-6 p-6 lg:p-8">
                <button onClick={() => setSelectedApp(null)}
                    className="flex items-center px-3 py-2 border border-slate-200 bg-white outline-none rounded-xl! shadow-sm cursor-pointer gap-2 text-sm sm:text-base font-semibold text-slate-600 hover:bg-slate-50 transition">
                    <ArrowLeft size={18} /> Back to Applications
                </button>

                <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                    <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${T.primary}, ${T.accent})` }} />

                    <div className="p-6 lg:p-8">
                        {/* Application Header */}
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8">
                            <div className="flex items-start gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-white shadow-md"
                                    style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>
                                    <Briefcase size={24} />
                                </div>
                                <div>
                                    <h3 className="text-2xl sm:text-3xl font-extrabold capitalize text-slate-900 tracking-tight">
                                        {app.job_details?.title || 'Job Application'}
                                    </h3>
                                    <p className="text-sm sm:text-base font-medium text-slate-500 flex items-center gap-2 mt-1">
                                        {app.job_details?.company && (
                                            <span className="font-semibold text-slate-700">{app.job_details.company}</span>
                                        )}
                                        {app.job_details?.location && (
                                            <span className="flex items-center gap-1 text-slate-400">
                                                <MapPin size={15} /> {app.job_details.location}
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className={`px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-full border uppercase tracking-wider ${getStatusStyle(app.status)}`}>
                                    {formatStatus(app.status)}
                                </span>
                            </div>
                        </div>

                        {/* Overview Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                            <div className="rounded-xl bg-slate-50 px-4 py-3 border border-slate-100">
                                <p className="text-xs sm:text-sm mb-1 font-bold uppercase tracking-wider text-slate-400">AI Score Match</p>
                                <span className={`inline-flex items-center gap-1 text-sm sm:text-base font-black px-2.5 py-1 rounded-lg border ${getScoreColor(app.resume_score)}`}>
                                    <Sparkles size={14} />
                                    {app.resume_score ? `${app.resume_score}%` : 'N/A'}
                                </span>
                            </div>
                            <div className="rounded-xl bg-slate-50 px-4 py-3 border border-slate-100">
                                <p className="text-xs sm:text-sm mb-1 font-bold uppercase tracking-wider text-slate-400">Applied On</p>
                                <p className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                                    <Calendar size={15} className="text-slate-400" /> {getTimeAgo(app.applied_at)}
                                </p>
                            </div>
                            {app.job_details?.salary && (
                                <div className="rounded-xl bg-slate-50 px-4 py-3 border border-slate-100">
                                    <p className="text-xs sm:text-sm mb-1 font-bold uppercase tracking-wider text-slate-400">Salary</p>
                                    <p className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                                        <IndianRupee size={15} className="text-slate-400" /> {app.job_details.salary}
                                    </p>
                                </div>
                            )}
                            <div className="rounded-xl bg-slate-50 px-4 py-3 border border-slate-100">
                                <p className="text-xs sm:text-sm mb-1 font-bold uppercase tracking-wider text-slate-400">Status</p>
                                <p className="text-sm sm:text-base font-bold text-slate-800 capitalize mt-0.5">
                                    {formatStatus(app.status)}
                                </p>
                            </div>
                        </div>

                        {/* AI Feedback Analysis */}
                        <div className="mb-8">
                            <h4 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                                <Sparkles size={22} className="text-indigo-500" /> AI Feedback & Insights
                            </h4>
                            {app.ai_feedback ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-5">
                                        <h5 className="text-sm font-extrabold uppercase tracking-wider text-emerald-600 mb-3 flex items-center gap-1.5">
                                            <CheckCircle size={18} className="text-emerald-500" /> Key Strengths
                                        </h5>
                                        <ul className="space-y-2 text-sm sm:text-base text-slate-700">
                                            {(app.ai_feedback.strengths || []).map((s, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                                                    <span>{s}</span>
                                                </li>
                                            ))}
                                            {!app.ai_feedback.strengths?.length && (
                                                <li className="text-slate-400 text-sm italic">No specific strengths highlighted.</li>
                                            )}
                                        </ul>
                                    </div>
                                    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-5">
                                        <h5 className="text-sm font-extrabold uppercase tracking-wider text-amber-600 mb-3 flex items-center gap-1.5">
                                            <XCircle size={18} className="text-amber-500" /> Skill Gaps & Improvements
                                        </h5>
                                        <ul className="space-y-2 text-sm sm:text-base text-slate-700">
                                            {(app.ai_feedback.missing_skills || app.ai_feedback.weaknesses || []).map((w, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                                                    <span>{w}</span>
                                                </li>
                                            ))}
                                            {!app.ai_feedback.missing_skills?.length && !app.ai_feedback.weaknesses?.length && (
                                                <li className="text-slate-400 text-sm italic">No significant skill gaps found.</li>
                                            )}
                                        </ul>
                                    </div>
                                    {app.ai_feedback.summary && (
                                        <div className="md:col-span-2 rounded-xl border border-slate-100 bg-indigo-50/40 p-5">
                                            <p className="text-sm font-extrabold uppercase tracking-wider text-indigo-600 mb-2">AI Assessment Summary</p>
                                            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">{app.ai_feedback.summary}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="rounded-xl bg-slate-50 border border-slate-100 p-6 text-center text-sm sm:text-base text-slate-500">
                                    AI analysis is currently being processed for this application.
                                </div>
                            )}
                        </div>

                        {/* Job Overview */}
                        {app.job_details?.description && (
                            <div className="border-t border-slate-100 pt-6">
                                <h4 className="text-lg font-extrabold text-slate-800 mb-2">Job Description Summary</h4>
                                <p className="text-sm sm:text-base text-slate-600 line-clamp-4 leading-relaxed">
                                    {app.job_details.description}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.main>
    );
};

const CandidateApplicationsPage = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);

    const fetchApplications = async () => {
        try {
            const res = await api.get('applications/my/');
            setApplications(res.data);
        } catch (err) {
            console.error('Failed to load applications', err);
            toast.error('Failed to load applications.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const filteredApplications = useMemo(() => {
        let result = [...applications];
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(a =>
                a.job_details?.title?.toLowerCase().includes(q) ||
                a.job_details?.company?.toLowerCase().includes(q)
            );
        }
        if (statusFilter !== 'All') {
            result = result.filter(a => a.status === statusFilter);
        }
        return result;
    }, [applications, searchQuery, statusFilter]);

    if (loading) {
        return (
            <div className="flex h-[85vh] w-full items-center justify-center bg-slate-50/50">
                <div className="flex flex-col items-center gap-4 text-center p-8 max-w-sm">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
                        <i className="bi bi-robot text-indigo-600 text-3xl"></i>
                    </div>
                    <div>
                        <h4 className="font-extrabold text-slate-800 text-lg">Loading applications...</h4>
                    </div>
                </div>
            </div>
        );
    }

    if (selectedApp) {
        return (
            <CandidateApplicationDetails
                app={selectedApp}
                setSelectedApp={setSelectedApp}
            />
        );
    }

    return (
        <motion.main
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex-1 pb-12"
        >
            <div className="space-y-6 p-6 lg:p-8">
                {/* Header */}
                <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="flex items-center gap-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">
                            <FileText className="text-indigo-500" size={28} />
                            My Applications
                        </h2>
                        <p className="mt-1 text-sm sm:text-base text-slate-500">Track the status of all your job applications.</p>
                    </div>
                </motion.div>

                {/* Filter Bar */}
                <motion.div variants={itemVariants} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2.5 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-indigo-400 transition-all sm:w-80 shadow-sm w-full">
                        <Search size={18} className="text-slate-400 shrink-0" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search by job title or company..."
                            className="w-full bg-transparent text-sm sm:text-base outline-none placeholder:text-slate-400 text-slate-700"
                        />
                    </div>
                    <div className="flex w-full justify-between gap-2 sm:w-auto sm:justify-end">
                        <div className="relative flex-1 sm:flex-none">
                            <button
                                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                className="flex w-full items-center justify-between sm:justify-center gap-2 rounded-lg! border border-slate-200 bg-white px-4 py-2.5 text-sm sm:text-base font-semibold text-slate-600 hover:bg-slate-50 transition shadow-sm"
                            >
                                <span className="flex items-center gap-1.5">
                                    <Filter size={16} /> {statusFilter === 'All' ? 'All Status' : formatStatus(statusFilter)}
                                </span>
                                <ChevronDown size={16} className={`transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            {showStatusDropdown && (
                                <div className="absolute left-0 sm:right-0 sm:left-auto top-12 z-20 w-48 overflow-hidden rounded-xl border border-slate-100 bg-white py-1 shadow-xl">
                                    {STATUS_OPTIONS.map(opt => (
                                        <button
                                            key={opt}
                                            onClick={() => { setStatusFilter(opt); setShowStatusDropdown(false); }}
                                            className={`w-full px-4 py-2 text-left text-sm sm:text-base transition ${statusFilter === opt ? 'bg-indigo-50 font-bold text-indigo-600' : 'text-slate-600 hover:bg-slate-50 font-medium'}`}
                                        >
                                            {opt === 'All' ? 'All Status' : formatStatus(opt)}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                <motion.p variants={itemVariants} className="text-sm sm:text-base font-medium text-slate-500">
                    Showing <span className="text-slate-800 font-bold">{filteredApplications.length}</span> of <span className="text-slate-800 font-bold">{applications.length}</span> applications
                </motion.p>

                {filteredApplications.length > 0 ? (
                    <>
                        {/* Mobile View (< md) */}
                        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 md:hidden">
                            {filteredApplications.map((app) => (
                                <div key={app.id} className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
                                                style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>
                                                <Briefcase size={18} />
                                            </div>
                                            <div>
                                                <h3 className="text-base sm:text-lg font-bold capitalize text-slate-900 leading-tight">{app.job_details?.title || 'Job Application'}</h3>
                                                <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5 truncate max-w-[180px]">{app.job_details?.company || 'Company'}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-1 text-xs sm:text-sm font-bold rounded border uppercase ${getStatusStyle(app.status)}`}>
                                            {formatStatus(app.status)}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs sm:text-sm">
                                            <span className="text-slate-500 font-medium">Match Score</span>
                                            <span className={`font-bold px-1.5 rounded ${getScoreColor(app.resume_score)}`}>{app.resume_score ? `${app.resume_score}%` : 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs sm:text-sm">
                                            <span className="text-slate-500 font-medium">Applied</span>
                                            <span className="font-semibold text-slate-700">{getTimeAgo(app.applied_at)}</span>
                                        </div>
                                    </div>

                                    <div className="mt-2 pt-2 border-t border-slate-100">
                                        <button
                                            onClick={() => setSelectedApp(app)}
                                            className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-indigo-50 py-2.5 text-xs sm:text-sm font-bold text-indigo-600 transition hover:bg-indigo-100"
                                        >
                                            <Eye size={16} /> Review Application
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </motion.div>

                        {/* Desktop View (md+) */}
                        <motion.div variants={itemVariants} className="hidden md:block overflow-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
                            <table className="w-full text-left text-sm sm:text-base">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/80">
                                        <th className="px-5 py-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">Job Position</th>
                                        <th className="px-5 py-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">Company</th>
                                        <th className="px-5 py-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 text-center">Match Score</th>
                                        <th className="px-5 py-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 text-center">Status</th>
                                        <th className="px-5 py-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500">Applied On</th>
                                        <th className="px-5 py-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredApplications.map((app, idx) => (
                                        <tr key={app.id} className={`border-b border-slate-50 transition hover:bg-slate-50/60 ${idx % 2 === 0 ? '' : 'bg-slate-25'}`}>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white"
                                                        style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>
                                                        <Briefcase size={16} />
                                                    </div>
                                                    <span className="text-sm sm:text-base font-bold capitalize text-slate-800">{app.job_details?.title || 'Job Application'}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-sm sm:text-base font-semibold text-slate-600">{app.job_details?.company || 'N/A'}</span>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className={`inline-flex px-2.5 py-1 rounded-md border font-bold text-xs sm:text-sm ${getScoreColor(app.resume_score)}`}>
                                                    {app.resume_score ? `${app.resume_score}%` : 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full border text-xs sm:text-sm font-bold uppercase tracking-wider ${getStatusStyle(app.status)}`}>
                                                    {formatStatus(app.status)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-sm sm:text-base font-medium text-slate-500">
                                                {getTimeAgo(app.applied_at)}
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <button
                                                    onClick={() => setSelectedApp(app)}
                                                    title="Review Application"
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg! bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition"
                                                >
                                                    <Eye size={17} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </motion.div>
                    </>
                ) : (
                    <motion.div variants={itemVariants} className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20 px-6 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: `${T.primary}10` }}>
                            <FileText size={28} style={{ color: T.primary }} />
                        </div>
                        <h3 className="text-lg sm:text-xl font-extrabold text-slate-800">
                            {searchQuery || statusFilter !== 'All' ? 'No matching applications found' : 'No applications submitted yet'}
                        </h3>
                        <p className="mt-2 max-w-sm text-sm sm:text-base text-slate-500">
                            {searchQuery || statusFilter !== 'All' ? 'Try adjusting your search or filters.' : 'Browse open jobs and apply to track your applications here.'}
                        </p>
                    </motion.div>
                )}
            </div>
        </motion.main>
    );
};

export default CandidateApplicationsPage;

