import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    getAdminJobs,
    getAdminJobDetails,
    moderateAdminJob,
} from '../../services/adminApi';
import {
    Briefcase,
    Search,
    RefreshCw,
    Eye,
    AlertTriangle,
    X,
    ChevronLeft,
    ChevronRight,
    Users,
} from 'lucide-react';
import { T } from '../../Js/theme';
import toast from 'react-hot-toast';

const AdminJobsPage = () => {
    const { hasPermission } = useAuth();
    const canModerateJobs = hasPermission('jobs.moderate');

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Filters
    const [search, setSearch] = useState('');
    const [submittedSearch, setSubmittedSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState('');

    // Modals
    const [selectedJob, setSelectedJob] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [moderationJob, setModerationJob] = useState(null);
    const [moderationReason, setModerationReason] = useState('');
    const [submittingModeration, setSubmittingModeration] = useState(false);

    useEffect(() => {
        let isMounted = true;
        getAdminJobs({
            page,
            is_active: activeFilter,
            search: submittedSearch.trim(),
        })
            .then((data) => {
                if (isMounted) {
                    setJobs(data.results || []);
                    setTotalCount(data.count || 0);
                    const size = 20;
                    setTotalPages(Math.ceil((data.count || 0) / size) || 1);
                    setLoading(false);
                }
            })
            .catch((err) => {
                if (isMounted) {
                    console.error('Failed to load jobs:', err);
                    toast.error(err.response?.data?.detail || 'Failed to load platform jobs.');
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [page, activeFilter, submittedSearch]);

    const fetchJobs = () => {
        setLoading(true);
        getAdminJobs({
            page,
            is_active: activeFilter,
            search: submittedSearch.trim(),
        })
            .then((data) => {
                setJobs(data.results || []);
                setTotalCount(data.count || 0);
                const size = 20;
                setTotalPages(Math.ceil((data.count || 0) / size) || 1);
            })
            .catch((err) => {
                toast.error(err.response?.data?.detail || 'Failed to load platform jobs.');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        setSubmittedSearch(search);
    };

    const handleOpenDetail = async (job) => {
        setSelectedJob(job);
        setDetailLoading(true);
        try {
            const details = await getAdminJobDetails(job.id);
            setSelectedJob(details);
        } catch (err) {
            console.error('Failed to load job details:', err);
            toast.error('Could not load detailed job record.');
        } finally {
            setDetailLoading(false);
        }
    };

    const handleOpenModeration = (job) => {
        setModerationJob(job);
        setModerationReason('');
    };

    const handleConfirmModeration = async () => {
        if (!moderationJob) return;
        const newStatus = !moderationJob.is_active;

        setSubmittingModeration(true);
        try {
            await moderateAdminJob(moderationJob.id, newStatus, moderationReason);
            toast.success(
                `Job '${moderationJob.title}' has been ${newStatus ? 'activated' : 'deactivated'}.`
            );
            setModerationJob(null);
            fetchJobs();
        } catch (err) {
            console.error('Moderation failed:', err);
            const msg =
                err.response?.data?.detail ||
                err.response?.data?.message ||
                'Failed to update job moderation status.';
            toast.error(msg);
        } finally {
            setSubmittingModeration(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Job Moderation</h2>
                    <p className="text-sm font-medium text-slate-500">
                        Review, inspect, and moderate recruiter job postings ({totalCount} total).
                    </p>
                </div>
                <button
                    onClick={() => {
                        setPage(1);
                        fetchJobs();
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors cursor-pointer"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin text-indigo-600' : ''} />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Search and Filters Bar */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col md:flex-row items-center gap-3">
                <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by job title, description, company, or recruiter..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                    />
                </form>

                <div className="w-full md:w-44">
                    <select
                        value={activeFilter}
                        onChange={(e) => {
                            setActiveFilter(e.target.value);
                            setPage(1);
                        }}
                        className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
                    >
                        <option value="">All Job Statuses</option>
                        <option value="true">Active Only</option>
                        <option value="false">Inactive Only</option>
                    </select>
                </div>
            </div>

            {/* Jobs Table */}
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 mb-3" />
                        <p className="text-sm text-slate-500 font-medium">Loading job records...</p>
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="p-12 text-center">
                        <Briefcase size={36} className="mx-auto text-slate-300 mb-3" />
                        <h4 className="text-base font-bold text-slate-800">No Jobs Found</h4>
                        <p className="text-xs text-slate-400 mt-1">Try refining your search terms or active filters.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                <tr>
                                    <th className="py-3.5 pl-6">Job Title & Type</th>
                                    <th className="py-3.5">Company / Recruiter</th>
                                    <th className="py-3.5">Applications</th>
                                    <th className="py-3.5">Status</th>
                                    <th className="py-3.5">Created Date</th>
                                    <th className="py-3.5 pr-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                {jobs.map((job) => (
                                    <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                                        {/* Title */}
                                        <td className="py-3.5 pl-6 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900">{job.title}</span>
                                                <span className="text-[11px] text-slate-400">{job.type || 'Full Time'}</span>
                                            </div>
                                        </td>

                                        {/* Recruiter / Company */}
                                        <td className="py-3.5 whitespace-nowrap text-slate-600">
                                            <div className="font-semibold text-slate-800">
                                                {job.company_name || 'Individual Recruiter'}
                                            </div>
                                            <div className="text-[11px] text-slate-400">
                                                By: {job.recruiter_username} ({job.recruiter_email})
                                            </div>
                                        </td>

                                        {/* Applications */}
                                        <td className="py-3.5 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 text-[11px] font-bold">
                                                <Users size={12} /> {job.application_count || 0}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="py-3.5 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${job.is_active
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                                    }`}
                                            >
                                                {job.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>

                                        {/* Created Date */}
                                        <td className="py-3.5 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                                            {new Date(job.created_at).toLocaleDateString()}
                                        </td>

                                        {/* Actions */}
                                        <td className="py-3.5 pr-6 whitespace-nowrap text-right space-x-2">
                                            <button
                                                onClick={() => handleOpenDetail(job)}
                                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                                            >
                                                <Eye size={12} /> View
                                            </button>

                                            {canModerateJobs && (
                                                <button
                                                    onClick={() => handleOpenModeration(job)}
                                                    className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${job.is_active
                                                        ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                                                        : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                                                        }`}
                                                >
                                                    {job.is_active ? 'Deactivate' : 'Reactivate'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination Controls */}
                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-3">
                    <span className="text-xs text-slate-500">
                        Page <span className="font-bold">{page}</span> of{' '}
                        <span className="font-bold">{totalPages}</span>
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(p - 1, 1))}
                            disabled={page <= 1}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={14} /> Previous
                        </button>
                        <button
                            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                            disabled={page >= totalPages}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                        >
                            Next <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Job Details Modal */}
            {selectedJob && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
                    onClick={() => setSelectedJob(null)}
                >
                    <div
                        className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                            <div className="flex items-center gap-2.5">
                                <div
                                    className="flex h-10 w-10 items-center justify-center rounded-2xl text-white font-bold"
                                    style={{ background: T.primary }}
                                >
                                    <Briefcase size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-base">{selectedJob.title}</h3>
                                    <p className="text-xs text-slate-400">
                                        {selectedJob.company_name || selectedJob.recruiter_username}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedJob(null)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {detailLoading ? (
                            <div className="py-8 text-center text-xs text-slate-400">Loading job details...</div>
                        ) : (
                            <div className="space-y-4 text-xs">
                                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                                    <div>
                                        <span className="text-slate-400 block font-medium">Job Status</span>
                                        <span
                                            className={`font-bold ${selectedJob.is_active ? 'text-emerald-600' : 'text-rose-600'
                                                }`}
                                        >
                                            {selectedJob.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block font-medium">Applications</span>
                                        <span className="font-bold text-slate-800">
                                            {selectedJob.application_count || 0} received
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block font-medium">Salary</span>
                                        <span className="font-bold text-slate-800">
                                            {selectedJob.salary || 'Not specified'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block font-medium">Posted Date</span>
                                        <span className="font-bold text-slate-800">
                                            {new Date(selectedJob.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-bold text-slate-800 mb-1.5">Description</h4>
                                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 text-slate-600 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                                        {selectedJob.description || 'No description provided.'}
                                    </div>
                                </div>

                                {selectedJob.required_skills && selectedJob.required_skills.length > 0 && (
                                    <div>
                                        <h4 className="font-bold text-slate-800 mb-1.5">Required Skills</h4>
                                        <div className="flex flex-wrap gap-1.5">
                                            {selectedJob.required_skills.map((skill, idx) => (
                                                <span
                                                    key={idx}
                                                    className="rounded-lg bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-[11px] font-semibold text-indigo-700"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Moderation Confirmation Modal */}
            {moderationJob && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                    onClick={() => !submittingModeration && setModerationJob(null)}
                >
                    <div
                        className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div
                                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${moderationJob.is_active
                                    ? 'bg-rose-100 text-rose-600'
                                    : 'bg-emerald-100 text-emerald-600'
                                    }`}
                            >
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-base">
                                    {moderationJob.is_active ? 'Deactivate Job Posting' : 'Reactivate Job Posting'}
                                </h3>
                                <p className="text-xs text-slate-400 truncate max-w-xs">{moderationJob.title}</p>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3.5 mb-4 text-xs text-amber-900 leading-relaxed">
                            <span className="font-bold block mb-0.5">Application Data Integrity Protected:</span>
                            {moderationJob.is_active
                                ? 'Deactivating this job hides it from candidate search. All existing candidate submissions and AI evaluations are permanently preserved without deletion.'
                                : 'Reactivating this job makes it visible again to job seekers on the platform.'}
                        </div>

                        <div className="mb-5">
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                Moderation reason for audit log:
                            </label>
                            <textarea
                                value={moderationReason}
                                onChange={(e) => setModerationReason(e.target.value)}
                                placeholder="E.g., Inappropriate content, duplicate posting, policy review..."
                                rows={3}
                                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                disabled={submittingModeration}
                                onClick={() => setModerationJob(null)}
                                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={submittingModeration}
                                onClick={handleConfirmModeration}
                                className={`rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md transition-all cursor-pointer disabled:opacity-50 ${moderationJob.is_active
                                    ? 'bg-rose-600 hover:bg-rose-700'
                                    : 'bg-emerald-600 hover:bg-emerald-700'
                                    }`}
                            >
                                {submittingModeration
                                    ? 'Updating...'
                                    : moderationJob.is_active
                                        ? 'Confirm Deactivation'
                                        : 'Confirm Reactivation'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminJobsPage;
