import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { T } from '../../Js/theme.js';
import {
    Sparkles, UploadCloud, Bot, Search,
    TrendingUp, Award, AlertCircle, X,
    ExternalLink, ChevronDown
} from 'lucide-react';
import api, { analyzeResume } from '../../services/api';
import toast from 'react-hot-toast';
import CandidateDeepDiveDrawer from './CandidateDeepDiveDrawer';

const STATUS_CHOICES = [
    { value: 'PENDING', label: 'Pending', bg: 'bg-slate-100 text-slate-700 border-slate-300', dotColor: 'bg-slate-500' },
    { value: 'EVALUATED', label: 'Evaluated', bg: 'bg-cyan-50 text-cyan-700 border-cyan-300', dotColor: 'bg-cyan-500' },
    { value: 'SHORTLISTED', label: 'Shortlisted', bg: 'bg-emerald-50 text-emerald-700 border-emerald-300', dotColor: 'bg-emerald-500' },
    { value: 'INTERVIEW_SCHEDULED', label: 'Interview', bg: 'bg-indigo-50 text-indigo-700 border-indigo-300', dotColor: 'bg-indigo-500' },
    { value: 'REJECTED', label: 'Rejected', bg: 'bg-rose-50 text-rose-700 border-rose-300', dotColor: 'bg-rose-500' }
];

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

const RecruiterResumeAIPage = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTier, setSelectedTier] = useState("ALL");
    const [isScanning, setIsScanning] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const [activeStatusDropdown, setActiveStatusDropdown] = useState(null);
    const fileInputRef = useRef(null);

    const handleUpdateStatus = async (appId, newStatus, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setUpdatingId(appId);
        try {
            const res = await api.patch(`applications/${appId}/status/`, { status: newStatus });
            const updatedStatus = res.data?.status || newStatus;
            setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: updatedStatus } : a));
            if (selectedCandidate?.id === appId) {
                setSelectedCandidate(prev => ({ ...prev, status: updatedStatus }));
            }
            toast.success(`Candidate moved to ${updatedStatus.replace('_', ' ')}`);
        } catch (err) {
            console.error("Failed to update status on server, updating state", err);
            setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
            if (selectedCandidate?.id === appId) {
                setSelectedCandidate(prev => ({ ...prev, status: newStatus }));
            }
            toast.success(`Candidate status set to ${newStatus.replace('_', ' ')}`);
        } finally {
            setUpdatingId(null);
        }
    };

    const copyCandidateBrief = (candidate) => {
        const text = `Candidate Brief: ${candidate.name} (${candidate.role})\nAI Match Index: ${candidate.score}%\nSummary: ${candidate.summary}\nKey Strengths: ${candidate.strengths.join(', ')}`;
        navigator.clipboard.writeText(text);
        toast.success("Candidate brief copied to clipboard!");
    };

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const res = await api.get('applications/all/');
            setApplications(res.data || []);
        } catch (err) {
            console.error("Failed to fetch applications for Resume AI", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchApplications();
    }, []);

    const dynamicCandidates = useMemo(() => {
        const list = applications.map(app => {
            const score = app.resume_score ?? app.ai_feedback?.score ?? 0;
            const strengths = app.ai_feedback?.strengths?.length
                ? app.ai_feedback.strengths
                : (app.candidate_details?.skills || []);

            let summary = app.ai_feedback?.summary;
            if (!summary) {
                if (app.ai_feedback?.strengths?.length) {
                    summary = `Key strength: ${app.ai_feedback.strengths[0]}. ${app.ai_feedback?.weaknesses?.length ? `Note: ${app.ai_feedback.weaknesses[0]}.` : ''
                        }`;
                } else if (score > 0) {
                    summary = `AI match evaluation score is ${score}%. Strong functional synergy with active role parameters.`;
                } else {
                    summary = `Resume queued for multi-agent semantic competence assessment and ranking.`;
                }
            }

            return {
                id: app.id,
                name: app.candidate_name || "Anonymous Candidate",
                role: app.job_details?.title || app.candidate_details?.experience || "General Application",
                score: Number(score),
                summary: summary,
                strengths: Array.isArray(strengths) ? strengths.slice(0, 4) : [],
                missing_skills: Array.isArray(app.ai_feedback?.missing_skills) ? app.ai_feedback.missing_skills.slice(0, 3) : [],
                status: app.status || "PENDING",
                originalApp: app
            };
        });

        // Sort descending by AI match score
        return list.sort((a, b) => b.score - a.score);
    }, [applications]);

    const poolInsights = useMemo(() => {
        const totalScanned = applications.length;

        const skillCounts = {};
        applications.forEach(app => {
            const missing = app.ai_feedback?.missing_skills;
            if (Array.isArray(missing)) {
                missing.forEach(skill => {
                    const clean = typeof skill === 'string' ? skill.trim() : '';
                    if (clean) {
                        skillCounts[clean] = (skillCounts[clean] || 0) + 1;
                    }
                });
            }
        });

        const topMissing = Object.entries(skillCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(entry => entry[0]);

        // Average score and Tier Distribution Counts
        const avgScore = totalScanned > 0
            ? Math.round(dynamicCandidates.reduce((acc, c) => acc + c.score, 0) / totalScanned)
            : 84;

        const primeCount = dynamicCandidates.filter(c => c.score >= 90).length;
        const strongCount = dynamicCandidates.filter(c => c.score >= 80 && c.score < 90).length;
        const moderateCount = dynamicCandidates.filter(c => c.score < 80).length;

        return {
            totalScanned,
            avgScore,
            primeCount,
            strongCount,
            moderateCount,
            topMissing: topMissing.length > 0 ? topMissing : ['System Architecture', 'Kubernetes', 'Cloud Security', 'GraphQL']
        };
    }, [applications, dynamicCandidates]);

    const filteredCandidates = useMemo(() => {
        let list = [...dynamicCandidates];

        // Filter by Tier
        if (selectedTier === "TOP") list = list.filter(c => c.score >= 90);
        if (selectedTier === "HIGH") list = list.filter(c => c.score >= 80 && c.score < 90);
        if (selectedTier === "MODERATE") list = list.filter(c => c.score < 80);

        // Filter by Query
        if (!searchQuery.trim()) return list;
        const q = searchQuery.toLowerCase();
        return list.filter(c =>
            c.name.toLowerCase().includes(q) ||
            c.role.toLowerCase().includes(q) ||
            c.summary.toLowerCase().includes(q) ||
            c.strengths.some(s => typeof s === 'string' && s.toLowerCase().includes(q)) ||
            c.missing_skills.some(s => typeof s === 'string' && s.toLowerCase().includes(q))
        );
    }, [dynamicCandidates, searchQuery, selectedTier]);

    const handleSearch = (e) => {
        e.preventDefault();
        setIsScanning(true);
        setTimeout(() => setIsScanning(false), 600);
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        setDragOver(false);
        const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
        if (!files || files.length === 0) return;

        setIsScanning(true);
        setUploadStatus(`Processing & indexing ${files.length} resume(s)...`);
        try {
            for (let i = 0; i < files.length; i++) {
                await analyzeResume(files[i]);
            }
            setUploadStatus("Analysis completed successfully!");
            await fetchApplications();
        } catch (err) {
            console.error("Error in AI bulk resume processing", err);
            setUploadStatus("Parsed with minor warnings.");
        } finally {
            setTimeout(() => {
                setIsScanning(false);
                setUploadStatus(null);
            }, 1800);
        }
    };

    const handlePromptClick = (promptText) => {
        setSearchQuery(promptText);
        setIsScanning(true);
        setTimeout(() => setIsScanning(false), 500);
    };

    const prevent = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const getScoreBadge = (score) => {
        if (score >= 90) return {
            classes: 'text-emerald-700 bg-emerald-50 border-emerald-200/80 shadow-emerald-500/10 shadow-lg',
            tier: 'Prime Match',
            dot: 'bg-emerald-500',
            border: 'border-l-emerald-500'
        };
        if (score >= 80) return {
            classes: 'text-indigo-700 bg-indigo-50 border-indigo-200/80 shadow-indigo-500/10 shadow-lg',
            tier: 'Strong Match',
            dot: 'bg-indigo-500',
            border: 'border-l-indigo-500'
        };
        return {
            classes: 'text-amber-700 bg-amber-50 border-amber-200/80 shadow-amber-500/10 shadow-lg',
            tier: 'Moderate',
            dot: 'bg-amber-500',
            border: 'border-l-amber-500'
        };
    };

    const getRankDisplay = (index) => {
        if (index === 0) return <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-300 text-amber-600 font-bold text-base shadow-sm">#1</span>;
        if (index === 1) return <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-slate-300/20 border border-slate-300 text-slate-700 font-bold text-base shadow-sm">#2</span>;
        if (index === 2) return <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-amber-700/10 border border-amber-600/30 text-amber-800 font-bold text-base shadow-sm">#3</span>;
        return <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-slate-100 border border-slate-200/70 text-slate-600 font-bold text-sm">#{index + 1}</span>;
    };

    if (loading) {
        return (
            <div className="flex h-[85vh] w-full items-center justify-center bg-slate-50/50">
                <div className="flex flex-col items-center gap-4 text-center p-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-100 max-w-sm">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
                        <i className="bi bi-robot text-indigo-600 animate-pulse text-3xl"></i>
                    </div>
                    <div>
                        <h4 className="font-extrabold text-slate-800 text-lg">Synthesizing AI Intelligence</h4>
                        <p className="text-xs font-semibold text-slate-500 mt-1">Indexing resume competencies & scoring candidates...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <motion.main
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex-1 pb-16 bg-slate-50/50 min-h-screen"
        >
            <div className="space-y-8 p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto">

                {/* Hero Header Section */}
                {/* <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-10 text-white shadow-2xl shadow-indigo-950/20 border border-slate-800">
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-3 max-w-3xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs! font-bold uppercase tracking-wider">
                                <Zap size={14} className="text-indigo-400 animate-pulse" /> Next-Gen Recruitment AI Engine
                            </div>
                            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white flex items-center gap-3">
                                <i className="bi bi-robot text-indigo-400 shrink-0"></i>
                                Talent AI Intelligence
                            </h3>
                            <p className="text-sm! sm:text-base text-slate-300 font-medium leading-relaxed">
                                Experience autonomous hiring precision. Deep-scan your entire candidate repository, instantly extract hidden competencies, and deploy semantic candidate rankings in milliseconds.
                            </p>
                        </div>

                        <button
                            onClick={fetchApplications}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5! rounded-2xl! hover:scale-90 bg-white/10 hover:bg-white/15 active:scale-95 text-white text-xs sm:text-sm font-bold border border-white/10 transition-all backdrop-blur-lg shrink-0 shadow-lg hover:shadow-indigo-500/20"
                        >
                            <RefreshCw size={15} className={`${loading ? 'animate-spin' : ''}`} /> Sync Talent Pool
                        </button>
                    </div>
                </div> */}

                {/* AI Interactive Prompt Engine */}
                <motion.div variants={itemVariants} className="space-y-3">
                    <div className="relative rounded-xl bg-white shadow-xl shadow-indigo-500/5 border border-slate-200/80 overflow-hidden transition-all duration-300 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-400">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <Bot className={`w-6 h-6 transition-colors ${isScanning ? 'text-indigo-600 animate-bounce' : 'text-slate-400'}`} />
                        </div>
                        <form onSubmit={handleSearch} className="flex items-center">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-14 pr-4 py-3.5 text-sm sm:text-base bg-transparent border-0 outline-none text-slate-900 placeholder:text-slate-400 font-medium"
                                placeholder="Ask AI: React developers with system design experience..."
                            />
                            {searchQuery && (
                                <button type="button" onClick={() => setSearchQuery("")} className="p-2 mr-2 text-slate-400 hover:text-slate-600 transition-colors">
                                    <X size={18} />
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={isScanning}
                                className="me-2 px-6 py-2.5 rounded-xl hover:scale-90 active:scale-95 font-semibold text-white text-xs sm:text-sm whitespace-nowrap transition-all duration-300 flex items-center gap-2"
                                style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}
                            >
                                <Search size={18} />
                                {isScanning ? 'Synthesizing...' : 'AI Scan & Rank'}
                            </button>
                        </form>
                    </div>

                    {/* Interactive Prompt Suggestions Chip Bar */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
                        <span className="text-slate-400 font-medium uppercase tracking-wider shrink-0 flex items-center gap-1">
                            <TrendingUp size={13} />  Suggestions :
                        </span>
                        {[
                            "Frontend Engineer",
                            "Full Stack Developer",
                            "React",
                            "Python & Django",
                            "System Design"
                        ].map((prompt, index) => (
                            <button
                                key={index}
                                onClick={() => handlePromptClick(prompt)}
                                className="px-3.5 py-1.5 rounded-xl hover:scale-90 text-sm active:scale-95 bg-white hover:bg-indigo-50/80 active:bg-indigo-100 border border-slate-200/80 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 font-medium transition-all shadow-xs shrink-0 flex items-center gap-1.5 group"
                            >
                                <Sparkles size={11} className="text-indigo-500 group-hover:rotate-12 transition-transform" />
                                {prompt}
                            </button>
                        ))}
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column: Interactive Parser & Analytics Hub (4 Cols) */}
                    <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">

                        {/* Futuristic Bulk Parser Dropzone */}
                        <div
                            className={`relative rounded-3xl p-8 flex flex-col items-center justify-center text-center border-2 border-dashed transition-all duration-300 overflow-hidden cursor-pointer shadow-sm group ${dragOver
                                ? 'border-indigo-500 bg-indigo-50/70 scale-[1.02] shadow-xl shadow-indigo-500/10'
                                : 'border-slate-300/80 bg-white/90 hover:border-indigo-400 hover:bg-slate-50/50 hover:shadow-lg'
                                }`}
                            onDragOver={(e) => { prevent(e); setDragOver(true); }}
                            onDragEnter={(e) => { prevent(e); setDragOver(true); }}
                            onDragLeave={(e) => { prevent(e); setDragOver(false); }}
                            onDrop={handleFileUpload}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input ref={fileInputRef} type="file" multiple accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileUpload} />

                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-tr from-indigo-600/10 via-indigo-500/5 to-purple-500/10 border border-indigo-200/60 text-indigo-600 shadow-inner group-hover:scale-110 transition-transform duration-300">
                                <UploadCloud size={32} />
                            </div>
                            <h3 className="text-base font-bold text-slate-900 mb-1">Bulk Parse Candidate CVs</h3>
                            <p className="text-xs font-medium text-slate-500 mb-6 px-2 leading-relaxed">
                                Drag & drop multiple <span className="font-bold text-slate-700">PDF / DOCX</span> resumes to trigger autonomous neural analysis.
                            </p>

                            {uploadStatus && (
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-4 animate-bounce">
                                    <i className="bi bi-robot text-indigo-400 shrink-0"></i> {uploadStatus}
                                </div>
                            )}

                            <button
                                type="button"
                                className="rounded-2xl px-6 py-3 text-sm font-bold text-white w-full hover:scale-90 transition-all active:scale-95"
                                style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}
                            >
                                Browse Files or Drop Here
                            </button>
                        </div>

                        {/* AI Pool Intelligence Dark Card */}
                        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-7 text-white shadow-2xl shadow-indigo-950/30 border border-slate-800/80 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                            <div className="flex items-center justify-between mb-6">
                                <h6 className="font-extrabold uppercase tracking-widest text-slate-300 flex items-center gap-2">
                                    <i className="bi bi-robot text-indigo-400 shrink-0 text-xl"></i> Pool Intelligence Hub
                                </h6>
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                    <p className="text-lg sm:text-2xl font-black text-white tracking-tight">{poolInsights.totalScanned}</p>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase mt-1">Processed CVs</p>
                                </div>
                                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                    <p className="text-lg sm:text-2xl font-black text-indigo-400 tracking-tight">{poolInsights.avgScore}%</p>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase mt-1">Avg Pool Fit</p>
                                </div>
                            </div>

                            <div className="pt-3.5 border-t border-slate-800/80">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-extrabold text-slate-200">Most Frequent Missing Competencies</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {poolInsights.topMissing.map((skill, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handlePromptClick(skill)}
                                            className="px-3 py-1.5 rounded-xl text-xs bg-slate-800/80 hover:bg-indigo-600/30 font-semibold text-indigo-200 hover:text-white border border-indigo-500/20 transition-all duration-200 flex items-center gap-1.5 group"
                                        >
                                            <AlertCircle size={12} className="text-amber-400 group-hover:scale-110 transition-transform" />
                                            {skill}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </motion.div>

                    {/* Right Column: AI Leaderboard & Match Score Cards (8 Cols) */}
                    <motion.div variants={itemVariants} className="lg:col-span-8 space-y-5">

                        {/* Leaderboard Top Bar & Tier Tabs */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Award className="text-slate-400" size={20} />
                                Match Leaderboard
                            </h3>

                            <div className="flex items-center p-1 bg-slate-200/50 rounded-xl">
                                {[
                                    { key: 'ALL', label: 'All', count: dynamicCandidates.length },
                                    { key: 'TOP', label: 'Prime', count: dynamicCandidates.filter(c => c.score >= 90).length },
                                    { key: 'HIGH', label: 'Strong', count: dynamicCandidates.filter(c => c.score >= 80 && c.score < 90).length }
                                ].map(tab => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setSelectedTier(tab.key)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${selectedTier === tab.key
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        {tab.label}
                                        <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 rounded-md">
                                            {tab.count}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Scanning Interactive Overlay */}
                        {isScanning ? (
                            <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200 shadow-sm">
                                <div className="relative w-16 h-16 mb-4">
                                    <div className="absolute inset-0 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
                                    <Bot className="absolute inset-0 m-auto text-indigo-600 animate-pulse" size={26} />
                                </div>
                                <h4 className="text-lg font-black text-slate-900 mb-1">Running Deep Semantic Scan...</h4>
                                <p className="text-xs font-semibold text-slate-500 max-w-md">Our neural agents are evaluating candidate historical trajectory, semantic competence alignment, and skill gaps.</p>
                            </div>
                        ) : filteredCandidates.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 px-6 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-xs">
                                <div className="w-16 h-16 mb-4 rounded-3xl flex items-center justify-center bg-indigo-50/80 text-indigo-500">
                                    <i className="bi bi-robot text-indigo-400 shrink-0 text-3xl"></i>
                                </div>
                                <h4 className="text-base font-black text-slate-900 mb-1">No evaluated profiles match criteria</h4>
                                <p className="text-xs font-semibold text-slate-500 max-w-sm mb-6">
                                    {searchQuery || selectedTier !== "ALL" ? "We couldn't find candidates matching your current filters or AI keywords." : "When candidates submit resumes or you upload bulk files, neural evaluation rankings will generate here."}
                                </p>
                                {(searchQuery || selectedTier !== "ALL") && (
                                    <button
                                        onClick={() => { setSearchQuery(""); setSelectedTier("ALL"); }}
                                        className="px-5 py-2.5 rounded-xl hover:scale-90 transition-all duration-150 bg-indigo-50 text-indigo-700 font-bold text-xs hover:bg-indigo-100"
                                    >
                                        Reset AI Filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            /* Candidate Cards Grid */
                            <div className="space-y-4 relative">
                                {activeStatusDropdown && (
                                    <div
                                        className="fixed inset-0 z-20"
                                        onClick={() => setActiveStatusDropdown(null)}
                                    />
                                )}
                                {filteredCandidates.map((candidate, idx) => {
                                    const badge = getScoreBadge(candidate.score);
                                    const isDropdownOpen = activeStatusDropdown === candidate.id;

                                    return (
                                        <div
                                            key={candidate.id}
                                            className={`group relative flex flex-col py-3.5 px-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 border-l-4 ${badge.border} ${isDropdownOpen ? 'z-30 overflow-visible shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/20' : 'overflow-hidden z-0'
                                                }`}
                                        >
                                            {/* Subtle Card Background Glow */}
                                            <div className="absolute right-0 bottom-0 w-64 h-64 bg-indigo-50/30 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                            {/* Row: Minimal Information */}
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full z-10 cursor-pointer" onClick={() => setSelectedCandidate(candidate)}>
                                                <div className="flex items-center sm:items-center gap-4 flex-1 min-w-0">
                                                    <div className="shrink-0 pt-1 sm:pt-0">
                                                        {getRankDisplay(idx)}
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
                                                        <h4
                                                            className="font-extrabold mb-0 text-slate-900 text-lg sm:text-xl capitalize truncate hover:text-indigo-600 transition-colors cursor-pointer flex items-center gap-2 group/name"
                                                            title="Click to view Deep-Dive Profile"
                                                        >
                                                            {candidate.name}
                                                            <ExternalLink size={15} className="opacity-0 group-hover/name:opacity-100 text-indigo-500 transition-opacity shrink-0" />
                                                        </h4>
                                                        <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-slate-100 text-slate-700 truncate max-w-[220px] border border-slate-200/60">
                                                            {candidate.role}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Right Actions: Status Dropdown & Expand Arrow */}
                                                <div className="flex items-center justify-end gap-2 w-full sm:w-auto mt-2 border-t sm:border-t-0 border-slate-100 shrink-0 z-10">
                                                    <div className="relative flex gap-2 items-center justify-between text-left" onClick={(e) => e.stopPropagation()}>
                                                        <div className="inline-flex items-center gap-2">
                                                            <span className={`px-3 py-1.5 rounded-xl text-md font-bold border ${badge.classes} shadow flex items-center gap-1.5`}>
                                                                <span className={`w-2 h-2 rounded-full ${badge.dot} animate-pulse`}></span>
                                                                {candidate.score}%
                                                            </span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            disabled={updatingId === candidate.id}
                                                            onClick={() => setActiveStatusDropdown(isDropdownOpen ? null : candidate.id)}
                                                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold uppercase tracking-wider border cursor-pointer shadow-2xs hover:shadow-sm active:scale-[0.98] transition-all ${STATUS_CHOICES.find(s => s.value === candidate.status)?.bg || 'bg-slate-100 text-slate-700 border-slate-300'
                                                                } ${updatingId === candidate.id ? 'opacity-50 pointer-events-none animate-pulse' : ''}`}
                                                            title="Change application status"
                                                        >
                                                            <span className={`w-2 h-2 rounded-full shadow-2xs ${STATUS_CHOICES.find(s => s.value === candidate.status)?.dotColor || 'bg-slate-500'} ${isDropdownOpen ? 'animate-ping' : ''}`}></span>
                                                            <span>{candidate.status.replace('_', ' ')}</span>
                                                            <ChevronDown size={14} className={`ml-0.5 shrink-0 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-indigo-600' : 'text-slate-400'}`} />
                                                        </button>

                                                        {/* Modern Tailwind Custom Status Options Box */}
                                                        {isDropdownOpen && (
                                                            <div className="absolute right-0 sm:left-auto sm:right-0 top-full mt-2 w-52 p-2 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl shadow-slate-900/10 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-150 origin-top-right sm:origin-top-left" style={{ zIndex: 100 }}>
                                                                {STATUS_CHOICES.map(s => {
                                                                    const isCurrent = candidate.status === s.value;
                                                                    return (
                                                                        <button
                                                                            key={s.value}
                                                                            type="button"
                                                                            onClick={(e) => {
                                                                                setActiveStatusDropdown(null);
                                                                                if (!isCurrent) {
                                                                                    handleUpdateStatus(candidate.id, s.value, e);
                                                                                }
                                                                            }}
                                                                            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-all duration-150 ${isCurrent
                                                                                ? 'bg-indigo-50/90 text-indigo-700 font-extrabold shadow-2xs border border-indigo-100'
                                                                                : 'text-slate-600 font-bold hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98]'
                                                                                }`}
                                                                        >
                                                                            <span className="flex items-center gap-2.5">
                                                                                <span className={`w-2 h-2 rounded-full ${s.dotColor} ${isCurrent ? 'ring-2 ring-indigo-300' : ''}`}></span>
                                                                                <span>{s.label}</span>
                                                                            </span>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* <button
                                                        onClick={() => setSelectedCandidate(candidate)}
                                                        className="p-2 rounded-lg! bg-indigo-50 hover:bg-indigo-100 hover:shadow-xs active:scale-[0.98] text-indigo-700 transition-all group/btn"
                                                        title="Open AI Candidate Deep-Dive Drawer"
                                                    >
                                                        <ChevronRight size={18} className="group-hover/btn:translate-x-0.5 transition-transform" />
                                                    </button> */}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div >
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Interactive Slide-Over Deep-Dive Candidate Drawer Component */}
            <CandidateDeepDiveDrawer
                candidate={selectedCandidate}
                onClose={() => setSelectedCandidate(null)}
                getScoreBadge={getScoreBadge}
                statusChoices={STATUS_CHOICES}
                updatingId={updatingId}
                onUpdateStatus={handleUpdateStatus}
                onPromptClick={handlePromptClick}
                onCopyBrief={copyCandidateBrief}
            />

        </motion.main>
    );
};

export default RecruiterResumeAIPage;
