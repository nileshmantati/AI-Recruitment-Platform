import { useState, useEffect } from 'react';
import {
    Building2, MapPin, Globe, Users, Mail, Phone, Edit, CheckCircle, Target, Briefcase, Zap
} from 'lucide-react';
import CompanyProfileForm from '../../CompanyProfile/CompanyProfileForm';
import { companyService } from '../../../services/companyService';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

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

const RecruiterCompanyProfilePage = ({ isProfileCompleted, setIsProfileCompleted }) => {
    const [isEditing, setIsEditing] = useState(!isProfileCompleted);
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await companyService.getProfile();
                setCompany(data);
                if (data && setIsProfileCompleted) {
                    setIsProfileCompleted(true);
                    setIsEditing(false);
                }
            } catch (error) {
                // If 404, it means profile doesn't exist, we stay in edit/create mode
                if (error.response?.status === 404) {
                    setIsEditing(true);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [setIsProfileCompleted]);

    const handleFormComplete = async () => {
        setIsEditing(false);
        setLoading(true);
        try {
            const data = await companyService.getProfile();
            setCompany(data);
            if (setIsProfileCompleted) {
                setIsProfileCompleted(true);
                localStorage.setItem('profile_completed', 'true');
            }
        } catch {
            toast.error("Failed to fetch updated profile.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[85vh] w-full items-center justify-center bg-slate-50/50">
                <div className="flex flex-col items-center gap-4 text-center p-8 max-w-sm">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
                        <i className="bi bi-robot text-indigo-600 text-3xl"></i>
                    </div>
                    <div>
                        <h4 className="font-extrabold text-slate-800 text-lg">Synthesizing Company Profile data...</h4>
                    </div>
                </div>
            </div>
        );
    }

    if (isEditing) {
        return (
            <div className="p-4 sm:p-6 lg:p-8">
                <CompanyProfileForm onComplete={handleFormComplete} initialData={company} />
            </div>
        );
    }

    if (!company) return null;

    const glassClasses = "bg-white/70 backdrop-blur-2xl border border-slate-200/80 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden transition-all duration-300";

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="min-h-screen p-4 sm:p-6 lg:p-8 relative">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <motion.div variants={itemVariants} className="flex justify-between items-center bg-white/60 backdrop-blur-lg border border-slate-200/60 rounded-2xl shadow-sm p-4">
                    <div className="flex items-center gap-3">
                        <Building2 className="w-8 h-8 text-blue-600" />
                        <h1 className="text-3xl! font-bold text-slate-800">Company Profile</h1>
                    </div>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-5 py-2 rounded-xl! bg-slate-300 border border-slate-200 text-black font-semibold flex items-center gap-2 hover:bg-slate-400 transition-colors"
                    >
                        <Edit className="w-4 h-4" /> Edit Profile
                    </button>
                </motion.div>

                {/* Dashboard Bento Grid */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Main Identity */}
                    <div className={`lg:col-span-4 ${glassClasses} p-6 flex flex-col items-center text-center`}>
                        <div className="relative mb-4 w-full h-32 bg-slate-100 rounded-2xl overflow-hidden">
                            {company.cover_banner ? (
                                <img src={company.cover_banner} alt="Banner" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100" />
                            )}
                        </div>
                        <div className="w-24 h-24 rounded-2xl bg-white shadow-xl border border-slate-100 p-2 -mt-16 relative z-10">
                            {company.logo ? (
                                <img src={company.logo} alt="Logo" className="w-full h-full object-contain rounded-xl" />
                            ) : (
                                <div className="w-full h-full bg-slate-50 rounded-xl flex items-center justify-center">
                                    <Building2 className="w-8 h-8 text-slate-300" />
                                </div>
                            )}
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mt-4 flex items-center gap-2">
                            {company.name}
                            {company.is_verified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">{company.tagline || 'No tagline provided'}</p>

                        <div className="w-full mt-6 space-y-3 text-sm text-left bg-slate-50 p-4 rounded-xl">
                            <div className="flex items-center gap-3">
                                <Briefcase className="w-4 h-4 text-slate-400" /> <span className="font-medium text-slate-700">{company.industry}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Users className="w-4 h-4 text-slate-400" /> <span className="font-medium text-slate-700">{company.size || 'Size not specified'}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="w-4 h-4 text-slate-400" /> <span className="font-medium text-slate-700">{company.city || 'Location not set'}, {company.country}</span>
                            </div>
                            <div className="flex items-center flex-wrap gap-3">
                                <Globe size={18} color="red" strokeWidth={2} />
                                <span className="font-medium text-slate-700">
                                    {company.website ? (
                                        <a href={company.website} target="_blank" rel="noreferrer" className="font-medium text-blue-600 hover:underline">{company.website}</a>
                                    ) : 'No website'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* About */}
                        <div className={`${glassClasses} p-6`}>
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Target className="w-5 h-5 text-purple-500" /> About Us
                            </h3>
                            {company.about ? (
                                <div className="prose prose-sm max-w-none text-slate-600" dangerouslySetInnerHTML={{ __html: company.about }} />
                            ) : (
                                <p className="text-slate-500 italic text-sm">About information not provided.</p>
                            )}
                        </div>

                        {/* Contact & Status Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className={`${glassClasses} p-6`}>
                                <h3 className="text-lg font-bold text-slate-800 mb-4">Contact Info</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><Mail className="w-4 h-4" /></div>
                                        <span className="text-sm font-medium text-slate-700">{company.email || 'Not provided'}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><Phone className="w-4 h-4" /></div>
                                        <span className="text-sm font-medium text-slate-700">{company.phone || 'Not provided'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className={`${glassClasses} p-6 bg-gradient-to-br from-indigo-50 to-blue-50 border-blue-100`}>
                                <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-amber-500" /> AI Settings
                                </h3>
                                <p className="text-sm text-slate-600 mb-4">Your recruitment AI engine preferences.</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-600">AI Screening</span>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${company.ai_preferences?.enable_ai_screening ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                                            {company.ai_preferences?.enable_ai_screening ? 'ON' : 'OFF'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-600">Auto Shortlisting</span>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${company.ai_preferences?.enable_auto_shortlisting ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                                            {company.ai_preferences?.enable_auto_shortlisting ? 'ON' : 'OFF'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div >
    );
};

export default RecruiterCompanyProfilePage;
