import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { T } from '../../Js/theme.js';
import PostJobModal from '../Modals/PostJobModal';
import {
    Briefcase, Plus, Search, Filter, Users, IndianRupee,
    ChevronDown, Eye, Edit3, Trash2
} from 'lucide-react';
import RecruiterEditJob from './RecruiterEditJob';
import toast from 'react-hot-toast';

const SORT_OPTIONS = ['Newest First', 'Most Applicants', 'Salary (High)', 'Salary (Low)'];

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

const RecruiterJobsPage = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('Newest First');
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [showPostModal, setShowPostModal] = useState(false);

    const [selectedJob, setSelectedJob] = useState(null);
    const [deleting, setDeleting] = useState(null);

    const [editingJob, setEditingJob] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [saving, setSaving] = useState(false);
    const fetchJobs = async () => {
        try {
            const res = await api.get('jobs/my/');
            setJobs(res.data);
        } catch (err) {
            console.error('Failed to load jobs', err);
            toast.error('Failed to load jobs.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchJobs();
    }, []);

    const startEditing = (job) => {
        setEditingJob(job.id);
        setEditForm({
            title: job.title || '',
            description: job.description || '',
            salary: job.salary || '',
            required_skills: Array.isArray(job.required_skills)
                ? job.required_skills.join(', ')
                : (job.required_skills || ''),
        });
    };

    const cancelEditing = () => { setEditingJob(null); setEditForm({}); };

    const handleSaveEdit = async (jobId) => {
        setSaving(true);
        try {
            const payload = {
                ...editForm,
                required_skills: editForm.required_skills.split(',').map(s => s.trim()).filter(Boolean),
            };
            const res = await api.patch(`jobs/${jobId}/`, payload);
            setJobs(prev => prev.map(j => j.id === jobId ? { ...j, ...res.data } : j));
            if (selectedJob?.id === jobId) setSelectedJob({ ...selectedJob, ...res.data });
            setEditingJob(null);
        } catch (err) {
            console.error('Failed to update', err);
            toast.error('Could not save changes.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (jobId) => {
        if (!confirm('Are you sure you want to delete this job posting?')) return;
        setDeleting(jobId);
        try {
            await api.delete(`jobs/${jobId}/`);
            setJobs(prev => prev.filter(j => j.id !== jobId));
            if (selectedJob?.id === jobId) setSelectedJob(null);
        } catch (err) {
            console.error('Failed to delete', err);
            toast.error('Could not delete job.');
        } finally {
            setDeleting(null);
        }
    };

    const getSkills = (job) => Array.isArray(job.required_skills)
        ? job.required_skills
        : (job.required_skills || '').split(',').map(s => s.trim()).filter(Boolean);

    const filteredJobs = useMemo(() => {
        let result = [...jobs];
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(j =>
                j.title?.toLowerCase().includes(q) ||
                j.description?.toLowerCase().includes(q) ||
                (Array.isArray(j.required_skills) && j.required_skills.some(s => s.toLowerCase().includes(q)))
            );
        }
        switch (sortBy) {
            case 'Most Applicants': result.sort((a, b) => (b.applicants || 0) - (a.applicants || 0)); break;
            case 'Salary (High)': result.sort((a, b) => parseFloat(b.salary || 0) - parseFloat(a.salary || 0)); break;
            case 'Salary (Low)': result.sort((a, b) => parseFloat(a.salary || 0) - parseFloat(b.salary || 0)); break;
            default: result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        }
        return result;
    }, [jobs, searchQuery, sortBy]);

    if (loading) {
        return (
            <div className="flex h-[85vh] w-full items-center justify-center bg-slate-50/50">
                <div className="flex flex-col items-center gap-4 text-center p-8 max-w-sm">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
                        <i className="bi bi-robot text-indigo-600 text-3xl"></i>
                    </div>
                    <div>
                        <h4 className="font-extrabold text-slate-800 text-lg">Loading your jobs...</h4>
                    </div>
                </div>
            </div>
        );
    }

    if (selectedJob) {
        return (
            <RecruiterEditJob
                selectedJob={selectedJob}
                setSelectedJob={setSelectedJob}
                isEditing={editingJob === selectedJob.id}
                editForm={editForm}
                setEditForm={setEditForm}
                saving={saving}
                deleting={deleting}
                getTimeAgo={getTimeAgo}
                getSkills={getSkills}
                startEditing={startEditing}
                cancelEditing={cancelEditing}
                handleSaveEdit={handleSaveEdit}
                handleDelete={handleDelete}
            />
        );
    }

    return (
        <>
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
                                <Briefcase className="text-indigo-500" size={24} />
                                My Job Postings
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">Manage and track all posted jobs.</p>
                        </div>
                    </motion.div>

                    {/* Search / Sort bar */}
                    <motion.div variants={itemVariants} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-indigo-400 transition-all sm:w-80 shadow-sm w-full">
                            <Search size={16} className="text-slate-400 shrink-0" />
                            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search by title or skill..."
                                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
                        </div>
                        <div className="flex w-full justify-between flex-wrap gap-2 sm:w-auto sm:justify-end">
                            <div className="relative flex-1 sm:flex-none">
                                <button onClick={() => setShowSortDropdown(!showSortDropdown)}
                                    className="flex w-full items-center justify-center gap-1.5 rounded-lg! border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition shadow-sm sm:w-auto sm:py-2">
                                    <Filter size={13} /> <span className="truncate text-sm max-w-[80px] sm:max-w-none">{sortBy}</span>
                                    <ChevronDown size={13} className={`transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                                </button>
                                {showSortDropdown && (
                                    <div className="absolute left-0 sm:right-0 sm:left-auto top-12 z-20 w-44 overflow-hidden rounded-xl border border-slate-100 bg-white py-1 shadow-xl">
                                        {SORT_OPTIONS.map(opt => (
                                            <button key={opt} onClick={() => { setSortBy(opt); setShowSortDropdown(false); }}
                                                className={`w-full px-3 py-2 text-left text-sm transition ${sortBy === opt ? 'bg-indigo-50 font-semibold text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button onClick={() => setShowPostModal(true)}
                                className="group flex flex-1 items-center justify-center gap-1.5 rounded-xl! px-3 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl sm:flex-none sm:px-5 sm:gap-2"
                                style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>
                                <Plus size={18} className="transition-transform duration-300 group-hover:rotate-90 shrink-0" />
                                <span className="whitespace-nowrap">Post Job</span>
                            </button>
                        </div>
                    </motion.div>

                    {/* Results count */}
                    <motion.p variants={itemVariants} className="text-sm font-medium text-slate-400">
                        Showing <span className="text-slate-700">{filteredJobs.length}</span> of <span className="text-slate-700">{jobs.length}</span> jobs
                    </motion.p>

                    {/* Jobs List */}
                    {filteredJobs.length > 0 ? (
                        <>
                            {/* Mobile Card View (visible only < md) */}
                            <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 md:hidden">
                                {filteredJobs.map((job) => {
                                    const skills = getSkills(job);
                                    return (
                                        <div key={job.id} className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
                                                        style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>
                                                        <Briefcase size={18} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold capitalize text-slate-900 leading-tight line-clamp-1">{job.title}</h3>
                                                        <p className="text-[11px] font-medium text-slate-400 mt-0.5">{getTimeAgo(job.created_at)}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 mt-1">
                                                <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs">
                                                    <IndianRupee size={12} className="text-green-500 shrink-0" />
                                                    <span className="font-semibold text-slate-700 truncate">{job.salary || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs">
                                                    <Users size={12} className="text-indigo-500 shrink-0" />
                                                    <span className="font-semibold text-slate-700 truncate">{job.applicants ?? 0} Apps</span>
                                                </div>
                                            </div>

                                            {skills.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mt-1">
                                                    {skills.slice(0, 3).map((s, i) => (
                                                        <span key={i} className="rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase"
                                                            style={{ background: `${T.primary}10`, color: T.primary }}>{s}</span>
                                                    ))}
                                                    {skills.length > 3 && (
                                                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">+{skills.length - 3}</span>
                                                    )}
                                                </div>
                                            )}

                                            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                                                <button onClick={() => setSelectedJob(job)}
                                                    className="flex flex-1 items-center justify-center gap-1 rounded-lg! py-1.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50">
                                                    <Eye size={14} />
                                                </button>
                                                <div className="mx-1 h-4 w-px bg-slate-200"></div>
                                                <button onClick={() => { setSelectedJob(job); startEditing(job); }}
                                                    className="flex flex-1 items-center justify-center gap-1 rounded-lg! py-1.5 text-xs font-semibold text-yellow-600 transition hover:bg-yellow-50">
                                                    <Edit3 size={14} />
                                                </button>
                                                <div className="mx-1 h-4 w-px bg-slate-200"></div>
                                                <button onClick={() => handleDelete(job.id)} disabled={deleting === job.id}
                                                    className="flex flex-1 items-center justify-center gap-1 rounded-lg! py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-50">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </motion.div>

                            {/* Desktop Table View (visible md+) */}
                            <motion.div variants={itemVariants} className="hidden md:block overflow-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/80">
                                            <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Job Title</th>
                                            <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Skills</th>
                                            <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Salary</th>
                                            <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 text-center">Applicants</th>
                                            <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 hidden lg:table-cell">Posted</th>
                                            <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-400 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredJobs.map((job, idx) => {
                                            const skills = getSkills(job);
                                            return (
                                                <tr key={job.id}
                                                    className={`border-b border-slate-50 transition hover:bg-slate-50/60 ${idx % 2 === 0 ? '' : 'bg-slate-25'}`}>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white"
                                                                style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>
                                                                <Briefcase size={14} />
                                                            </div>
                                                            <span className="font-semibold capitalize text-slate-800 truncate max-w-[200px]">{job.title}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex flex-wrap gap-1">
                                                            {skills.slice(0, 3).map((s, i) => (
                                                                <span key={i} className="rounded-md px-2 py-0.5 text-[11px] font-medium"
                                                                    style={{ background: `${T.primary}10`, color: T.primary }}>{s}</span>
                                                            ))}
                                                            {skills.length > 3 && (
                                                                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">+{skills.length - 3}</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span className="flex items-center gap-1 text-sm font-medium text-slate-700">
                                                            <IndianRupee size={13} className="text-green-500" />{job.salary || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 text-center">
                                                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold"
                                                            style={{ background: `${T.accent}12`, color: T.accent }}>
                                                            <Users size={12} /> {job.applicants ?? 0}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 text-sm text-slate-400 hidden lg:table-cell">{getTimeAgo(job.created_at)}</td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <button onClick={() => setSelectedJob(job)} title="View Details"
                                                                className="h-8 w-8 flex items-center justify-center rounded-lg! bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition">
                                                                <Eye size={15} />
                                                            </button>
                                                            <button onClick={() => { setSelectedJob(job); startEditing(job); }} title="Edit"
                                                                className="h-8 w-8 flex items-center justify-center rounded-lg! bg-amber-50 hover:bg-amber-100 text-amber-600 transition">
                                                                <Edit3 size={15} />
                                                            </button>
                                                            <button onClick={() => handleDelete(job.id)} title="Delete"
                                                                disabled={deleting === job.id}
                                                                className="h-8 w-8 flex items-center justify-center rounded-lg! bg-red-50 hover:bg-red-100 text-red-500 transition">
                                                                <Trash2 size={15} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </motion.div>
                        </>
                    ) : (
                        <motion.div variants={itemVariants} className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20 px-6 text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: `${T.primary}10` }}>
                                <Briefcase size={28} style={{ color: T.primary }} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">
                                {searchQuery ? 'No matching jobs found' : 'No jobs posted yet'}
                            </h3>
                            <p className="mt-2 max-w-sm text-sm text-slate-500">
                                {searchQuery ? 'Try adjusting your search.' : 'Post your first job to start receiving applications.'}
                            </p>
                            {!searchQuery && (
                                <button onClick={() => setShowPostModal(true)}
                                    className="mt-6 flex items-center gap-2 rounded-xl! px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5"
                                    style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>
                                    <Plus size={16} /> Post Your First Job
                                </button>
                            )}
                        </motion.div>
                    )}
                </div>
            </motion.main>

            <PostJobModal show={showPostModal} handleClose={() => setShowPostModal(false)} onJobPosted={fetchJobs} />
        </>
    );
};

export default RecruiterJobsPage;
