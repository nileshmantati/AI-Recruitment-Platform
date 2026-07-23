import { T } from "../../Js/theme";
import { ArrowLeft, User, Link, Globe, FileText, Star, Briefcase } from "lucide-react";

const CandidateDetails = ({ candidate, setSelectedCandidate, getStatusStyle, formatStatus }) => {
    const c = candidate;
    const details = c.details;
    return (
        <>
            <main className="flex-1 pb-12">
                <div className="mx-auto max-w-5xl space-y-6 p-6 lg:p-8">
                    <button onClick={() => setSelectedCandidate(null)}
                        className="flex items-center px-2 py-1.5 mb-3 border border-black outline-none rounded-lg! cursor-pointer gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition">
                        <ArrowLeft size={16} /> Back to Candidates
                    </button>

                    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                        <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${T.primary}, ${T.accent})` }} />

                        <div className="p-6 lg:p-8">
                            {/* Header: Avatar, Name, Basic Info */}
                            <div className="flex flex-col md:flex-row gap-6 mb-8 items-start md:items-center">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-white shadow-xl"
                                    style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>
                                    <User size={25} />
                                </div>
                                <div className="flex-1 justify-center">
                                    <h4 className="text-lg mb-0 font-extrabold capitalize text-slate-900 tracking-tight">{c.name}</h4>
                                    <p className="mb-0 text-sm text-slate-500 font-medium">
                                        {details.experience ? `${details.experience} of experience` : 'Experience not specified'}
                                    </p>

                                    <div className="flex flex-wrap gap-3">
                                        {details.github_url && (
                                            <a href={details.github_url} target="_blank" rel="noreferrer"
                                                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition shadow-sm">
                                                <Link size={14} /> GitHub Profile
                                            </a>
                                        )}
                                        {details.portfolio_url && (
                                            <a href={details.portfolio_url} target="_blank" rel="noreferrer"
                                                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition shadow-sm">
                                                <Globe size={14} /> Portfolio Site
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Bio & Skills */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                                <div className="col-span-2 space-y-8">
                                    <div>
                                        <h4 className="text-lg! font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                                            <FileText size={20} className="text-indigo-500" /> About Candidate
                                        </h4>
                                        <p className="text-base text-slate-700 leading-relaxed bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                            {details.bio || "No professional summary provided."}
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="text-lg! font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                                            <Star size={20} className="text-amber-500" /> Skills & Expertise
                                        </h4>
                                        <div className="flex flex-wrap gap-2.5">
                                            {details.skills && details.skills.length > 0 ? (
                                                details.skills.map((skill, idx) => (
                                                    <span key={idx} className="rounded-xl bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 border border-indigo-100/50 shadow-sm">
                                                        {skill}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-base text-slate-500">No skills listed.</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Applications Summary for this Candidate */}
                                <div className="space-y-4">
                                    <h4 className="text-lg! font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                                        <Briefcase size={20} className="text-emerald-500" /> Applied Jobs
                                    </h4>

                                    <div className="flex flex-col gap-4 overflow-hidden">
                                        {c.applications.map(app => (
                                            <div key={app.id} className="rounded-2xl border border-slate-200 bg-white hover:bg-gray-100! ps-3 pe-2 py-2 shadow-sm relative overflow-hidden transition hover:shadow-md">
                                                <div className="absolute left-0 top-0 w-1.5 h-full" style={{ background: T.primary }}></div>
                                                <h6 className="font-bold text-slate-900 text-lg! truncate pr-4 capitalize">{app.job_details?.title}</h6>

                                                <div className="mt-3 flex items-center justify-between">
                                                    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg uppercase tracking-wide ${getStatusStyle(app.status)}`}>
                                                        {formatStatus(app.status)}
                                                    </span>
                                                    <span className="text-sm font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-lg">
                                                        AI Score: {app.resume_score}%
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}

export default CandidateDetails