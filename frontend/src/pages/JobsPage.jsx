import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import api from '../services/api.js';
import { T } from '../Js/theme.js';
import {
    Briefcase, Search, Filter, Clock, Users, IndianRupee, ChevronDown, Building2
} from 'lucide-react';
import ApplyJobModal from '../components/Modals/ApplyJobModal.jsx';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const JOB_TYPES = ['All', 'Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'];
const SORT_OPTIONS = ['Newest First', 'Most Applicants', 'Salary (High)', 'Salary (Low)'];

const getTimeAgo = (date) => {
    if (!date) return 'Recently';
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
};

// ─── JobCard — defined OUTSIDE parent to prevent remounting on every render ───
const JobCard = ({ job, onApply }) => {
    const skills = Array.isArray(job.required_skills)
        ? job.required_skills
        : (job.required_skills || '').split(',').map(s => s.trim()).filter(Boolean);

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-slate-200">
            {/* Decorative Background Blob */}
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-400/20 blur-3xl transition-transform duration-700 group-hover:scale-150 pointer-events-none" />
            <div className="flex flex-1 flex-col p-4 sm:p-5">
                {/* Header */}
                <div className="mb-4 flex items-center gap-3">
                    {/* Icon — fixed h-13/w-13 → h-12/w-12 (valid Tailwind size) */}
                    <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-md transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110"
                        style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}
                    >
                        <Briefcase size={22} />
                    </div>

                    {/* Title & Recruiter */}
                    <div className="flex min-w-0 flex-1 flex-col justify-center">
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="truncate text-base font-bold capitalize text-slate-900 transition-colors group-hover:text-indigo-600">
                                {job.title}
                            </h3>
                            {/* Time Badge */}
                            <div className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-100 bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-600">
                                <Clock size={11} className="text-slate-400" />
                                {getTimeAgo(job.created_at)}
                            </div>
                        </div>
                        {/* Recruiter — replaced Bootstrap `bi bi-building` with lucide Building2 icon */}
                        <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-500">
                            <Building2 size={13} className="shrink-0 text-slate-400" />
                            Posted by {job.recruiter_name}
                        </p>
                    </div>
                </div>

                {/* Description */}
                <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-slate-500">
                    {job.description || 'No description provided for this role.'}
                </p>

                {/* Skills Tags */}
                {skills.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-1.5">
                        {skills.slice(0, 4).map((skill, i) => (
                            <span
                                key={i}
                                className="rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors"
                                style={{ background: `${T.primary}15`, color: T.primary }}
                            >
                                {skill}
                            </span>
                        ))}
                        {skills.length > 4 && (
                            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                                +{skills.length - 4}
                            </span>
                        )}
                    </div>
                )}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Footer meta */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-600">
                            <IndianRupee size={12} /> {job.salary || 'N/A'}
                        </span>
                        <div className="flex items-center gap-1 rounded-xl border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700">
                            <Users size={12} className="text-indigo-500" />
                            {job.applicants ?? 0} applied
                        </div>
                    </div>
                    {job.type && (
                        <span
                            className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                            style={{ background: `${T.accent}15`, color: T.accent }}
                        >
                            {job.type}
                        </span>
                    )}
                </div>

                {/* Apply Button — fixed: rounded-lg! → !rounded-lg (Tailwind v4 prefix syntax) */}
                <button
                    onClick={() => onApply(job)}
                    disabled={job.isApplied}
                    className="mt-3 w-full !rounded-lg border-2 px-6 py-2.5 text-sm font-medium transition-all hover:scale-95 disabled:cursor-not-allowed"
                    style={{
                        borderColor: job.isApplied ? '#d1d5db' : T.primary,
                        color: job.isApplied ? '#9ca3af' : 'white',
                        background: job.isApplied ? '#f9fafb' : `linear-gradient(135deg, ${T.primary}, ${T.accent})`,
                    }}
                >
                    {job.isApplied ? 'Applied ✓' : 'Apply Now'}
                </button>
            </div>
        </div>
    );
};

// ─── JobRow — also defined OUTSIDE parent ──────────────────────────────────
const JobRow = ({ job, onApply }) => {
    const skills = Array.isArray(job.required_skills)
        ? job.required_skills
        : (job.required_skills || '').split(',').map(s => s.trim()).filter(Boolean);

    return (
        <div className="group flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-4 shadow-sm transition-all hover:border-slate-200 hover:shadow-md">
            {/* Icon */}
            <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white transition-transform group-hover:scale-110"
                style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}
            >
                <Briefcase size={20} />
            </div>

            {/* Meta */}
            <div className="min-w-0 flex-1">
                <h4 className="truncate text-sm font-bold capitalize text-slate-900">{job.title}</h4>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                        <Building2 size={12} className="text-slate-400" /> {job.recruiter_name}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-slate-500">
                        <Clock size={12} className="text-slate-400" /> {getTimeAgo(job.created_at)}
                    </span>
                    <span className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-600">
                        <IndianRupee size={11} /> {job.salary || 'N/A'}
                    </span>
                </div>
            </div>

            {/* Skills — hidden on mobile to avoid overflow */}
            <div className="hidden md:flex items-center gap-1.5">
                {skills.slice(0, 3).map((s, i) => (
                    <span
                        key={i}
                        className="rounded-md px-2 py-0.5 text-[11px] font-medium"
                        style={{ background: `${T.primary}12`, color: T.primary }}
                    >
                        {s}
                    </span>
                ))}
            </div>

            {/* Applicants */}
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50 px-3 py-1.5 text-sm font-bold text-slate-700">
                <Users size={13} className="text-indigo-500" />
                {job.applicants ?? 0}
            </div>

            {/* Apply button — fixed: rounded-lg! → !rounded-lg */}
            <button
                onClick={() => onApply(job)}
                disabled={job.isApplied}
                className="!rounded-lg px-4 py-1.5 text-xs font-medium text-white transition hover:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                    background: job.isApplied ? '#d1d5db' : `linear-gradient(135deg, ${T.primary}, ${T.accent})`,
                }}
            >
                {job.isApplied ? 'Applied' : 'Apply'}
            </button>
        </div>
    );
};

// ─── Main Page Component ───────────────────────────────────────────────────
const JobsPage = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [sortBy, setSortBy] = useState('Newest First');
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

    const [showModal, setShowModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);

    // ─── Ref for click-outside to close sort dropdown ─────────────────────
    const sortDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
                setShowSortDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        let isMounted = true;
        const loadJobs = async () => {
            try {
                const response = await api.get('jobs/');
                let userAppliedJobIds = new Set();
                try {
                    const appsRes = await api.get('applications/my/');
                    if (Array.isArray(appsRes.data)) {
                        userAppliedJobIds = new Set(appsRes.data.map(app => app.job || app.job_details?.id));
                    }
                } catch {
                    // Unauthenticated or not candidate
                }
                const jobsWithApplied = (response.data || []).map(j => ({
                    ...j,
                    isApplied: userAppliedJobIds.has(j.id)
                }));
                if (isMounted) setJobs(jobsWithApplied);
            } catch (err) {
                console.error('Failed to load jobs', err);
                if (isMounted) toast.error('Failed to load jobs.');
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        loadJobs();
        return () => { isMounted = false; };
    }, []);

    const handleApplyClick = useCallback((job) => {
        setSelectedJob(job);
        setShowModal(true);
    }, []);

    const filteredJobs = useMemo(() => {
        let result = [...jobs];
        const isSearchingOrFiltering = searchQuery.trim() !== '' || activeFilter !== 'All';

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(j =>
                j.title?.toLowerCase().includes(q) ||
                j.description?.toLowerCase().includes(q) ||
                (Array.isArray(j.required_skills)
                    ? j.required_skills.some(s => s.toLowerCase().includes(q))
                    : (j.required_skills || '').toLowerCase().includes(q))
            );
        }
        if (activeFilter !== 'All') {
            result = result.filter(j => j.type?.toLowerCase() === activeFilter.toLowerCase());
        }
        switch (sortBy) {
            case 'Most Applicants':
                result.sort((a, b) => (b.applicants || 0) - (a.applicants || 0));
                break;
            case 'Salary (High)':
                result.sort((a, b) => parseFloat(b.salary || 0) - parseFloat(a.salary || 0));
                break;
            case 'Salary (Low)':
                result.sort((a, b) => parseFloat(a.salary || 0) - parseFloat(b.salary || 0));
                break;
            default:
                result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        }

        if (!isSearchingOrFiltering) {
            return result.slice(0, 5);
        }

        return result;
    }, [jobs, searchQuery, activeFilter, sortBy]);

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-slate-200 border-t-indigo-600" />
                    <p className="text-sm font-semibold text-slate-500">Loading jobs...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <section className="min-h-screen pb-16">
                <motion.main
                    className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* ─── Page Header ──────────────────────────────── */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                            Find Jobs{' '}
                            <span
                                className="text-transparent bg-clip-text"
                                style={{ backgroundImage: `linear-gradient(to right, ${T.primary}, ${T.accent})` }}
                            >
                                | AI Recruitment Platform
                            </span>
                        </h1>
                        <p className="mt-2 text-slate-500 font-medium text-sm sm:text-base">
                            Browse through our latest openings tailored for you.
                        </p>
                    </div>

                    {/* ─── Search / Filter Bar ──────────────────────── */}
                    <div className="rounded-2xl border border-slate-100 bg-white px-4 pt-4 pb-3 shadow-sm">
                        <div className="flex flex-col gap-4">
                            {/* Top row: Search */}
                            <div className="flex w-full items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-indigo-400 transition-all">
                                <Search size={16} className="shrink-0 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search jobs by title, skill..."
                                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                                />
                            </div>

                            {/* Bottom row: Filters + Sort + View Toggle */}
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                {/* Filter Pills */}
                                <div className="flex-1 overflow-x-auto pb-1">
                                    <div className="flex gap-1.5 whitespace-nowrap">
                                        {JOB_TYPES.map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setActiveFilter(type)}
                                                className={`!rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${activeFilter === type
                                                    ? 'text-white shadow-md'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:scale-95'
                                                    }`}
                                                style={
                                                    activeFilter === type
                                                        ? { background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }
                                                        : {}
                                                }
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex shrink-0 items-center gap-2">
                                    {/* Sort Dropdown — fixed: added click-outside ref */}
                                    <div className="relative" ref={sortDropdownRef}>
                                        <button
                                            onClick={() => setShowSortDropdown(prev => !prev)}
                                            className="flex items-center gap-1.5 !rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                                        >
                                            <Filter size={13} />
                                            <span className="hidden sm:inline">{sortBy}</span>
                                            <ChevronDown
                                                size={13}
                                                className={`transition-transform ${showSortDropdown ? 'rotate-180' : ''}`}
                                            />
                                        </button>
                                        {showSortDropdown && (
                                            <div className="absolute right-0 top-9 z-20 w-44 overflow-hidden rounded-xl border border-slate-100 bg-white py-1 shadow-xl">
                                                {SORT_OPTIONS.map((opt) => (
                                                    <button
                                                        key={opt}
                                                        onClick={() => { setSortBy(opt); setShowSortDropdown(false); }}
                                                        className={`w-full px-3 py-2 text-left text-sm transition ${sortBy === opt
                                                            ? 'bg-indigo-50 font-semibold text-indigo-600'
                                                            : 'text-slate-600 hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* View Toggle */}
                                    <div className="flex overflow-hidden rounded-lg border border-slate-200">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            title="Grid view"
                                            className={`px-2.5 py-1.5 transition ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                                                <rect x="1" y="1" width="6" height="6" rx="1" />
                                                <rect x="9" y="1" width="6" height="6" rx="1" />
                                                <rect x="1" y="9" width="6" height="6" rx="1" />
                                                <rect x="9" y="9" width="6" height="6" rx="1" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            title="List view"
                                            className={`px-2.5 py-1.5 transition ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                                                <rect x="1" y="2" width="14" height="3" rx="1" />
                                                <rect x="1" y="7" width="14" height="3" rx="1" />
                                                <rect x="1" y="12" width="14" height="3" rx="1" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Results count */}
                        <p className="mt-3 text-xs font-medium text-slate-400">
                            Showing <span className="text-slate-700">{filteredJobs.length}</span> of{' '}
                            <span className="text-slate-700">{jobs.length}</span> jobs
                            {(!searchQuery.trim() && activeFilter === 'All' && jobs.length > 5) && (
                                <span className="ml-1 font-normal text-slate-400"> (Showing top 5 recent jobs. Search or filter to explore all {jobs.length})</span>
                            )}
                        </p>
                    </div>

                    {/* ─── Jobs Grid / List ─────────────────────────── */}
                    {filteredJobs.length > 0 ? (
                        viewMode === 'grid' ? (
                            <motion.div
                                className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                                initial="hidden"
                                animate="show"
                                variants={{
                                    hidden: { opacity: 0 },
                                    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
                                }}
                            >
                                {filteredJobs.map((job) => (
                                    <motion.div
                                        key={job.id}
                                        variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                                    >
                                        <JobCard job={job} onApply={handleApplyClick} />
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                className="space-y-3"
                                initial="hidden"
                                animate="show"
                                variants={{
                                    hidden: { opacity: 0 },
                                    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
                                }}
                            >
                                {filteredJobs.map((job) => (
                                    <motion.div
                                        key={job.id}
                                        variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}
                                    >
                                        <JobRow job={job} onApply={handleApplyClick} />
                                    </motion.div>
                                ))}
                            </motion.div>
                        )
                    ) : (
                        /* Empty State */
                        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white px-6 py-16 text-center sm:py-20">
                            <div
                                className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                                style={{ background: `${T.primary}10` }}
                            >
                                <Briefcase size={28} style={{ color: T.primary }} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">
                                {searchQuery || activeFilter !== 'All'
                                    ? 'No matching jobs found'
                                    : 'No jobs posted yet'}
                            </h3>
                            <p className="mt-2 max-w-sm text-sm text-slate-500">
                                {searchQuery || activeFilter !== 'All'
                                    ? 'Try adjusting your search or filter criteria.'
                                    : 'Get started by posting your first job. Our AI will help you find the perfect candidates.'}
                            </p>
                        </div>
                    )}
                </motion.main>

                {/* Apply Modal */}
                <ApplyJobModal
                    show={showModal}
                    handleClose={() => setShowModal(false)}
                    job={selectedJob}
                />
            </section>
        </>
    );
};

export default JobsPage;
