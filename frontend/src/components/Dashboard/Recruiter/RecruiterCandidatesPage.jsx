import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import api from '../../../services/api';
import { T } from '../../../Js/theme.js';
import {
    Search, Filter, ChevronDown, User, Briefcase, ArrowLeft
} from 'lucide-react';
import CandidateDetails from './CandidateDetails.jsx';

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

const RecruiterCandidatesPage = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);

    const [selectedCandidate, setSelectedCandidate] = useState(null);

    const fetchCandidates = async () => {
        try {
            const res = await api.get('applications/all/');
            setApplications(res.data);
        } catch (err) {
            console.error('Failed to load candidates', err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchCandidates();
    }, []);

    const uniqueCandidates = useMemo(() => {
        const candidateMap = new Map();

        applications.forEach(app => {
            if (!candidateMap.has(app.candidate)) {
                candidateMap.set(app.candidate, {
                    id: app.candidate,
                    name: app.candidate_name,
                    details: app.candidate_details || {},
                    applications: []
                });
            }
            candidateMap.get(app.candidate).applications.push(app);
        });

        return Array.from(candidateMap.values());
    }, [applications]);

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

    const filteredCandidates = useMemo(() => {
        let result = [...uniqueCandidates];

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(c =>
                c.name?.toLowerCase().includes(q) ||
                (c.details.skills || []).some(skill => skill.toLowerCase().includes(q))
            );
        }

        if (statusFilter !== 'All') {

            result = result.filter(c =>
                c.applications.some(app => app.status === statusFilter)
            );
        }
        return result;
    }, [uniqueCandidates, searchQuery, statusFilter]);

    if (loading) {
        return (
            <div className="flex h-[85vh] w-full items-center justify-center bg-slate-50/50">
                <div className="flex flex-col items-center gap-4 text-center p-8 max-w-sm">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
                        <i className="bi bi-robot text-indigo-600 text-3xl"></i>
                    </div>
                    <div>
                        <h4 className="font-extrabold text-slate-800 text-lg">Loading candidates...</h4>
                    </div>
                </div>
            </div>
        );
    }

    if (selectedCandidate) {
        return (
            <CandidateDetails candidate={selectedCandidate} setSelectedCandidate={setSelectedCandidate} applications={applications} getStatusStyle={getStatusStyle} formatStatus={formatStatus} />
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
                            <User className="text-indigo-500" size={24} />
                            Candidate Profiles
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">View and explore candidates who applied to your open roles.</p>
                    </div>
                </motion.div>

                {/* Filter Bar */}
                <motion.div variants={itemVariants} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-indigo-400 transition-all sm:w-80 shadow-sm w-full">
                        <Search size={16} className="text-slate-400 shrink-0" />
                        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search by name or skill..."
                            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
                    </div>
                    <div className="flex w-full justify-between gap-2 sm:w-auto sm:justify-end">
                        <div className="relative flex-1 sm:flex-none">
                            <button onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                className="flex w-full items-center justify-between sm:justify-center gap-2 rounded-lg! border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition shadow-sm">
                                <span className="flex items-center gap-1.5"><Filter size={14} /> {statusFilter === 'All' ? 'All Applicants' : formatStatus(statusFilter)}</span>
                                <ChevronDown size={14} className={`transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            {showStatusDropdown && (
                                <div className="absolute left-0 sm:right-0 sm:left-auto top-12 z-20 w-48 overflow-hidden rounded-xl border border-slate-100 bg-white py-1 shadow-xl">
                                    {STATUS_OPTIONS.map(opt => (
                                        <button key={opt} onClick={() => { setStatusFilter(opt); setShowStatusDropdown(false); }}
                                            className={`w-full px-4 py-2 text-left text-sm! transition ${statusFilter === opt ? 'bg-indigo-50 font-bold text-indigo-600' : 'text-slate-600 hover:bg-slate-50 font-medium'}`}>
                                            {opt === 'All' ? 'All Applicants' : formatStatus(opt)}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                <motion.p variants={itemVariants} className="text-sm font-medium text-slate-400">
                    Showing <span className="text-slate-700">{filteredCandidates.length}</span> candidates
                </motion.p>

                {filteredCandidates.length > 0 ? (
                    <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCandidates.map((candidate) => (
                            <div key={candidate.id} onClick={() => setSelectedCandidate(candidate)}
                                className="group flex flex-col rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer">

                                <div className="flex items-center gap-4">
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-md transition-transform group-hover:scale-105"
                                        style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>
                                        <User size={24} />
                                    </div>
                                    <div className="flex-1 justify-center overflow-hidden">
                                        <h4 className="font-bold mb-0 text-lg! capitalize text-slate-900 truncate leading-tight">{candidate.name}</h4>
                                        <p className="text-md! mb-0 font-medium text-slate-500 truncate">
                                            {candidate.details.experience || 'Entry Level'}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-2 border-t border-slate-50 pt-4">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Top Skills</p>
                                    <div className="flex flex-wrap gap-1.5 h-[50px] overflow-hidden">
                                        {candidate.details.skills && candidate.details.skills.length > 0 ? (
                                            candidate.details.skills.slice(0, 4).map((skill, idx) => (
                                                <span key={idx} className="rounded border border-indigo-100 bg-indigo-50/50 px-2 py-0.5 text-[11px] font-semibold text-indigo-600">
                                                    {skill}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-slate-400">No skills listed</span>
                                        )}
                                        {candidate.details.skills && candidate.details.skills.length > 4 && (
                                            <span className="rounded border border-slate-100 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                                                +{candidate.details.skills.length - 4} more
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-auto pt-2 flex items-center justify-between border-t border-slate-100">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                        <Briefcase size={14} className="text-indigo-400" />
                                        {candidate.applications.length} Job{candidate.applications.length !== 1 ? 's' : ''} Applied
                                    </div>
                                    <div className="flex items-center text-xs font-bold text-indigo-600 opacity-0 transition-opacity group-hover:opacity-100">
                                        View Profile <ArrowLeft size={14} className="ml-1 rotate-180" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div variants={itemVariants} className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white py-24 px-6 text-center">
                        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full" style={{ background: `${T.primary}10` }}>
                            <User size={32} style={{ color: T.primary }} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">
                            {searchQuery || statusFilter !== 'All' ? 'No matching candidates found' : 'No candidates yet'}
                        </h3>
                        <p className="mt-2 max-w-sm text-sm text-slate-500">
                            {searchQuery || statusFilter !== 'All' ? 'Try adjusting your search criteria.' : 'As candidates apply to your jobs, their profiles will appear here.'}
                        </p>
                    </motion.div>
                )}
            </div>
        </motion.main>
    );
};

export default RecruiterCandidatesPage;
