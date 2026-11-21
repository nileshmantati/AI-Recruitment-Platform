import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../../Js/theme';
import { resolveMediaUrl } from '../../services/api';
import {
    X, Briefcase, Building2, MapPin, IndianRupee, Clock, Users,
    Globe, Mail, Phone, Bookmark, CheckCircle, ExternalLink,
    Sparkles, Target, Compass, Award, Calendar, ShieldCheck
} from 'lucide-react';

const getTimeAgo = (date) => {
    if (!date) return 'Recently';
    const parsed = new Date(date).getTime();
    if (isNaN(parsed)) return 'Recently';
    const diff = Math.max(0, Date.now() - parsed);
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (minutes < 60) return minutes <= 1 ? 'Just now' : `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
};

const JobDetailsModal = ({ show, handleClose, job, onApply, isSaved, onToggleSave }) => {
    const [activeTab, setActiveTab] = useState('job'); // 'job' | 'company'
    const [failedLogoUrl, setFailedLogoUrl] = useState(null);
    const [failedBannerUrl, setFailedBannerUrl] = useState(null);

    if (!show || !job) return null;

    const company = job.company_details || {};
    const hasCompany = Boolean(job.company_details && Object.keys(job.company_details).length > 0);

    const skills = Array.isArray(job.required_skills)
        ? job.required_skills
        : (job.required_skills || '').split(',').map(s => s.trim()).filter(Boolean);

    const isLogoError = Boolean(company.logo && failedLogoUrl === company.logo);
    const isBannerError = Boolean(company.cover_banner && failedBannerUrl === company.cover_banner);

    const companyLocation = [company.city, company.state, company.country].filter(Boolean).join(', ');
    const applicantCount = Number(job.applicants ?? job.applicants_count ?? job.applicant_count ?? (Array.isArray(job.applications) ? job.applications.length : 0)) || 0;

    const handleApplyClick = () => {
        handleClose();
        if (onApply) {
            onApply(job);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
                {/* Backdrop Click Dismiss */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0"
                    onClick={handleClose}
                />

                {/* Modal Window */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl overflow-hidden z-10 border border-slate-100 my-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header Banner - Unique attractive luminous mesh gradient (non-dark) */}
                    <div className="relative h-28 sm:h-36 w-full shrink-0 overflow-hidden bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b border-indigo-100/60">
                        {company.cover_banner && !isBannerError ? (
                            <img
                                src={resolveMediaUrl(company.cover_banner)}
                                alt="Company Banner"
                                className="w-full h-full object-cover"
                                onError={() => setFailedBannerUrl(company.cover_banner)}
                            />
                        ) : (
                            <>
                                {/* Ambient colorful glow orbs */}
                                <div className="absolute -top-10 -left-10 h-44 w-44 rounded-full bg-indigo-400/25 blur-2xl pointer-events-none" />
                                <div className="absolute -top-8 right-12 h-40 w-40 rounded-full bg-purple-400/25 blur-2xl pointer-events-none" />
                                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 h-32 w-72 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
                                {/* Subtle tech dots pattern */}
                                <div
                                    className="absolute inset-0 opacity-[0.06] pointer-events-none"
                                    style={{
                                        backgroundImage: `radial-gradient(${T.primary} 1.5px, transparent 1.5px)`,
                                        backgroundSize: '16px 16px'
                                    }}
                                />
                            </>
                        )}

                        {/* Close button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 text-slate-600 hover:text-slate-900 hover:bg-white shadow-sm border border-slate-200/80 backdrop-blur-md transition-all cursor-pointer z-10"
                            aria-label="Close dialog"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Identity Bar */}
                    <div className="relative px-5 sm:px-8 pb-4 pt-0 border-b border-slate-100 bg-white shrink-0">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-3">
                            <div className="flex items-end gap-3 sm:gap-4">
                                {/* Logo Avatar */}
                                <div className="-mt-10 sm:-mt-14 h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-2xl bg-white shadow-xl border-4 border-white p-2 overflow-hidden flex items-center justify-center relative z-10">
                                    {company.logo && !isLogoError ? (
                                        <img
                                            src={resolveMediaUrl(company.logo)}
                                            alt={company.name || 'Logo'}
                                            className="w-full h-full object-contain rounded-xl"
                                            onError={() => setFailedLogoUrl(company.logo)}
                                        />
                                    ) : (
                                        <div
                                            className="w-full h-full rounded-xl flex items-center justify-center text-white"
                                            style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}
                                        >
                                            <Building2 size={28} />
                                        </div>
                                    )}
                                </div>

                                <div className="min-w-0 pb-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-sm font-bold text-indigo-600 flex items-center gap-1.5">
                                            <Building2 size={14} className="text-indigo-500 shrink-0" />
                                            {company.name || job.company || job.recruiter_name || 'Hiring Company'}
                                        </span>
                                        {company.is_verified && (
                                            <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-full text-blue-700 text-[11px] font-bold" title="Verified Company">
                                                <CheckCircle size={12} className="fill-blue-600 text-white" />
                                                Verified
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 capitalize truncate tracking-tight mt-0.5">
                                        {job.title}
                                    </h2>
                                </div>
                            </div>

                            {/* Meta pills on right: Posted Day & Applied Candidates */}
                            <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2 text-xs">
                                <span className="inline-flex items-center gap-1.5 bg-slate-100/90 border border-slate-200/90 text-slate-700 px-3 py-1 rounded-full font-semibold shadow-2xs">
                                    <Clock size={12} className="text-indigo-500" />
                                    Posted {getTimeAgo(job.created_at || job.posted_at || job.posted_date || job.created)}
                                </span>
                                <span className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-semibold shadow-2xs">
                                    <Users size={12} className="text-indigo-600" />
                                    {applicantCount === 1 ? '1 candidate applied' : `${applicantCount} candidates applied`}
                                </span>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                            <button
                                onClick={() => setActiveTab('job')}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'job'
                                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-xs'
                                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                                    }`}
                            >
                                <Briefcase size={16} /> Job Overview
                            </button>
                            <button
                                onClick={() => setActiveTab('company')}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'company'
                                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-xs'
                                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                                    }`}
                            >
                                <Building2 size={16} /> Company & Culture
                                {hasCompany && (
                                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Modal Body */}
                    <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-6 space-y-6 bg-slate-50/40">
                        {activeTab === 'job' ? (
                            <>
                                {/* Quick Meta Highlights */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div className="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
                                        <div className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
                                            <IndianRupee size={13} className="text-emerald-500 shrink-0" /> Compensation
                                        </div>
                                        <div className="text-sm font-bold text-slate-800 break-words leading-snug" title={job.salary}>
                                            {job.salary || 'Competitive'}
                                        </div>
                                    </div>
                                    <div className="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
                                        <div className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
                                            <Briefcase size={13} className="text-indigo-500 shrink-0" /> Job Type
                                        </div>
                                        <div className="text-sm font-bold text-slate-800 break-words leading-snug">
                                            {job.type || 'Full-time'}
                                        </div>
                                    </div>
                                    <div className="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
                                        <div className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
                                            <MapPin size={13} className="text-rose-500 shrink-0" /> Location
                                        </div>
                                        <div className="text-sm font-bold text-slate-800 break-words leading-snug" title={companyLocation || 'Remote / Hybrid'}>
                                            {companyLocation || 'Remote / Hybrid'}
                                        </div>
                                    </div>
                                    <div className="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
                                        <div className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
                                            <Calendar size={13} className="text-purple-500 shrink-0" /> Mode
                                        </div>
                                        <div className="text-sm font-bold text-slate-800 break-words leading-snug">
                                            {company.working_mode || 'Hybrid'}
                                        </div>
                                    </div>
                                </div>

                                {/* Required Skills */}
                                {skills.length > 0 && (
                                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
                                        <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                            <Sparkles size={16} className="text-indigo-600" />
                                            Required Skills & Technologies
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {skills.map((skill, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                                                    style={{ background: `${T.primary}12`, color: T.primary }}
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Full Job Description */}
                                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-xs">
                                    <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <Briefcase size={16} className="text-indigo-600" />
                                        Job Description & Specifications
                                    </h4>

                                    {job.description ? (
                                        <div
                                            className="text-slate-600 text-sm leading-relaxed space-y-3 prose max-w-none [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mt-4 [&_h3]:mb-1 [&_h4]:text-sm [&_h4]:font-bold [&_h4]:text-slate-800 [&_h4]:mt-3 [&_h4]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_li]:text-sm [&_p]:text-sm [&_p]:leading-relaxed"
                                            dangerouslySetInnerHTML={{ __html: job.description }}
                                        />
                                    ) : (
                                        <p className="text-sm text-slate-500 italic">No description provided for this role.</p>
                                    )}
                                </div>
                            </>
                        ) : (
                            /* Company & Culture Tab */
                            <>
                                {hasCompany ? (
                                    <>
                                        {/* Company Tagline & About */}
                                        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-xs">
                                            <div className="flex items-start justify-between gap-4 mb-3">
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                                        {company.name}
                                                        {company.is_verified && (
                                                            <CheckCircle size={16} className="fill-blue-500 text-white" />
                                                        )}
                                                    </h3>
                                                    {company.tagline && (
                                                        <p className="text-sm font-medium text-slate-500 mt-0.5">
                                                            {company.tagline}
                                                        </p>
                                                    )}
                                                </div>

                                                {company.website && (
                                                    <a
                                                        href={company.website}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors"
                                                    >
                                                        <Globe size={13} className="text-slate-500" />
                                                        Website
                                                        <ExternalLink size={11} className="text-slate-400" />
                                                    </a>
                                                )}
                                            </div>

                                            {company.about && (
                                                <div
                                                    className="text-sm text-slate-600 leading-relaxed pt-2 border-t border-slate-100 mt-3"
                                                    dangerouslySetInnerHTML={{ __html: company.about }}
                                                />
                                            )}
                                        </div>

                                        {/* Company Facts Bento */}
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs">
                                                <span className="text-xs font-semibold text-slate-400 block mb-0.5">Industry</span>
                                                <span className="text-sm font-bold text-slate-800">{company.industry || 'Technology'}</span>
                                            </div>
                                            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs">
                                                <span className="text-xs font-semibold text-slate-400 block mb-0.5">Company Size</span>
                                                <span className="text-sm font-bold text-slate-800">{company.size || 'Not specified'}</span>
                                            </div>
                                            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs">
                                                <span className="text-xs font-semibold text-slate-400 block mb-0.5">Founded</span>
                                                <span className="text-sm font-bold text-slate-800">{company.founded_year || 'N/A'}</span>
                                            </div>
                                            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs">
                                                <span className="text-xs font-semibold text-slate-400 block mb-0.5">Work Schedule</span>
                                                <span className="text-sm font-bold text-slate-800">{company.working_days || 'Mon - Fri'}</span>
                                            </div>
                                            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs">
                                                <span className="text-xs font-semibold text-slate-400 block mb-0.5">Work Hours</span>
                                                <span className="text-sm font-bold text-slate-800">{company.working_hours || 'Standard Business Hours'}</span>
                                            </div>
                                            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs">
                                                <span className="text-xs font-semibold text-slate-400 block mb-0.5">Primary Location</span>
                                                <span className="text-sm font-bold text-slate-800 truncate block">{companyLocation || 'Not specified'}</span>
                                            </div>
                                        </div>

                                        {/* Mission & Vision */}
                                        {(company.mission || company.vision) && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {company.mission && (
                                                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
                                                        <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                                                            <Target size={16} className="text-rose-500" />
                                                            Our Mission
                                                        </h4>
                                                        <div
                                                            className="text-xs sm:text-sm text-slate-600 leading-relaxed"
                                                            dangerouslySetInnerHTML={{ __html: company.mission }}
                                                        />
                                                    </div>
                                                )}
                                                {company.vision && (
                                                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
                                                        <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                                                            <Compass size={16} className="text-indigo-500" />
                                                            Our Vision
                                                        </h4>
                                                        <div
                                                            className="text-xs sm:text-sm text-slate-600 leading-relaxed"
                                                            dangerouslySetInnerHTML={{ __html: company.vision }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Why Join Us */}
                                        {company.why_join_us && (
                                            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-xs">
                                                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                    <Award size={16} className="text-amber-500" />
                                                    Why Join {company.name}?
                                                </h4>
                                                <div
                                                    className="text-sm text-slate-600 leading-relaxed"
                                                    dangerouslySetInnerHTML={{ __html: company.why_join_us }}
                                                />
                                            </div>
                                        )}

                                        {/* Perks & Benefits */}
                                        {((company.benefits && company.benefits.length > 0) || (company.perks && company.perks.length > 0)) && (
                                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
                                                {company.benefits && company.benefits.length > 0 && (
                                                    <div>
                                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                            <ShieldCheck size={14} className="text-emerald-500" />
                                                            Benefits & Compensation Perks
                                                        </h4>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            {company.benefits.map((b, idx) => (
                                                                <div key={idx} className="flex items-start gap-2 text-xs font-medium text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                                                    <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                                                                    <span>{b}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {company.perks && company.perks.length > 0 && (
                                                    <div>
                                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                            <Sparkles size={14} className="text-indigo-500" />
                                                            Workplace Perks & Lifestyle
                                                        </h4>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            {company.perks.map((p, idx) => (
                                                                <div key={idx} className="flex items-start gap-2 text-xs font-medium text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                                                    <Sparkles size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                                                                    <span>{p}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Contact & Map Info */}
                                        {(company.email || company.phone || company.address) && (
                                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-wrap gap-4 text-xs font-medium text-slate-600">
                                                {company.address && (
                                                    <span className="flex items-center gap-1.5">
                                                        <MapPin size={13} className="text-slate-400" /> {company.address}
                                                    </span>
                                                )}
                                                {company.email && (
                                                    <span className="flex items-center gap-1.5">
                                                        <Mail size={13} className="text-slate-400" /> {company.email}
                                                    </span>
                                                )}
                                                {company.phone && (
                                                    <span className="flex items-center gap-1.5">
                                                        <Phone size={13} className="text-slate-400" /> {company.phone}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-2xl border border-slate-100">
                                        <Building2 size={40} className="text-slate-300 mb-3" />
                                        <h4 className="text-base font-bold text-slate-800">Company details not specified</h4>
                                        <p className="text-xs text-slate-500 max-w-sm mt-1">
                                            This position is posted by <span className="font-semibold text-slate-700">{job.recruiter_name}</span>. Additional company background will be shared during the interview.
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Sticky Footer Action Bar */}
                    <div className="border-t border-slate-200/80 bg-white px-5 sm:px-8 py-3.5 flex items-center justify-between gap-3 shrink-0 shadow-xs">
                        <div className="flex items-center gap-2">
                            {onToggleSave && (
                                <button
                                    onClick={() => onToggleSave(job)}
                                    className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${isSaved
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    <Bookmark size={15} className={isSaved ? 'fill-indigo-600 text-indigo-600' : ''} />
                                    {isSaved ? 'Saved' : 'Save Job'}
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleClose}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                                Close
                            </button>
                            <button
                                onClick={handleApplyClick}
                                disabled={job.isApplied}
                                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all hover:opacity-95 disabled:cursor-not-allowed cursor-pointer"
                                style={{
                                    background: job.isApplied
                                        ? '#9ca3af'
                                        : `linear-gradient(135deg, ${T.primary}, ${T.accent})`
                                }}
                            >
                                {job.isApplied ? 'Already Applied ✓' : 'Apply for this Position'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default JobDetailsModal;
