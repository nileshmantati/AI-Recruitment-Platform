import { T } from '../../Js/theme.js';
import { ArrowLeft, User, Briefcase, Star, CheckCircle, XCircle, Calendar } from 'lucide-react';

const ApplicationDetails = ({ setSelectedApp, app, updatingStatus, handleUpdateStatus, getTimeAgo, getScoreColor, getStatusStyle, formatStatus }) => {
    return (
        <>
            <main className="flex-1 pb-12">
                <div className="mx-auto max-w-4xl space-y-6 p-6 lg:p-8">
                    <button onClick={() => setSelectedApp(null)}
                        className="flex items-center px-2 py-1.5 mb-3 border border-black outline-none rounded-lg! cursor-pointer gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition">
                        <ArrowLeft size={16} /> Back to Applications
                    </button>

                    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                        <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${T.primary}, ${T.accent})` }} />

                        <div className="p-6 lg:p-8">
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-white shadow-xl"
                                        style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>
                                        <User size={25} />
                                    </div>
                                    <div className='flex-1 justify-center'>
                                        <h4 className="text-lg mb-0 font-extrabold capitalize text-slate-900 tracking-tight">{app.candidate_name}</h4>
                                        <p className="text-sm mb-0 font-medium text-slate-500 flex items-center gap-2">
                                            <Briefcase size={14} className="text-indigo-500" /> Applied for: <span className="font-bold text-slate-700">{app.job_details?.title}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1.5 text-xs font-bold rounded-lg border uppercase tracking-wider ${getStatusStyle(app.status)}`}>
                                        {formatStatus(app.status)}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                                <div className="rounded-xl bg-slate-50 px-3 py-2 border border-slate-100">
                                    <p className="text-[11px] mb-1.5 font-bold uppercase tracking-wider text-slate-400">AI Score</p>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-black px-2 py-1 rounded-lg border ${getScoreColor(app.resume_score)}`}>
                                            {app.resume_score}%
                                        </span>
                                    </div>
                                </div>
                                <div className="rounded-xl bg-slate-50 px-3 py-2 border border-slate-100">
                                    <p className="text-[11px] mb-1.5 font-bold uppercase tracking-wider text-slate-400">Applied</p>
                                    <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                        <Calendar size={14} className="text-slate-400" /> {getTimeAgo(app.applied_at)}
                                    </p>
                                </div>
                            </div>

                            <div className="mb-8">
                                <h4 className="text-lg! font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <Star size={20} className="text-amber-500" /> AI Feedback Analysis
                                </h4>
                                {app.ai_feedback ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5">
                                            <h5 className="text-lg! font-bold uppercase tracking-wider text-green-600 mb-3 flex items-center gap-1.5">
                                                <CheckCircle size={20} className="text-green-500" /> Strengths
                                            </h5>
                                            <ul className="space-y-2 text-sm text-slate-600 list-disc list-inside">
                                                {(app.ai_feedback.strengths || []).map((s, i) => (
                                                    <li key={i}>{s}</li>
                                                ))}
                                                {!app.ai_feedback.strengths?.length && <li>No specific strengths highlighted.</li>}
                                            </ul>
                                        </div>
                                        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5">
                                            <h5 className="text-lg! font-bold uppercase tracking-wider text-amber-600 mb-3 flex items-center gap-1.5">
                                                <XCircle size={20} className="text-amber-500" /> Areas for Improvement
                                            </h5>
                                            <ul className="space-y-2 text-sm text-slate-600 list-disc list-inside">
                                                {(app.ai_feedback.weaknesses || []).map((w, i) => (
                                                    <li key={i}>{w}</li>
                                                ))}
                                                {!app.ai_feedback.weaknesses?.length && <li>No significant weaknesses found.</li>}
                                            </ul>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">
                                        AI analysis is still pending or not available for this application.
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-slate-100 pt-6">
                                <div className="flex flex-wrap items-center gap-3">
                                    <button onClick={() => handleUpdateStatus(app.id, 'SHORTLISTED')} disabled={updatingStatus || app.status === 'SHORTLISTED'}
                                        className="flex items-center gap-2 rounded-xl! bg-green-100 border border-green-200 px-5 py-2.5 text-sm font-bold text-green-600 transition hover:bg-green-200 disabled:opacity-50">
                                        <CheckCircle size={16} /> Shortlist
                                    </button>
                                    <button onClick={() => handleUpdateStatus(app.id, 'REJECTED')} disabled={updatingStatus || app.status === 'REJECTED'}
                                        className="flex items-center gap-2 rounded-xl! bg-red-100 border border-red-200 px-5 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-200 disabled:opacity-50">
                                        <XCircle size={16} /> Reject
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}

export default ApplicationDetails