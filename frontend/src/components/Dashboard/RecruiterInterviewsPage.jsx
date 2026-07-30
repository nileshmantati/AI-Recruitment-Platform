import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';

import {
    Calendar, Video, Clock, CheckCircle, Users,
    Search, Filter, ChevronRight
} from 'lucide-react';
import { KpiCard } from '../../ui/DashboardUI.jsx';
import ApplicationDetails from './ApplicationDetails.jsx';
import toast from 'react-hot-toast';

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

const RecruiterInterviewsPage = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedApp, setSelectedApp] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const fetchApplications = async () => {
        try {
            const res = await api.get('applications/all/');
            setApplications(res.data);
        } catch (err) {
            console.error('Failed to load applications', err);
            toast.error('Failed to load interviews.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchApplications();
    }, []);

    // Filter only INTERVIEW_SCHEDULED
    const scheduledInterviews = useMemo(() => {
        return applications.filter(app => app.status === 'INTERVIEW_SCHEDULED');
    }, [applications]);

    const filteredInterviews = useMemo(() => {
        let result = scheduledInterviews;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(app =>
                app.candidate_name?.toLowerCase().includes(q) ||
                app.job_title?.toLowerCase().includes(q)
            );
        }
        return result;
    }, [scheduledInterviews, searchQuery]);

    const getScoreColor = (score) => {
        if (score >= 85) return 'text-green-600 bg-green-50 border-green-200';
        if (score >= 65) return 'text-amber-600 bg-amber-50 border-amber-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

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

    if (loading) {
        return (
            <div className="flex h-[85vh] w-full items-center justify-center bg-slate-50/50">
                <div className="flex flex-col items-center gap-4 text-center p-8 max-w-sm">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
                        <i className="bi bi-robot text-indigo-600 text-3xl"></i>
                    </div>
                    <div>
                        <h4 className="font-extrabold text-slate-800 text-lg">Loading your interviews...</h4>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <motion.main
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex-1 pb-16 min-h-screen bg-slate-50/50"
        >
            <div className="space-y-8 p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto">
                {/* Hero Header Section */}
                <motion.div variants={itemVariants} className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80">
                    <div className="relative p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-left space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-400/10 border border-blue-400/20 text-blue-800 text-sm font-medium backdrop-blur-md">
                                <Video size={16} />
                                <span>Interview Command Center</span>
                            </div>
                            <h1 className="text-3xl! sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                                Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-indigo-500">Scheduled Interviews</span>
                            </h1>
                            <p className="text-slate-600 text-base! sm:text-lg font-semibold max-w-xl leading-relaxed">
                                Track upcoming meetings and coordinate with shortlisted candidates easily.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Metrics Bento Grid */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <KpiCard icon={Calendar} label="Total Scheduled" value={scheduledInterviews.length} color="#75A5FF" />
                    <KpiCard icon={Clock} label="Pending Action" value={Math.floor(scheduledInterviews.length / 2)} color="#FFBD59" />
                    <KpiCard icon={CheckCircle} label="Completed" value={0} color="#36E095" />
                    <KpiCard icon={Users} label="Candidates" value={scheduledInterviews.length} color="#200D33" />
                </motion.div>

                {/* Filter and Search Bar */}
                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-2 pl-4 rounded-full shadow-sm border border-slate-200/80">
                    <div className="flex items-center w-full relative">
                        <Search className="w-5 h-5 text-slate-400 absolute left-2 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search candidates or job roles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-slate-700 placeholder:text-slate-400 pl-10 h-10 text-sm font-medium"
                        />
                    </div>
                    <button className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full! bg-slate-900 text-white hover:bg-slate-800 transition-colors text-sm font-semibold">
                        <Filter size={16} /> Filter
                    </button>
                </motion.div>

                {/* Pipeline / List */}
                <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                    <div className="px-6 py-2.5! border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h3 className="font-bold text-2xl! text-slate-800">Scheduled Interviews</h3>
                        <span className="text-xs font-semibold text-slate-500 bg-slate-200 px-2.5 py-1 rounded-full">
                            {filteredInterviews.length} Total
                        </span>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {loading ? (
                            <div className="p-12 flex flex-col items-center justify-center text-slate-400 space-y-4">
                                <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                                <p className="text-sm font-medium">Loading interview schedules...</p>
                            </div>
                        ) : filteredInterviews.length === 0 ? (
                            <div className="p-16 flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 ring-8 ring-white shadow-sm border border-slate-100">
                                    <Video className="w-8 h-8 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-700 mb-1">No interviews scheduled</h3>
                                <p className="text-sm text-slate-500 max-w-sm">
                                    {searchQuery ? "No interviews match your search criteria." : "Shortlist candidates and schedule interviews to see them appear here."}
                                </p>
                            </div>
                        ) : (
                            filteredInterviews.map((app) => (
                                <motion.div
                                    key={app.id}
                                    variants={itemVariants}
                                    className="group p-3 sm:p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row gap-5 items-start sm:items-center relative"
                                >
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="flex-shrink-0 relative">
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200 flex items-center justify-center text-indigo-700 font-bold text-lg shadow-inner">
                                            {app.candidate_name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-indigo-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                                            <Video className="w-2.5 h-2.5 text-white" />
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3">
                                            <h4 className="font-bold text-lg text-slate-900 truncate">
                                                {app.candidate_name}
                                            </h4>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getScoreColor(app.resume_score)}`}>
                                                {app.resume_score}% Match
                                            </span>
                                        </div>
                                        <p className="text-sm mb-0 font-medium text-slate-600 truncate flex items-center gap-2">
                                            Applied for <span className="text-indigo-600 font-semibold">{app.job_details.title}</span>
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                        <div className="flex flex-col sm:items-end text-sm">
                                            <span className="font-medium text-slate-700">TBD / Invited via Email</span>
                                            <span className="text-slate-400 text-xs">Waiting for confirmation</span>
                                        </div>

                                        <button
                                            onClick={() => setSelectedApp(app)}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl! bg-white border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all shadow-[0_2px_4px_rgba(0,0,0,0.02)]"
                                        >
                                            <span>View Details</span>
                                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </motion.div>
            </div>

            {selectedApp && (
                <ApplicationDetails
                    app={selectedApp}
                    setSelectedApp={setSelectedApp}
                    updatingStatus={updatingStatus}
                    handleUpdateStatus={handleUpdateStatus}
                    getTimeAgo={getTimeAgo}
                    getScoreColor={getScoreColor}
                    getStatusStyle={getStatusStyle}
                    formatStatus={formatStatus}
                />
            )}
        </motion.main>
    );
};

export default RecruiterInterviewsPage;
