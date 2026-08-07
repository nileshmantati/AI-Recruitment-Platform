import {
    ShieldCheck, Briefcase, X, Bot, Check, Sparkles,
    Layers, CheckCircle, Search, AlertCircle, MessageSquare, Copy
} from 'lucide-react';

const CandidateDeepDiveDrawer = ({
    candidate,
    onClose,
    getScoreBadge,
    statusChoices,
    updatingId,
    onUpdateStatus,
    onPromptClick,
    onCopyBrief
}) => {
    if (!candidate) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn"
                onClick={onClose}
            ></div>

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
                <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col justify-between overflow-hidden relative transform transition-transform duration-300 animate-slideLeft">

                    {/* Drawer Top Gradient Bar */}
                    <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 shrink-0"></div>

                    {/* Header Section */}
                    <div className="px-6 pt-4 pb-0 sm:p-8 border-b border-slate-200/80 bg-slate-50/50 flex items-start justify-between gap-4 shrink-0">
                        <div className="space-y-1.5 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight capitalize truncate">
                                    {candidate.name}
                                </h2>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center gap-1">
                                    <ShieldCheck size={12} className="text-indigo-600" /> AI Verified
                                </span>
                            </div>
                            <p className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                                <Briefcase size={15} className="text-slate-400 shrink-0" />
                                <span>{candidate.role}</span>
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-2.5 rounded-lg bg-slate-100 hover:bg-slate-200/90 text-slate-500 hover:text-slate-800 transition-colors shrink-0"
                            title="Close Drawer"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Scrollable Main Deep-Dive Content */}
                    <div className="px-6 pt-3 pb-7 sm:p-8 overflow-y-auto space-y-7 flex-1">

                        {/* AI Score & Evaluation Dark Hub */}
                        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-7 text-white shadow-xl shadow-indigo-950/20 border border-slate-800 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-56 h-56 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>

                            <div className="flex flex-col sm:flex-row items-start justify-between gap-6 relative z-10">
                                <div className="space-y-3 text-left">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                                        <Bot size={14} className="text-indigo-400" /> Neural Assessment Matrix
                                    </div>
                                    <h4 className="text-2xl font-black text-white tracking-tight">
                                        {getScoreBadge(candidate.score).tier}
                                    </h4>
                                    <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-md">
                                        {candidate.summary}
                                    </p>
                                </div>

                                {/* Radial Score Box */}
                                <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white/5 border border-white/15 backdrop-blur-md shrink-0 w-36 h-36">
                                    <span className="text-4xl font-black tracking-tight text-white mb-1">
                                        {candidate.score}%
                                    </span>
                                    <span className="text-[10px] font-extrabold uppercase text-indigo-300 tracking-wider">
                                        Match Index
                                    </span>
                                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full"
                                            style={{ width: `${candidate.score}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-5 border-t border-slate-800 text-xs">
                                <div className="flex items-center gap-2 text-slate-300 font-semibold">
                                    <Check size={16} className="text-emerald-400 shrink-0" />
                                    <span>High role skill correlation</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-300 font-semibold">
                                    <Sparkles size={16} className="text-amber-400 shrink-0" />
                                    <span>Ranked among talent pool</span>
                                </div>
                            </div>
                        </div>

                        {/* Pipeline Progression Control */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                <Layers size={15} className="text-indigo-600" /> Recruitment Pipeline Stage
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {statusChoices.map(s => {
                                    const isSelected = candidate.status === s.value;
                                    const isUpdating = updatingId === candidate.id;
                                    return (
                                        <button
                                            key={s.value}
                                            type="button"
                                            disabled={isUpdating}
                                            onClick={() => onUpdateStatus(candidate.id, s.value)}
                                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold uppercase tracking-wider border cursor-pointer shadow-2xs hover:shadow-sm active:scale-[0.98] transition-all ${isSelected ? s.bg : 'bg-slate-100 text-slate-700 border-slate-300'
                                                }${isUpdating ? 'opacity-50 pointer-events-none animate-pulse' : ''}`}
                                            title="Change application status"
                                        >
                                            <span>{s.label}</span>
                                            {isSelected && <Check size={15} className="text-white shrink-0" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Competencies Showcase */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                <CheckCircle size={15} className="text-emerald-600" /> Verified Competencies ({candidate.strengths?.length || 0})
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {(candidate.strengths?.length > 0) ? (
                                    candidate.strengths.map((skill, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => {
                                                onClose();
                                                onPromptClick(skill);
                                            }}
                                            className="px-3.5 py-2 text-start rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100 hover:shadow-xs transition-all flex items-center gap-1.5 group"
                                            title="Click to filter entire pool by this competence"
                                        >
                                            <CheckCircle size={13} className="text-emerald-600 shrink-0" />
                                            <span>{skill}</span>
                                            <Search size={11} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-xs text-slate-400 font-medium italic">No distinct core technical strengths parsed.</p>
                                )}
                            </div>
                        </div>

                        {/* Missing Competencies & AI Advice */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                <AlertCircle size={15} className="text-rose-500" /> Identified Competency Gaps ({candidate.missing_skills?.length || 0})
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {(candidate.missing_skills?.length > 0) ? (
                                    candidate.missing_skills.map((skill, i) => (
                                        <span key={i}
                                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200/80 flex items-center gap-1.5">
                                            <AlertCircle size={13} className="text-rose-500 shrink-0" />
                                            <span>{skill}</span>
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-xs text-emerald-600 font-semibold bg-emerald-50/50 p-3 rounded-xl border border-emerald-200/50">
                                        🎉 Zero significant skill gaps identified for this role specification!
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Tailored Interview Guide Card */}
                        <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-200/70 space-y-3">
                            <h5 className="text-xs font-semibold uppercase tracking-wider text-indigo-900 flex items-center gap-2">
                                <MessageSquare size={16} className="text-indigo-600" /> Recommended Interview Focus
                            </h5>
                            <ul className="space-y-2 text-xs font-semibold text-indigo-950/90 list-disc pl-4 leading-relaxed">
                                {candidate.strengths?.length > 0 && (
                                    <li>Verify leadership and high-scale technical execution within <span className="font-bold">{candidate.strengths[0]}</span> architectures.</li>
                                )}
                                {candidate.missing_skills?.length > 0 && (
                                    <li>Assess willingness and foundational familiarity to bridge gaps in <span className="font-bold text-rose-700">{candidate.missing_skills[0]}</span>.</li>
                                )}
                                <li>Evaluate behavioral alignment with team pacing and system design problem-solving strategies.</li>
                            </ul>
                        </div>

                    </div>

                    {/* Action Footer */}
                    <div className="px-6 py-4 border-t border-slate-200/80 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={() => onCopyBrief(candidate)}
                            className="px-4 py-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-300 shadow-2xs hover:shadow-xs active:scale-[0.98] transition-all flex items-center gap-2"
                        >
                            <Copy size={15} className="text-slate-500" /> Copy AI Brief
                        </button>

                        <div className="flex items-center gap-2.5">
                            {candidate.status !== 'SHORTLISTED' && (
                                <button
                                    type="button"
                                    onClick={() => onUpdateStatus(candidate.id, 'SHORTLISTED')}
                                    className="px-3 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all flex items-center gap-1.5"
                                >
                                    <Check size={15} /> Fast-Track Shortlist
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md active:scale-[0.98] transition-all"
                            >
                                Done
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CandidateDeepDiveDrawer;
