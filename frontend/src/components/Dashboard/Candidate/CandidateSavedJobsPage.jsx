import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, Briefcase, Clock, IndianRupee, Search, BookmarkX } from 'lucide-react';
import { T } from '../../../Js/theme';
import toast from 'react-hot-toast';

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };

const STORAGE_KEY = 'candidate_saved_jobs';

const getTimeAgo = (date) => {
    if (!date) return 'Recently';
    const d = Math.floor((Date.now() - new Date(date)) / 864e5);
    if (d === 0) return 'Today'; if (d === 1) return 'Yesterday';
    if (d < 7) return `${d}d ago`;
    return new Date(date).toLocaleDateString();
};

const CandidateSavedJobsPage = () => {
    const [savedJobs, setSavedJobs] = useState(() => {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
        catch { return []; }
    });
    const [search, setSearch] = useState('');

    const removeSaved = (id) => {
        const updated = savedJobs.filter(j => j.id !== id);
        setSavedJobs(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        toast.success('Job removed from saved list.');
    };

    const filtered = search
        ? savedJobs.filter(j => j.title?.toLowerCase().includes(search.toLowerCase()) || j.recruiter_name?.toLowerCase().includes(search.toLowerCase()))
        : savedJobs;


    return (
        <motion.main variants={container} initial="hidden" animate="show"
            className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
            {/* Header */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900">Saved Jobs</h1>
                    <p className="mt-1 text-sm sm:text-base text-slate-500">{savedJobs.length} job{savedJobs.length !== 1 ? 's' : ''} saved for later</p>
                </div>
            </motion.div>

            {/* Search */}
            {savedJobs.length > 0 && (
                <motion.div variants={fadeUp} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-indigo-400 transition-all">
                    <Search size={16} className="text-slate-400 shrink-0" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search saved jobs..."
                        className="w-full bg-transparent text-sm sm:text-base outline-none text-slate-700 placeholder:text-slate-400" />
                </motion.div>
            )}

            {/* Jobs Grid */}
            {filtered.length === 0 ? (
                <motion.div variants={fadeUp} className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-24 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: `${T.primary}10` }}>
                        <Bookmark size={28} style={{ color: T.primary }} />
                    </div>
                    <h3 className="font-extrabold text-slate-800 text-lg sm:text-xl">{search ? 'No matching saved jobs' : 'No saved jobs yet'}</h3>
                    <p className="mt-2 max-w-sm text-sm sm:text-base text-slate-500">
                        {search ? 'Try a different search term.' : 'Browse the Jobs page and bookmark roles you\'re interested in.'}
                    </p>
                </motion.div>
            ) : (
                <motion.div variants={container} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {filtered.map(job => {
                        const skills = Array.isArray(job.required_skills)
                            ? job.required_skills
                            : (job.required_skills || '').split(',').map(s => s.trim()).filter(Boolean);
                        return (
                            <motion.div key={job.id} variants={fadeUp}
                                className="group relative flex flex-col rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-slate-200 overflow-hidden">
                                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-indigo-400/10 to-purple-400/10 blur-3xl pointer-events-none" />
                                <div className="flex flex-1 flex-col p-5">
                                    {/* Header */}
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white"
                                            style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>
                                            <Briefcase size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="truncate text-base sm:text-lg font-bold capitalize text-slate-900 group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                                            <p className="text-xs sm:text-sm text-slate-500">Posted by {job.recruiter_name}</p>
                                        </div>
                                        <button onClick={() => removeSaved(job.id)}
                                            className="shrink-0 text-slate-300 hover:text-red-500 transition" title="Remove">
                                            <BookmarkX size={18} />
                                        </button>
                                    </div>
                                    {/* Description */}
                                    <p className="mb-3 line-clamp-2 text-xs sm:text-sm leading-relaxed text-slate-600">
                                        {job.description || 'No description provided.'}
                                    </p>
                                    {/* Skills */}
                                    {skills.length > 0 && (
                                        <div className="mb-3 flex flex-wrap gap-1.5">
                                            {skills.slice(0, 3).map((s, i) => (
                                                <span key={i} className="rounded-lg px-2.5 py-0.5 text-xs sm:text-sm font-semibold"
                                                    style={{ background: `${T.primary}12`, color: T.primary }}>{s}</span>
                                            ))}
                                            {skills.length > 3 && <span className="rounded-lg bg-slate-100 px-2.5 py-0.5 text-xs sm:text-sm font-semibold text-slate-500">+{skills.length - 3}</span>}
                                        </div>
                                    )}
                                    <div className="flex-1" />
                                    {/* Footer */}
                                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-2">
                                        <div className="flex items-center gap-3">
                                            {job.salary && (
                                                <span className="flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-0.5 text-xs sm:text-sm font-bold text-emerald-600">
                                                    <IndianRupee size={12} />{job.salary}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1 text-xs sm:text-sm text-slate-500">
                                                <Clock size={12} />{getTimeAgo(job.savedAt || job.created_at)}
                                            </span>
                                        </div>
                                        {job.type && (
                                            <span className="rounded-full px-2.5 py-0.5 text-xs sm:text-sm font-semibold"
                                                style={{ background: `${T.accent}15`, color: T.accent }}>{job.type}</span>
                                        )}
                                    </div>
                                    <button className="mt-3 w-full !rounded-xl py-2.5 text-xs sm:text-sm font-bold text-white transition hover:scale-95 shadow-sm"
                                        style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>
                                        Apply Now
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}
        </motion.main>
    );
};

export default CandidateSavedJobsPage;
