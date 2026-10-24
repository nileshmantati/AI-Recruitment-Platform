import { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Briefcase,
    Sparkles,
    RefreshCw,
    ShieldCheck,
    AlertTriangle,
    CheckCircle2,
    DollarSign,
    Lightbulb,
    X,
    Loader2,
    Wand2,
    Edit3,
    ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import api, { generateJobDescription, analyzeJobDescriptionBias } from '../../services/api';

const quillModules = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['blockquote'],
        ['clean']
    ]
};

const PostJobModal = ({ show, handleClose, onJobPosted }) => {
    // Mode: 'ai' | 'manual'
    const [mode, setMode] = useState('ai');

    // AI Generation input state
    const [aiInputs, setAiInputs] = useState({
        job_title: '',
        experience_level: 'Mid Level (3-5 years)',
        location: '',
        employment_type: 'Full-time',
        industry: '',
        notes: '',
        currency: 'INR'
    });

    // Job Posting core form data
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        required_skills: '',
        salary: '',
        employment_type: 'Full-time'
    });

    // AI results & analysis state
    const [compensationData, setCompensationData] = useState(null);
    const [biasAnalysis, setBiasAnalysis] = useState(null);

    // Loading states
    const [isGenerating, setIsGenerating] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isPosting, setIsPosting] = useState(false);

    // Reset everything when closing
    const handleModalClose = () => {
        handleClose();
        setTimeout(() => {
            setFormData({ title: '', description: '', required_skills: '', salary: '', employment_type: 'Full-time' });
            setAiInputs({
                job_title: '',
                experience_level: 'Mid Level (3-5 years)',
                location: '',
                employment_type: 'Full-time',
                industry: '',
                notes: '',
                currency: 'INR'
            });
            setCompensationData(null);
            setBiasAnalysis(null);
            setMode('ai');
        }, 200);
    };

    // Handle AI inputs change
    const handleAiInputChange = (e) => {
        const { name, value } = e.target;
        setAiInputs((prev) => ({ ...prev, [name]: value }));
        // Keep core formData.title and employment_type continuously synchronized
        if (name === 'job_title') {
            setFormData((prev) => ({ ...prev, title: value }));
        }
        if (name === 'employment_type') {
            setFormData((prev) => ({ ...prev, employment_type: value }));
        }
    };

    // Handle Core Form data change
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Keep aiInputs continuously synchronized
        if (name === 'title') {
            setAiInputs((prev) => ({ ...prev, job_title: value }));
        }
        if (name === 'employment_type') {
            setAiInputs((prev) => ({ ...prev, employment_type: value }));
        }
    };

    // AI Generation Handler
    const handleGenerate = async (e) => {
        if (e) e.preventDefault();

        const titleToUse = (aiInputs.job_title || formData.title || '').trim();
        if (!titleToUse) {
            toast.error('Please specify a Job Title to generate.');
            return;
        }

        setIsGenerating(true);
        try {
            const payload = {
                title: titleToUse,
                job_title: titleToUse,
                experience_level: aiInputs.experience_level,
                location: aiInputs.location.trim(),
                work_mode: aiInputs.location.trim(),
                employment_type: aiInputs.employment_type,
                industry: aiInputs.industry.trim(),
                notes: aiInputs.notes.trim(),
                additional_instructions: aiInputs.notes.trim(),
                currency: aiInputs.currency
            };

            const data = await generateJobDescription(payload);

            // Populate form data
            const generatedHtml = data.job_description_html || '';
            const skillsString = Array.isArray(data.required_skills)
                ? data.required_skills.join(', ')
                : '';

            setFormData((prev) => ({
                ...prev,
                title: data.job_title || data.title || titleToUse,
                description: generatedHtml,
                required_skills: skillsString
            }));

            // Set compensation
            if (data.compensation && (data.compensation.minimum || data.compensation.maximum)) {
                setCompensationData(data.compensation);
            } else {
                setCompensationData(null);
            }

            // Set bias analysis
            if (data.bias_analysis) {
                setBiasAnalysis(data.bias_analysis);
            } else {
                setBiasAnalysis(null);
            }

            toast.success('Job description generated with Gemini AI!');
        } catch (error) {
            console.error('Error generating job description:', error);
            const errMsg = error.response?.data?.error || 'Failed to generate job description. Please check connection and retry.';
            toast.error(errMsg);
        } finally {
            setIsGenerating(false);
        }
    };

    // Re-analyze current edited content for bias/inclusivity
    const handleReAnalyze = async () => {
        if (!formData.description || formData.description.replace(/<[^>]+>/g, '').trim().length === 0) {
            toast.error('Please enter description content to analyze.');
            return;
        }

        setIsAnalyzing(true);
        try {
            const data = await analyzeJobDescriptionBias({
                content: formData.description,
                job_title: formData.title || aiInputs.job_title || 'Role'
            });

            if (data.bias_analysis) {
                setBiasAnalysis(data.bias_analysis);
                toast.success('Inclusivity audit updated!');
            }
        } catch (error) {
            console.error('Error analyzing content:', error);
            const errMsg = error.response?.data?.error || 'Failed to analyze inclusivity. Please try again.';
            toast.error(errMsg);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Apply suggested inclusive replacement into the description
    const handleApplySuggestion = (finding) => {
        if (!finding.term || !finding.suggestion) return;

        // Escape regex special chars
        const escaped = finding.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escaped}\\b`, 'gi');

        const newDesc = formData.description.replace(regex, finding.suggestion);
        setFormData((prev) => ({ ...prev, description: newDesc }));

        // Remove applied finding from list
        setBiasAnalysis((prev) => {
            if (!prev) return null;
            const updatedFindings = prev.findings.filter((f) => f.term !== finding.term);
            const updatedScore = Math.min(100, (prev.score || 80) + 5);
            return {
                ...prev,
                findings: updatedFindings,
                score: updatedScore,
                risk_level: updatedFindings.length === 0 ? 'low' : prev.risk_level
            };
        });

        toast.success(`Replaced "${finding.term}" with "${finding.suggestion}"`);
    };

    // Apply indicative salary to the salary input field
    const handleApplySalary = () => {
        if (!compensationData) return;
        const sym = compensationData.currency === 'USD' ? '$' : '₹';
        const minStr = compensationData.minimum ? `${sym}${Number(compensationData.minimum).toLocaleString()}` : '';
        const maxStr = compensationData.maximum ? `${sym}${Number(compensationData.maximum).toLocaleString()}` : '';

        let formatted = '';
        if (minStr && maxStr) {
            formatted = `${minStr} - ${maxStr} / ${compensationData.period || 'yearly'}`;
        } else if (minStr) {
            formatted = `From ${minStr} / ${compensationData.period || 'yearly'}`;
        } else if (maxStr) {
            formatted = `Up to ${maxStr} / ${compensationData.period || 'yearly'}`;
        }

        if (formatted) {
            setFormData((prev) => ({ ...prev, salary: formatted }));
            toast.success('Salary applied to job posting!');
        }
    };

    // Final Submit (Post Job to backend)
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        const effectiveTitle = (formData.title || aiInputs.job_title || '').trim();
        if (!effectiveTitle) {
            toast.error('Job title is required.');
            return;
        }

        const plainTextDesc = formData.description.replace(/<[^>]+>/g, '').trim();
        if (!plainTextDesc) {
            toast.error('Job description is required.');
            return;
        }

        if (!formData.required_skills.trim()) {
            toast.error('At least one required skill is needed.');
            return;
        }

        setIsPosting(true);
        try {
            const skillsArray = formData.required_skills
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);

            const effectiveType = (mode === 'manual' ? formData.employment_type : aiInputs.employment_type) || formData.employment_type || aiInputs.employment_type || 'Full-time';

            const payload = {
                title: effectiveTitle,
                description: formData.description,
                required_skills: skillsArray,
                salary: formData.salary.trim() || 'Not specified',
                type: effectiveType,
                employment_type: effectiveType
            };

            await api.post('jobs/', payload);
            toast.success('Job posted successfully!');
            if (onJobPosted) onJobPosted();
            handleModalClose();
        } catch (error) {
            console.error('Error posting job:', error);
            const errDetail = error.response?.data?.error || error.response?.data?.detail || 'Failed to post job. Please try again.';
            toast.error(errDetail);
        } finally {
            setIsPosting(false);
        }
    };

    // Helpers for Bias UI visualization
    const getRiskBadge = (risk) => {
        switch (risk?.toLowerCase()) {
            case 'high':
                return {
                    bg: 'bg-rose-50 text-rose-700 border-rose-200',
                    icon: AlertTriangle,
                    label: 'High Risk - Revision Recommended'
                };
            case 'medium':
                return {
                    bg: 'bg-amber-50 text-amber-700 border-amber-200',
                    icon: AlertTriangle,
                    label: 'Moderate Risk - Consider Rephrasing'
                };
            case 'low':
            default:
                return {
                    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    icon: CheckCircle2,
                    label: 'Low Risk - Inclusive Language'
                };
        }
    };

    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden relative my-auto border border-slate-100"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
                                    <Briefcase size={22} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                        Post a New Job
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Create compelling, inclusive job postings with Gemini AI or standard entry.
                                    </p>
                                </div>
                            </div>

                            {/* Mode Toggle Pills */}
                            <div className="flex items-center gap-2">
                                <div className="flex bg-slate-200/70 p-1 rounded-xl text-xs font-semibold">
                                    <button
                                        type="button"
                                        onClick={() => setMode('ai')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${mode === 'ai'
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                    >
                                        <Sparkles size={14} className={mode === 'ai' ? 'text-blue-600' : 'text-slate-400'} />
                                        AI Studio
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setMode('manual')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${mode === 'manual'
                                            ? 'bg-white text-blue-600 shadow-sm'
                                            : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                    >
                                        <Edit3 size={14} className={mode === 'manual' ? 'text-blue-600' : 'text-slate-400'} />
                                        Manual Mode
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleModalClose}
                                    className="p-2 rounded-full hover:bg-slate-200/60 transition-colors text-slate-500 hover:text-slate-700"
                                    aria-label="Close dialog"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* AI Generation Parameters Section (Only in AI Mode) */}
                            {mode === 'ai' && (
                                <div className="bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-white rounded-2xl p-5 border border-blue-100/80 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <Wand2 className="text-blue-600" size={18} />
                                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                                                AI Generation Parameters
                                            </h3>
                                        </div>
                                        <span className="text-xs text-blue-700 font-medium bg-blue-100/60 px-2.5 py-0.5 rounded-full">
                                            Gemini 2.5 Flash
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Job Title */}
                                        <div className="md:col-span-1">
                                            <label htmlFor="ai_job_title" className="block text-xs font-bold text-slate-700 mb-1">
                                                Job Title <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                id="ai_job_title"
                                                type="text"
                                                name="job_title"
                                                placeholder="e.g. Senior Full-Stack Engineer"
                                                value={aiInputs.job_title}
                                                onChange={handleAiInputChange}
                                                disabled={isGenerating}
                                                className="w-full px-3.5 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                                            />
                                        </div>

                                        {/* Experience Level */}
                                        <div className="md:col-span-1">
                                            <label htmlFor="experience_level" className="block text-xs font-bold text-slate-700 mb-1">
                                                Experience Level <span className="text-rose-500">*</span>
                                            </label>
                                            <select
                                                id="experience_level"
                                                name="experience_level"
                                                value={aiInputs.experience_level}
                                                onChange={handleAiInputChange}
                                                disabled={isGenerating}
                                                className="w-full px-3.5 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                                            >
                                                <option value="Entry Level (0-2 years)">Entry Level (0-2 years)</option>
                                                <option value="Mid Level (3-5 years)">Mid Level (3-5 years)</option>
                                                <option value="Senior Level (5-8 years)">Senior Level (5-8 years)</option>
                                                <option value="Lead / Staff (8-12 years)">Lead / Staff (8-12 years)</option>
                                                <option value="Executive / Director (12+ years)">Executive / Director (12+ years)</option>
                                            </select>
                                        </div>

                                        {/* Employment Type & Work Mode */}
                                        <div>
                                            <label htmlFor="employment_type" className="block text-xs font-bold text-slate-700 mb-1">
                                                Employment Type
                                            </label>
                                            <select
                                                id="employment_type"
                                                name="employment_type"
                                                value={aiInputs.employment_type}
                                                onChange={handleAiInputChange}
                                                disabled={isGenerating}
                                                className="w-full px-3.5 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                                            >
                                                <option value="Full-time">Full-time</option>
                                                <option value="Part-time">Part-time</option>
                                                <option value="Contract">Contract</option>
                                                <option value="Internship">Internship</option>
                                            </select>
                                        </div>

                                        {/* Location / Work Mode */}
                                        <div>
                                            <label htmlFor="location" className="block text-xs font-bold text-slate-700 mb-1">
                                                Location & Arrangement
                                            </label>
                                            <input
                                                id="location"
                                                type="text"
                                                name="location"
                                                placeholder="e.g. Bangalore, India (Hybrid) or Remote"
                                                value={aiInputs.location}
                                                onChange={handleAiInputChange}
                                                disabled={isGenerating}
                                                className="w-full px-3.5 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                                            />
                                        </div>

                                        {/* Industry & Currency */}
                                        <div>
                                            <label htmlFor="industry" className="block text-xs font-bold text-slate-700 mb-1">
                                                Industry / Domain
                                            </label>
                                            <input
                                                id="industry"
                                                type="text"
                                                name="industry"
                                                placeholder="e.g. Fintech, Healthcare, SaaS"
                                                value={aiInputs.industry}
                                                onChange={handleAiInputChange}
                                                disabled={isGenerating}
                                                className="w-full px-3.5 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="currency" className="block text-xs font-bold text-slate-700 mb-1">
                                                Salary Currency Estimate
                                            </label>
                                            <select
                                                id="currency"
                                                name="currency"
                                                value={aiInputs.currency}
                                                onChange={handleAiInputChange}
                                                disabled={isGenerating}
                                                className="w-full px-3.5 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                                            >
                                                <option value="INR">INR (₹ Indian Rupee)</option>
                                                <option value="USD">USD ($ US Dollar)</option>
                                            </select>
                                        </div>

                                        {/* Custom Instructions */}
                                        <div className="md:col-span-2">
                                            <label htmlFor="notes" className="block text-xs font-bold text-slate-700 mb-1">
                                                Special Instructions / Key Tech Stack (Optional)
                                            </label>
                                            <input
                                                id="notes"
                                                type="text"
                                                name="notes"
                                                placeholder="e.g. Emphasize microservices, React 19, AWS ECS, and mentoring junior engineers"
                                                value={aiInputs.notes}
                                                onChange={handleAiInputChange}
                                                disabled={isGenerating}
                                                className="w-full px-3.5 py-2 text-sm bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                                            />
                                        </div>
                                    </div>

                                    {/* Generate Action Button */}
                                    <div className="mt-4 flex items-center justify-between pt-3 border-t border-blue-100">
                                        <p className="text-xs text-slate-500">
                                            Generates inclusive role summary, responsibilities, structured skills, and tone audit.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={handleGenerate}
                                            disabled={isGenerating || !aiInputs.job_title.trim()}
                                            className="px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 flex items-center gap-2 transition-all shadow-md shadow-blue-500/20 text-sm cursor-pointer"
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <Loader2 size={16} className="animate-spin" />
                                                    Generating Description...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles size={16} />
                                                    Generate with AI
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Inclusivity & Bias Analyzer Card (Shown when bias analysis is available) */}
                            {biasAnalysis && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                                                <ShieldCheck size={20} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                                    Language Inclusivity & Bias Audit
                                                </h4>
                                                <p className="text-xs text-slate-500">
                                                    AI-assisted screening for exclusionary phrases, aggressive tone, and age bias.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {/* Inclusivity Score Badge */}
                                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
                                                <span className="text-xs font-semibold text-slate-600">Inclusivity Score:</span>
                                                <span
                                                    className={`text-sm font-extrabold ${biasAnalysis.score >= 85
                                                        ? 'text-emerald-600'
                                                        : biasAnalysis.score >= 65
                                                            ? 'text-amber-600'
                                                            : 'text-rose-600'
                                                        }`}
                                                >
                                                    {biasAnalysis.score}/100
                                                </span>
                                            </div>

                                            {/* Risk Level Badge */}
                                            {(() => {
                                                const badge = getRiskBadge(biasAnalysis.risk_level);
                                                const BadgeIcon = badge.icon;
                                                return (
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${badge.bg}`}
                                                    >
                                                        <BadgeIcon size={14} />
                                                        {badge.label}
                                                    </span>
                                                );
                                            })()}

                                            {/* Re-analyze Button */}
                                            <button
                                                type="button"
                                                onClick={handleReAnalyze}
                                                disabled={isAnalyzing}
                                                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                                                title="Re-run bias and inclusivity analysis on edited text"
                                            >
                                                <RefreshCw size={13} className={isAnalyzing ? 'animate-spin text-blue-600' : ''} />
                                                {isAnalyzing ? 'Checking...' : 'Re-analyze'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Findings List */}
                                    {biasAnalysis.findings && biasAnalysis.findings.length > 0 ? (
                                        <div className="space-y-2.5">
                                            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                                Detected Phrases & Suggested Replacements:
                                            </p>
                                            <div className="grid grid-cols-1 gap-2.5">
                                                {biasAnalysis.findings.map((finding, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                                                    >
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded">
                                                                    "{finding.term}"
                                                                </span>
                                                                <ArrowRight size={12} className="text-amber-600" />
                                                                <span className="font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                                                                    "{finding.suggestion}"
                                                                </span>
                                                            </div>
                                                            <p className="text-slate-600">{finding.reason}</p>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleApplySuggestion(finding)}
                                                            className="self-start sm:self-center px-3 py-1.5 rounded-lg font-bold text-white bg-amber-600 hover:bg-amber-700 text-xs transition shadow-xs whitespace-nowrap cursor-pointer"
                                                        >
                                                            Apply Replacement
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800 font-medium">
                                            <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                                            <span>
                                                Great job! No exclusionary, aggressive, or biased phrases detected in this job description.
                                            </span>
                                        </div>
                                    )}

                                    {/* Inclusive Suggestions */}
                                    {biasAnalysis.inclusive_suggestions && biasAnalysis.inclusive_suggestions.length > 0 && (
                                        <div className="pt-2">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
                                                <Lightbulb size={14} className="text-amber-500" />
                                                Inclusivity Recommendations:
                                            </div>
                                            <ul className="text-xs text-slate-600 space-y-1 list-disc pl-5">
                                                {biasAnalysis.inclusive_suggestions.map((sug, i) => (
                                                    <li key={i}>{sug}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Legal Disclaimer */}
                                    <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-100">
                                        Disclaimer: This is an AI-assisted language review to encourage inclusive phrasing. It does not constitute legal compliance certification or an absolute guarantee of unbiased hiring.
                                    </p>
                                </motion.div>
                            )}

                            {/* Indicative Compensation Recommendation Card */}
                            {compensationData && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-emerald-50/50 rounded-2xl border border-emerald-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                                            <DollarSign size={18} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-800 text-sm">
                                                    Indicative Salary Benchmark:
                                                </span>
                                                <span className="font-extrabold text-emerald-700 text-sm">
                                                    {compensationData.currency === 'USD' ? '$' : '₹'}
                                                    {compensationData.minimum ? Number(compensationData.minimum).toLocaleString() : ''} -{' '}
                                                    {compensationData.currency === 'USD' ? '$' : '₹'}
                                                    {compensationData.maximum ? Number(compensationData.maximum).toLocaleString() : ''}{' '}
                                                    <span className="font-normal text-slate-500">
                                                        / {compensationData.period || 'yearly'}
                                                    </span>
                                                </span>
                                            </div>
                                            <p className="text-slate-600 mt-0.5">
                                                {compensationData.basis || 'Based on market estimates for this role and experience level.'}
                                                <span className="ml-1 text-slate-400">
                                                    (Confidence: {compensationData.confidence || 'medium'})
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleApplySalary}
                                        className="self-start sm:self-center px-3.5 py-1.5 rounded-xl font-bold text-emerald-800 bg-emerald-200/70 hover:bg-emerald-200 text-xs transition border border-emerald-300 whitespace-nowrap cursor-pointer"
                                    >
                                        Use This Salary
                                    </button>
                                </motion.div>
                            )}

                            {/* Job Publishing Form */}
                            <form id="post-job-form" onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {mode === 'manual' ? (
                                        <>
                                            {/* Job Title (Manual mode only - not duplicated in AI mode) */}
                                            <div>
                                                <label htmlFor="job-title" className="block text-xs font-bold text-slate-700 mb-1">
                                                    Job Title <span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    id="job-title"
                                                    name="title"
                                                    placeholder="e.g. Senior Django Developer"
                                                    value={formData.title}
                                                    onChange={handleFormChange}
                                                    required
                                                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                                                />
                                            </div>

                                            {/* Employment Type (Manual mode) */}
                                            <div>
                                                <label htmlFor="manual-employment-type" className="block text-xs font-bold text-slate-700 mb-1">
                                                    Employment Type
                                                </label>
                                                <select
                                                    id="manual-employment-type"
                                                    name="employment_type"
                                                    value={formData.employment_type || 'Full-time'}
                                                    onChange={handleFormChange}
                                                    className="w-full px-3.5 py-2.5 text-sm bg-white rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                                                >
                                                    <option value="Full-time">Full-time</option>
                                                    <option value="Part-time">Part-time</option>
                                                    <option value="Contract">Contract</option>
                                                    <option value="Internship">Internship</option>
                                                    <option value="Remote">Remote</option>
                                                </select>
                                            </div>

                                            {/* Salary Range */}
                                            <div className="md:col-span-2">
                                                <label htmlFor="salary-range" className="block text-xs font-bold text-slate-700 mb-1">
                                                    Salary Range (Optional)
                                                </label>
                                                <input
                                                    type="text"
                                                    id="salary-range"
                                                    name="salary"
                                                    placeholder="e.g. ₹18,00,000 - ₹24,00,000 / yearly"
                                                    value={formData.salary}
                                                    onChange={handleFormChange}
                                                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {/* AI Mode: No duplicate Job Title! Show Salary Range */}
                                            <div className="md:col-span-2">
                                                <label htmlFor="salary-range" className="block text-xs font-bold text-slate-700 mb-1">
                                                    Salary Range (Optional)
                                                </label>
                                                <input
                                                    type="text"
                                                    id="salary-range"
                                                    name="salary"
                                                    placeholder="e.g. ₹18,00,000 - ₹24,00,000 / yearly"
                                                    value={formData.salary}
                                                    onChange={handleFormChange}
                                                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Required Skills */}
                                <div>
                                    <label htmlFor="required-skills" className="block text-xs font-bold text-slate-700 mb-1">
                                        Required Skills (comma separated) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="required-skills"
                                        name="required_skills"
                                        placeholder="Python, Django REST Framework, React, PostgreSQL"
                                        value={formData.required_skills}
                                        onChange={handleFormChange}
                                        required
                                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
                                    />
                                    <p className="text-[11px] text-slate-400 mt-1">
                                        Our AI engine uses these skills to automatically rank and match incoming candidate resumes.
                                    </p>
                                </div>

                                {/* Job Description - Rich Text Editor or Textarea */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label htmlFor="description" className="block text-xs font-bold text-slate-700">
                                            Detailed Job Description <span className="text-rose-500">*</span>
                                        </label>
                                        {mode === 'ai' && formData.description && (
                                            <span className="text-[11px] text-slate-500">
                                                You can edit any section directly before publishing
                                            </span>
                                        )}
                                    </div>

                                    {mode === 'ai' ? (
                                        <div className="bg-white rounded-xl overflow-hidden border border-slate-200 focus-within:border-blue-500 transition">
                                            <ReactQuill
                                                theme="snow"
                                                value={formData.description}
                                                onChange={(val) => setFormData((prev) => ({ ...prev, description: val }))}
                                                modules={quillModules}
                                                placeholder="Write or generate a job description..."
                                                className="h-64 sm:h-72 mb-12"
                                            />
                                        </div>
                                    ) : (
                                        <textarea
                                            id="description"
                                            name="description"
                                            placeholder="Enter comprehensive job description..."
                                            value={formData.description}
                                            onChange={handleFormChange}
                                            required
                                            rows="8"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition resize-y text-sm"
                                        />
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
                            <div>
                                {mode === 'ai' && formData.description && (
                                    <button
                                        type="button"
                                        onClick={handleGenerate}
                                        disabled={isGenerating}
                                        className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 transition cursor-pointer"
                                    >
                                        <RefreshCw size={14} className={isGenerating ? 'animate-spin text-blue-600' : ''} />
                                        Regenerate
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleModalClose}
                                    className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-200/60 transition-colors text-sm cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    form="post-job-form"
                                    disabled={isPosting || isGenerating}
                                    className="px-6 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2 transition-all shadow-md shadow-blue-500/20 text-sm cursor-pointer"
                                >
                                    {isPosting && <Loader2 size={16} className="animate-spin" />}
                                    {isPosting ? 'Publishing...' : 'Publish Job'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PostJobModal;