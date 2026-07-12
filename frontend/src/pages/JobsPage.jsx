import { useState, useEffect, useMemo } from 'react';
import api from '../services/api.js';
import { T } from '../Js/theme.js';
import {
    Briefcase, Search, Filter, Clock, Users, IndianRupee, ChevronDown
} from 'lucide-react';
import ApplyJobModal from '../components/Modals/ApplyJobModal.jsx';

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

const JobsPage = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error] = useState('');

    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [sortBy, setSortBy] = useState('Newest First');
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

    const [showModal, setShowModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const response = await api.get('jobs/my/');
            setJobs(response.data);
        } catch (err) {
            console.error('Failed to load jobs', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleApplyClick = (job) => {
        setSelectedJob(job);
        setShowModal(true);
    };

    const filteredJobs = useMemo(() => {
        let result = [...jobs];
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(j =>
                j.title?.toLowerCase().includes(q) ||
                j.description?.toLowerCase().includes(q) ||
                j.required_skills?.some(s => s.toLowerCase().includes(q))
            );
        }
        if (activeFilter !== 'All') {
            result = result.filter(j => j.type?.toLowerCase() === activeFilter.toLowerCase());
        }
        switch (sortBy) {
            case 'Most Applicants': result.sort((a, b) => (b.applicants || 0) - (a.applicants || 0)); break;
            case 'Salary (High)': result.sort((a, b) => parseFloat(b.salary || 0) - parseFloat(a.salary || 0)); break;
            case 'Salary (Low)': result.sort((a, b) => parseFloat(a.salary || 0) - parseFloat(b.salary || 0)); break;
            default: result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        }
        return result;
    }, [jobs, searchQuery, activeFilter, sortBy]);

    const JobCard = ({ job }) => {
        const skills = Array.isArray(job.required_skills)
            ? job.required_skills
            : (job.required_skills || '').split(',').map(s => s.trim()).filter(Boolean);

        return (
            <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-slate-200">
                {/* Gradient accent top */}
                <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${T.primary}, ${T.accent})` }} />

                <div className="flex flex-1 flex-col p-4">
                    {/* Header */}
                    <div className="mb-4 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md"
                                style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>
                                <Briefcase size={18} />
                            </div>
                            <div className="min-w-0">
                                <h3 className="truncate text-base font-bold capitalize text-slate-900 group-hover:text-indigo-600 transition-colors">
                                    {job.title}
                                </h3>
                                {/* Recruiter */}
                                <p className="mt-2 text-sm text-gray-500">
                                    <i className="bi bi-building mr-1"></i>
                                    Posted by {job.recruiter_name}
                                </p>
                                <p className="flex items-center gap-1 text-xs text-slate-400">
                                    <Clock size={12} /> Posted {getTimeAgo(job.created_at)}
                                </p>
                            </div>
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
                                <span key={i}
                                    className="rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors"
                                    style={{ background: `${T.primary}10`, color: T.primary }}>
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
                    <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
                                <IndianRupee size={13} className="text-green-500" />
                                {job.salary || 'N/A'}
                            </span>
                            <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
                                <Users size={13} className="text-indigo-500" />
                                {job.applicants ?? 0} applied
                            </span>
                        </div>
                        {job.type && (
                            <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                                style={{ background: `${T.accent}15`, color: T.accent }}>
                                {job.type}
                            </span>
                        )}
                    </div>
                    {/* Apply Button */}
                    <button
                        onClick={() => handleApplyClick(job)}
                        disabled={job.isApplied}
                        className="mt-3 w-full rounded-lg! border-2 px-6 py-2.5 text-sm font-medium transition-all"
                        style={{
                            borderColor: job.isApplied ? "#ccc" : T.primary,
                            color: job.isApplied ? "#ccc" : "white",
                            background: job.isApplied ? "#f9fafb" : `linear-gradient(135deg, ${T.primary}, ${T.accent})`,
                        }}>
                        {job.isApplied ? "Applied" : "Apply Now"}
                    </button>
                </div>
            </div>
        );
    };

    const JobRow = ({ job }) => {
        const skills = Array.isArray(job.required_skills)
            ? job.required_skills
            : (job.required_skills || '').split(',').map(s => s.trim()).filter(Boolean);

        return (
            <div className="group flex items-center gap-4 rounded-xl border border-slate-100 bg-white px-5 py-4 shadow-sm transition-all hover:shadow-md hover:border-slate-200">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                    style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>
                    <Briefcase size={16} />
                </div>
                <div className="min-w-0 flex-1">
                    <h4 className="truncate text-sm font-bold capitalize text-slate-900">{job.title}</h4>
                    <div className="flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Clock size={11} /> {getTimeAgo(job.created_at)}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                            <IndianRupee size={11} /> {job.salary || 'N/A'}
                        </span>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-1.5">
                    {skills.slice(0, 3).map((s, i) => (
                        <span key={i} className="rounded-md px-2 py-0.5 text-[11px] font-medium"
                            style={{ background: `${T.primary}10`, color: T.primary }}>{s}</span>
                    ))}
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                    <Users size={14} className="text-indigo-500" />
                    {job.applicants ?? 0}
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => handleApplyClick(job)} disabled={job.isApplied}
                        className="rounded-lg! px-4 py-1.5 text-xs font-bold text-white transition disabled:opacity-50"
                        style={{ background: job.isApplied ? '#ccc' : `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>
                        {job.isApplied ? 'Applied' : 'Apply'}
                    </button>
                </div>
            </div>
        );
    };

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
            <main className="flex-1 pb-12">
                <div className="space-y-6 p-6 lg:p-8">
                    {/* Error */}
                    {error && (
                        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-600">
                            {error}
                        </div>
                    )}

                    {/* ─── Search / Filter Bar ──────────────────── */}
                    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            {/* Search */}
                            <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-indigo-400 transition-all sm:w-80">
                                <Search size={16} className="text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search jobs by title, skill..."
                                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                {/* Filter Pills */}
                                <div className="flex flex-wrap gap-1.5">
                                    {JOB_TYPES.map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setActiveFilter(type)}
                                            className={`rounded-lg! px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${activeFilter === type
                                                ? 'text-white shadow-md'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                            style={activeFilter === type ? { background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` } : {}}>
                                            {type}
                                        </button>
                                    ))}
                                </div>

                                {/* Sort Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowSortDropdown(!showSortDropdown)}
                                        className="flex items-center gap-1.5 rounded-lg! border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition">
                                        <Filter size={13} />
                                        {sortBy}
                                        <ChevronDown size={13} className={`transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                                    </button>
                                    {showSortDropdown && (
                                        <div className="absolute right-0 top-9 z-20 w-44 overflow-hidden rounded-xl border border-slate-100 bg-white py-1 shadow-xl">
                                            {SORT_OPTIONS.map((opt) => (
                                                <button
                                                    key={opt}
                                                    onClick={() => { setSortBy(opt); setShowSortDropdown(false); }}
                                                    className={`w-full px-3 py-2 text-left text-sm transition ${sortBy === opt ? 'bg-indigo-50 font-semibold text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* View Toggle */}
                                <div className="flex overflow-hidden rounded-lg border border-slate-200">
                                    <button onClick={() => setViewMode('grid')}
                                        className={`px-2.5 py-1.5 transition ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}>
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="6" height="6" rx="1" /><rect x="9" y="1" width="6" height="6" rx="1" /><rect x="1" y="9" width="6" height="6" rx="1" /><rect x="9" y="9" width="6" height="6" rx="1" /></svg>
                                    </button>
                                    <button onClick={() => setViewMode('list')}
                                        className={`px-2.5 py-1.5 transition ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}>
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="2" width="14" height="3" rx="1" /><rect x="1" y="7" width="14" height="3" rx="1" /><rect x="1" y="12" width="14" height="3" rx="1" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Results count */}
                        <p className="mt-3 text-xs font-medium text-slate-400">
                            Showing <span className="text-slate-700">{filteredJobs.length}</span> of <span className="text-slate-700">{jobs.length}</span> jobs
                        </p>
                    </div>

                    {/* ─── Jobs Grid / List ─────────────────────── */}
                    {filteredJobs.length > 0 ? (
                        viewMode === 'grid' ? (
                            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                                {filteredJobs.map((job) => (
                                    <JobCard key={job.id} job={job} />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredJobs.map((job) => (
                                    <JobRow key={job.id} job={job} />
                                ))}
                            </div>
                        )
                    ) : (
                        /* Empty State */
                        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20 px-6 text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                                style={{ background: `${T.primary}10` }}>
                                <Briefcase size={28} style={{ color: T.primary }} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">
                                {searchQuery || activeFilter !== 'All' ? 'No matching jobs found' : 'No jobs posted yet'}
                            </h3>
                            <p className="mt-2 max-w-sm text-sm text-slate-500">
                                {searchQuery || activeFilter !== 'All'
                                    ? 'Try adjusting your search or filter criteria.'
                                    : 'Get started by posting your first job. Our AI will help you find the perfect candidates.'}
                            </p>
                        </div>
                    )}
                </div>
                {/* Modal */}
                <ApplyJobModal
                    show={showModal}
                    handleClose={() => setShowModal(false)}
                    job={selectedJob}
                />
            </main>
        </>
    );
};

export default JobsPage;
