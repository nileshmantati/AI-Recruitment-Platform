// Re-export the existing ResumeAnalyzer as Candidate Resume AI page
// The RecruiterResumeAIPage is for recruiters to analyze candidate resumes.
// For candidates, we use the public ResumeAnalyzer page wrapped inside the dashboard.
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, UploadCloud, FileText, CheckCircle, AlertCircle, Loader2, Star, TrendingUp, X } from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { T } from '../../../Js/theme';

const fadeUp = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } };
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };

const ScoreRing = ({ score }) => {
    const r = 52, c = 2 * Math.PI * r;
    const fill = (score / 100) * c;
    const color = score >= 80 ? '#22C55E' : score >= 60 ? '#F59E0B' : '#EF4444';
    return (
        <div className="relative flex h-36 w-36 items-center justify-center shrink-0">
            <svg width="136" height="136" viewBox="0 0 136 136" className="-rotate-90">
                <circle cx="68" cy="68" r={r} strokeWidth="10" stroke="#e2e8f0" fill="none" />
                <circle cx="68" cy="68" r={r} strokeWidth="10" stroke={color} fill="none"
                    strokeDasharray={`${fill} ${c}`} strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease' }} />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">{score}</span>
                <span className="text-xs sm:text-sm font-bold text-slate-500">/ 100</span>
            </div>
        </div>
    );
};

const CandidateResumeAIPage = () => {
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const fileRef = useRef(null);

    const handleFile = (f) => {
        if (!f) return;
        if (f.type !== 'application/pdf') { toast.error('Please upload a PDF file.'); return; }
        if (f.size > 5 * 1024 * 1024) { toast.error('File must be under 5MB.'); return; }
        setFile(f);
        setResult(null);
    };

    const handleAnalyze = async () => {
        if (!file) { toast.error('Please upload a resume first.'); return; }
        setLoading(true);
        const fd = new FormData();
        fd.append('resume', file);
        try {
            const res = await api.post('resume/analyze/', fd);
            setResult(res.data);
            toast.success('Resume analyzed successfully!');
        } catch (e) {
            toast.error(e.response?.data?.error || 'Analysis failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.main variants={container} initial="hidden" animate="show"
            className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
            {/* Header */}
            <motion.div variants={fadeUp}>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900">
                    Resume <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${T.primary}, ${T.accent})` }}>AI Analyzer</span>
                </h1>
                <p className="mt-1 text-sm sm:text-base text-slate-500">Upload your resume and get instant AI-powered feedback to improve your applications</p>
            </motion.div>

            {/* Upload Zone */}
            <motion.div variants={fadeUp} className="rounded-2xl border border-slate-100 bg-white shadow-sm p-6">
                <div
                    className={`relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200 ${isDragging ? 'border-indigo-500 bg-indigo-50/50' : file ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-200 bg-slate-50 hover:border-indigo-400 hover:bg-slate-100/50'}`}
                    onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={e => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]); }}
                    onClick={() => fileRef.current?.click()}
                >
                    <input type="file" accept=".pdf" className="hidden" ref={fileRef} onChange={e => handleFile(e.target.files[0])} />
                    {file ? (
                        <div className="flex flex-col items-center text-emerald-600">
                            <div className="mb-3 rounded-full bg-emerald-100 p-4"><FileText size={36} /></div>
                            <p className="font-bold text-lg sm:text-xl text-emerald-800">{file.name}</p>
                            <p className="text-sm sm:text-base font-semibold text-emerald-600 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB — Ready to analyze</p>
                            <button onClick={e => { e.stopPropagation(); setFile(null); setResult(null); }}
                                className="mt-3 flex items-center gap-1 text-xs sm:text-sm font-semibold text-slate-500 hover:text-red-500 transition">
                                <X size={15} /> Remove
                            </button>
                        </div>
                    ) : (
                        <div className={`flex flex-col items-center transition-colors ${isDragging ? 'text-indigo-600' : 'text-slate-400'}`}>
                            <div className="mb-3 rounded-full bg-white p-4 shadow-sm"><UploadCloud size={36} /></div>
                            <p className="font-bold text-base sm:text-lg text-slate-700">Click to upload or drag & drop</p>
                            <p className="mt-1 text-xs sm:text-sm text-slate-500">PDF only · Max 5MB</p>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleAnalyze}
                    disabled={!file || loading}
                    className="mt-4 flex w-full items-center justify-center gap-2 !rounded-xl py-3 text-sm sm:text-base font-bold text-white shadow-md transition hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}
                >
                    {loading ? <><Loader2 size={18} className="animate-spin" /> Analyzing...</> : <><Sparkles size={18} /> Analyze with AI</>}
                </button>
            </motion.div>

            {/* Results */}
            {result && (
                <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
                    {/* Score */}
                    <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                        <ScoreRing score={result.score || 0} />
                        <div className="flex-1 text-center sm:text-left">
                            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">Overall Resume Score</h3>
                            <p className="mt-1 text-sm sm:text-base text-slate-500 max-w-md">
                                {result.score >= 80 ? 'Excellent! Your resume is highly competitive.' : result.score >= 60 ? 'Good resume with room for improvement.' : 'Your resume needs significant improvements to be competitive.'}
                            </p>
                            {result.job_match_percent && (
                                <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200 px-3.5 py-1 text-xs sm:text-sm font-bold text-indigo-700">
                                    <Star size={14} /> {result.job_match_percent}% average job match
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Strengths & Improvements */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        {result.strengths?.length > 0 && (
                            <motion.div variants={fadeUp} className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                    <CheckCircle size={18} className="text-emerald-500" />
                                    <h4 className="font-extrabold text-slate-800 text-base sm:text-lg">Strengths</h4>
                                </div>
                                <ul className="space-y-2">
                                    {result.strengths.map((s, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm sm:text-base text-slate-700 font-medium leading-relaxed">
                                            <span className="mt-2 h-1.5 w-1.5 rounded-full shrink-0 bg-emerald-500" />{s}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        )}
                        {result.improvements?.length > 0 && (
                            <motion.div variants={fadeUp} className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                    <TrendingUp size={18} className="text-rose-500" />
                                    <h4 className="font-extrabold text-slate-800 text-base sm:text-lg">Areas to Improve</h4>
                                </div>
                                <ul className="space-y-2">
                                    {result.improvements.map((s, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm sm:text-base text-slate-700 font-medium leading-relaxed">
                                            <span className="mt-2 h-1.5 w-1.5 rounded-full shrink-0 bg-rose-500" />{s}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        )}
                    </div>

                    {/* Missing Skills */}
                    {result.missing_skills?.length > 0 && (
                        <motion.div variants={fadeUp} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <AlertCircle size={18} className="text-amber-500" />
                                <h4 className="font-extrabold text-slate-800 text-base sm:text-lg">Missing Skills to Add</h4>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {result.missing_skills.map((s, i) => (
                                    <span key={i} className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-1 text-xs sm:text-sm font-semibold text-amber-700">{s}</span>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Summary */}
                    {result.summary && (
                        <motion.div variants={fadeUp} className="rounded-2xl border border-slate-100 bg-gradient-to-br p-5 shadow-sm" style={{ background: `linear-gradient(135deg, ${T.primary}05, ${T.accent}05)` }}>
                            <h4 className="font-extrabold text-slate-800 text-base sm:text-lg mb-2">AI Summary</h4>
                            <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed">{result.summary}</p>
                        </motion.div>
                    )}
                </motion.div>
            )}
        </motion.main>
    );
};

export default CandidateResumeAIPage;
