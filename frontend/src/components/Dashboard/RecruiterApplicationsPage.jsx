import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { T } from '../../Js/theme.js';
import {
    Search, Filter, ChevronDown, Eye, FileText, User
} from 'lucide-react';
import ApplicationDetails from './ApplicationDetails.jsx';
import toast from 'react-hot-toast';

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

const RecruiterApplicationsPage = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);

    const [selectedApp, setSelectedApp] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const fetchApplications = async () => {
        try {
            const res = await api.get('applications/all/');
            setApplications(res.data);
        } catch (err) {
            console.error('Failed to load applications', err);
            toast.error('Failed to load applications.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchApplications();
    }, []);

    const handleUpdateStatus = async (appId, newStatus) => {
        setUpdatingStatus(true);
        try {
            const res = await api.patch(`applications/${appId}/status/`, { status: newStatus });
            setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: res.data.status } : a));
            if (selectedApp?.id === appId) {
                setSelectedApp(prev => ({ ...prev, status: res.data.status }));
            }
            toast.success(`Application marked as ${newStatus}.`);
        } catch (err) {
            console.error('Failed to update status', err);
            toast.error('Failed to update status.');
        } finally {
            setUpdatingStatus(false);
        }
    };



    const getScoreColor = (score) => {
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
        return status.replace('_', ' ');
    };

    const filteredApplications = useMemo(() => {
        let result = [...applications];
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(a =>
                a.candidate_name?.toLowerCase().includes(q) ||
                a.job_details?.title?.toLowerCase().includes(q)
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
                        <h4 className="font-extrabold text-slate-800 text-lg">Loading your applications...</h4>
                    </div>
                </div>
            </div>
        );
    }

    if (selectedApp) {
        const app = selectedApp;
        return (
            <ApplicationDetails
                app={app}
                setSelectedApp={setSelectedApp}
                handleUpdateStatus={handleUpdateStatus}
                updatingStatus={updatingStatus}
                getTimeAgo={getTimeAgo}
                getScoreColor={getScoreColor}
                getStatusStyle={getStatusStyle}
                formatStatus={formatStatus}
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
                        <h2 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
                            <FileText className="text-indigo-500" size={24} />
                            Applications
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">Review candidates who applied to your jobs.</p>
                    </div>
                </motion.div>

                {/* Filter Bar */}
                <motion.div variants={itemVariants} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-indigo-400 transition-all sm:w-80 shadow-sm w-full">
                        <Search size={16} className="text-slate-400 shrink-0" />
                        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search by name or job..."
                            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
                    </div>
                    <div className="flex w-full justify-between gap-2 sm:w-auto sm:justify-end">
                        <div className="relative flex-1 sm:flex-none">
                            <button onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                className="flex w-full items-center justify-between sm:justify-center gap-2 rounded-lg! border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition shadow-sm">
                                <span className="flex items-center gap-1.5"><Filter size={14} /> {statusFilter === 'All' ? 'All Status' : formatStatus(statusFilter)}</span>
                                <ChevronDown size={14} className={`transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            {showStatusDropdown && (
                                <div className="absolute left-0 sm:right-0 sm:left-auto top-12 z-20 w-48 overflow-hidden rounded-xl border border-slate-100 bg-white py-1 shadow-xl">
                                    {STATUS_OPTIONS.map(opt => (
                                        <button key={opt} onClick={() => { setStatusFilter(opt); setShowStatusDropdown(false); }}
                                            className={`w-full px-4 py-2 text-left text-sm! transition ${statusFilter === opt ? 'bg-indigo-50 font-bold text-indigo-600' : 'text-slate-600 hover:bg-slate-50 font-medium'}`}>
                                            {opt === 'All' ? 'All Status' : formatStatus(opt)}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                <motion.p variants={itemVariants} className="text-xs font-medium text-slate-400">
                    Showing <span className="text-slate-700">{filteredApplications.length}</span> of <span className="text-slate-700">{applications.length}</span> applications
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
                                                <User size={18} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold capitalize text-slate-900 leading-tight">{app.candidate_name}</h3>
                                                <p className="text-[11px] font-medium text-slate-400 mt-0.5 truncate max-w-[180px]">{app.job_details?.title}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded border uppercase ${getStatusStyle(app.status)}`}>
                                            {formatStatus(app.status)}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs">
                                            <span className="text-slate-500 font-medium">Score</span>
                                            <span className={`font-bold px-1.5 rounded ${getScoreColor(app.resume_score)}`}>{app.resume_score}%</span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs">
                                            <span className="text-slate-500 font-medium">Applied</span>
                                            <span className="font-semibold text-slate-700">{getTimeAgo(app.applied_at)}</span>
                                        </div>
                                    </div>

                                    <div className="mt-2 pt-2 border-t border-slate-100">
                                        <button onClick={() => setSelectedApp(app)}
                                            className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-indigo-50 py-2 text-xs font-bold text-indigo-600 transition hover:bg-indigo-100">
                                            <Eye size={14} /> Review Application
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </motion.div>

                        {/* Desktop View (md+) */}
                        <motion.div variants={itemVariants} className="hidden md:block overflow-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/80">
                                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Candidate</th>
                                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Applied Job</th>
                                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400 text-center">Score</th>
                                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400 text-center">Status</th>
                                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Applied On</th>
                                        <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredApplications.map((app, idx) => (
                                        <tr key={app.id} className={`border-b border-slate-50 transition hover:bg-slate-50/60 ${idx % 2 === 0 ? '' : 'bg-slate-25'}`}>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white"
                                                        style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>
                                                        <User size={14} />
                                                    </div>
                                                    <span className="font-bold capitalize text-slate-800">{app.candidate_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="font-semibold text-slate-600">{app.job_details?.title}</span>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className={`inline-flex px-2 py-0.5 rounded-md border font-bold text-xs ${getScoreColor(app.resume_score)}`}>
                                                    {app.resume_score}%
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(app.status)}`}>
                                                    {formatStatus(app.status)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-sm font-medium text-slate-500">
                                                {getTimeAgo(app.applied_at)}
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <button onClick={() => setSelectedApp(app)} title="Review"
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg! bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition">
                                                    <Eye size={15} />
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
                        <h3 className="text-lg font-bold text-slate-800">
                            {searchQuery || statusFilter !== 'All' ? 'No matching applications found' : 'No applications received yet'}
                        </h3>
                        <p className="mt-2 max-w-sm text-sm text-slate-500">
                            {searchQuery || statusFilter !== 'All' ? 'Try adjusting your search or filters.' : 'When candidates apply to your jobs, they will appear here.'}
                        </p>
                    </motion.div>
                )}
            </div>
        </motion.main>
    );
};

export default RecruiterApplicationsPage;
