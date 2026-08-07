import { ArrowLeft, Briefcase, Clock, Edit3, Trash2, Save, X, Users, IndianRupee } from "lucide-react";
import { T } from "../../../Js/theme.js";

const RecruiterEditJob = ({
    selectedJob,
    setSelectedJob,
    isEditing,
    editForm,
    setEditForm,
    saving,
    deleting,
    getTimeAgo,
    getSkills,
    startEditing,
    cancelEditing,
    handleSaveEdit,
    handleDelete
}) => {
    if (!selectedJob) return null;

    const job = selectedJob;
    const skills = getSkills(job);

    return (
        <>
            <main className="flex-1 pb-12">
                <div className="space-y-6 p-6 lg:p-8">
                    {/* Back button */}
                    <button onClick={() => { setSelectedJob(null); cancelEditing(); }}
                        className="flex items-center px-2 py-1.5 mb-3 border border-black outline-none rounded-lg cursor-pointer gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition">
                        <ArrowLeft size={16} /> Back to Jobs
                    </button>

                    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                        {/* Header bar */}
                        <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${T.primary}, ${T.accent})` }} />

                        <div className="p-6 lg:p-8">
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-white shadow-lg"
                                        style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>
                                        <Briefcase size={24} />
                                    </div>
                                    <div>
                                        {isEditing ? (
                                            <input value={editForm.title}
                                                onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                                className="text-xl font-bold text-slate-900 border-b-2 border-indigo-400 bg-transparent outline-none pb-1 w-full" />
                                        ) : (
                                            <h2 className="text-xl font-extrabold capitalize text-slate-900">{job.title}</h2>
                                        )}
                                        <p className="mt-1 text-sm text-slate-400 flex items-center gap-3">
                                            <span className="flex items-center gap-1"><Clock size={13} /> Posted {getTimeAgo(job.created_at)}</span>
                                            <span className="flex items-center gap-1"><Users size={13} /> {job.applicants ?? 0} applicants</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div className="flex items-center gap-2">
                                    {isEditing ? (
                                        <>
                                            <button onClick={cancelEditing}
                                                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
                                                <X size={15} /> Cancel
                                            </button>
                                            <button onClick={() => handleSaveEdit(job.id)} disabled={saving}
                                                className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5"
                                                style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>
                                                <Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => startEditing(job)}
                                                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-yellow-600 hover:bg-yellow-100 transition">
                                                <Edit3 size={15} /> Edit
                                            </button>
                                            <button onClick={() => handleDelete(job.id)} disabled={deleting === job.id}
                                                className="flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-100 transition disabled:opacity-50">
                                                <Trash2 size={15} /> {deleting === job.id ? 'Deleting...' : 'Delete'}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                                <div className="rounded-xl bg-slate-50 p-3">
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Salary</p>
                                    {isEditing ? (
                                        <input value={editForm.salary}
                                            onChange={e => setEditForm({ ...editForm, salary: e.target.value })}
                                            className="mt-1 w-full text-sm font-bold text-slate-800 bg-white rounded-md border border-slate-200 px-2 py-1 outline-none focus:border-indigo-400" />
                                    ) : (
                                        <p className="mt-1 text-sm font-bold text-slate-800 flex items-center gap-1">
                                            <IndianRupee size={13} className="text-green-500" /> {job.salary || 'N/A'}
                                        </p>
                                    )}
                                </div>
                                <div className="rounded-xl bg-slate-50 p-3">
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Applicants</p>
                                    <p className="mt-1 text-sm font-bold text-slate-800">{job.applicants ?? 0}</p>
                                </div>
                                <div className="rounded-xl bg-slate-50 p-3">
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Status</p>
                                    <p className="mt-1 text-sm font-bold text-green-600">Active</p>
                                </div>
                                <div className="rounded-xl bg-slate-50 p-3">
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Type</p>
                                    <p className="mt-1 text-sm font-bold text-slate-800">{job.type || 'Full-time'}</p>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-6">
                                <h4 className="text-sm font-bold text-slate-700 mb-2">Job Description</h4>
                                {isEditing ? (
                                    <textarea value={editForm.description}
                                        onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                        rows={6}
                                        className="w-full rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none" />
                                ) : (
                                    <div className="rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">
                                        {job.description || 'No description provided.'}
                                    </div>
                                )}
                            </div>

                            {/* Skills */}
                            <div>
                                <h4 className="text-sm font-bold text-slate-700 mb-2">Required Skills</h4>
                                {isEditing ? (
                                    <input value={editForm.required_skills}
                                        onChange={e => setEditForm({ ...editForm, required_skills: e.target.value })}
                                        placeholder="Python, Django, React..."
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {skills.length > 0 ? skills.map((s, i) => (
                                            <span key={i} className="rounded-lg px-3 py-1.5 text-xs font-semibold"
                                                style={{ background: `${T.primary}12`, color: T.primary }}>
                                                {s}
                                            </span>
                                        )) : (
                                            <span className="text-sm text-slate-400">No skills specified</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}

export default RecruiterEditJob