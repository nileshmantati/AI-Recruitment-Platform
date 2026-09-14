import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../../context/AuthContext";
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { Sparkles, CheckCircle, Briefcase, FileText, Calendar, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { T } from '../../../Js/theme';
import { KpiCard } from "../../../ui/DashboardUI";

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

const CandidateDashboard = ({ getScoreColor, getStatusBadge }) => {
    const { auth } = useAuth();
    const [myApplications, setMyApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchMyApplications = async () => {
            try {
                const response = await api.get('applications/my/');
                if (isMounted) setMyApplications(response.data);
            } catch (err) {
                console.error(err);
                if (isMounted) toast.error('Failed to load your applications.');
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchMyApplications();
        return () => { isMounted = false; };
    }, []);

    const stats = useMemo(() => ({
        total: myApplications.length,
        evaluated: myApplications.filter(a => ['EVALUATED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED'].includes(a.status)).length,
        shortlisted: myApplications.filter(a => a.status === 'SHORTLISTED').length,
        interviews: myApplications.filter(a => a.status === 'INTERVIEW_SCHEDULED').length,
    }), [myApplications]);

    if (loading) {
        return (
            <div className="flex h-[85vh] w-full items-center justify-center bg-slate-50/50">
                <div className="flex flex-col items-center gap-4 text-center p-8 max-w-sm">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
                        <i className="bi bi-robot text-indigo-600 text-3xl"></i>
                    </div>
                    <div>
                        <h4 className="font-extrabold text-slate-800 text-lg">Loading your dashboard...</h4>
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
            className="flex-1 pb-12"
        >
            <div className="space-y-8 p-6 lg:p-8">
                {/* Header */}
                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mb-1 flex items-center gap-2">
                            Good morning, {auth.username}
                            <span className="inline-block animate-bounce origin-[70%_70%]">👋</span>
                        </h2>
                        <p className="text-sm sm:text-base text-slate-500 font-medium">Here's what's happening with your job applications today.</p>
                    </div>
                    <Link
                        to="/findjobs"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm sm:text-base shadow-md transition hover:scale-95 cursor-pointer"
                        style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}
                    >
                        <Briefcase size={18} /> Explore Jobs
                    </Link>
                </motion.div>

                {/* Stat Grid */}
                <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                        { label: "Applications Sent", value: stats.total, color: T.primary, icon: FileText },
                        { label: "AI Evaluated", value: stats.evaluated, color: "#06B6D4", icon: Sparkles },
                        { label: "Shortlisted", value: stats.shortlisted, color: "#22C55E", icon: CheckCircle },
                        { label: "Interviews", value: stats.interviews, color: "#6366F1", icon: Calendar },
                    ].map((s, i) => <KpiCard key={i} icon={s.icon} label={s.label} value={s.value} color={s.color} />)}
                </motion.div>

                {/* Applications Section */}
                <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200/70 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                                Recent Applications
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                                Track the real-time status and AI feedback of your submitted positions
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myApplications.map((app) => (
                            <div key={app.id} className="bg-white h-full shadow-sm border border-slate-200/80 rounded-2xl overflow-hidden hover:shadow-md transition-all">
                                <div className="p-5 flex flex-col h-full justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-2 gap-2">
                                            <h5 className="text-base sm:text-lg font-bold text-slate-900 mb-0 line-clamp-1">{app.job_details?.title}</h5>
                                            {getStatusBadge(app.status)}
                                        </div>
                                        <p className="text-slate-500 text-sm sm:text-base mb-1 font-medium">
                                            {app.job_details?.salary || 'Salary Undisclosed'}
                                        </p>
                                        <p className="text-slate-400 text-xs sm:text-sm mb-4">
                                            Applied: {new Date(app.applied_at).toLocaleDateString()}
                                        </p>

                                        {app.resume_score > 0 && (
                                            <div className="mb-4">
                                                <span
                                                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold ${getScoreColor(app.resume_score)}`}
                                                >
                                                    <Sparkles size={14} className="mr-1.5" />{app.resume_score}% Match
                                                </span>
                                            </div>
                                        )}

                                        {app.ai_feedback && (
                                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                                                {app.ai_feedback.strengths?.length > 0 && (
                                                    <div>
                                                        <strong className="flex items-center text-emerald-600 text-xs sm:text-sm uppercase font-bold tracking-wider mb-1.5">
                                                            <CheckCircle size={14} className="mr-1.5" />Top Strengths
                                                        </strong>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {app.ai_feedback.strengths?.slice(0, 3).map((s, i) => (
                                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs sm:text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200" key={i}>
                                                                    {s}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {app.ai_feedback.missing_skills?.length > 0 && (
                                                    <div>
                                                        <strong className="flex items-center text-rose-600 text-xs sm:text-sm uppercase font-bold tracking-wider mb-1.5">
                                                            <AlertCircle size={14} className="mr-1.5" />Skills to Highlight
                                                        </strong>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {app.ai_feedback.missing_skills?.slice(0, 3).map((s, i) => (
                                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs sm:text-sm font-medium bg-rose-50 text-rose-700 border border-rose-200" key={i}>
                                                                    {s}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {myApplications.length === 0 && (
                            <div className="col-span-full text-center py-16">
                                <Briefcase className="mx-auto text-slate-300 text-5xl mb-3" />
                                <p className="text-slate-600 text-base font-semibold">You haven't applied to any jobs yet.</p>
                                <p className="text-sm text-slate-500 mt-1 mb-4">Visit the Job Board to discover open roles that match your skill set.</p>
                                <Link to="/findjobs" className="inline-flex items-center gap-2 text-sm sm:text-base font-bold text-indigo-600 hover:underline">
                                    <Briefcase size={18} /> Visit Job Board
                                </Link>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </motion.main>
    );
}

export default CandidateDashboard;
