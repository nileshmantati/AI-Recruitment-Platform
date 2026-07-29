import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Building2, MapPin, Globe, Users, Mail, Phone,
    Edit,
    Briefcase, TrendingUp, CheckCircle2, Star, Zap,
    Save, X, UploadCloud
} from 'lucide-react';

const RecruiterCompanyProfilePage = ({ isProfileCompleted, setIsProfileCompleted }) => {
    const [isEditing, setIsEditing] = useState(!isProfileCompleted);

    const [profileData, setProfileData] = useState({
        name: "TechVision AI",
        tagline: "Pioneering the future of artificial intelligence in recruitment.",
        industry: "Artificial Intelligence / HR Tech",
        size: "201-500 employees",
        founded: "2020",
        location: "San Francisco, CA",
        website: "https://techvision.ai",
        email: "contact@techvision.ai",
        phone: "+1 (555) 123-4567",
        description: "TechVision AI is at the forefront of combining machine learning with human intuition to create the most advanced recruitment platform in the world. Our mission is to eliminate bias, accelerate hiring, and match the best talent with their dream roles using state-of-the-art AI algorithms.",
        specialties: ["Machine Learning", "Natural Language Processing", "HR Tech", "Predictive Analytics", "Deep Learning"],
        socials: {
            linkedin: "https://linkedin.com/company/techvisionai",
            twitter: "https://twitter.com/techvisionai",
            github: "https://github.com/techvisionai"
        }
    });

    const [editData, setEditData] = useState(profileData);

    const handleSave = () => {
        setProfileData(editData);
        setIsEditing(false);
        if (setIsProfileCompleted) {
            setIsProfileCompleted(true);
            localStorage.setItem('profile_completed', 'true');
        }
    };

    const handleCancel = () => {
        setEditData(profileData);
        setIsEditing(false);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08, delayChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 100, damping: 15 }
        }
    };

    const glassClasses = "bg-white/70 backdrop-blur-2xl border border-slate-200/80 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden transition-all duration-300";

    const inputClasses = "w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300";

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 lg:p-8 relative overflow-hidden selection:bg-blue-500/20">
            {/* Ambient Light Mode Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-purple-400/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[120px]" />
                <div className="absolute top-[30%] left-[50%] w-[30%] h-[30%] rounded-full bg-emerald-400/15 blur-[120px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-multiply"></div>
            </div>

            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Actions */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row p-4 justify-between items-start sm:items-center gap-4 bg-white/60 backdrop-blur-lg border border-slate-200/60 rounded-2xl shadow-sm"
                >
                    <div>
                        <h1 className="text-3xl! font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                            Company Profile
                            <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                        </h1>
                        <p className="text-slate-500 mt-1 text-sm font-medium">
                            Set up your employer brand to attract the best AI talent
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {!isEditing ? (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setIsEditing(true)}
                                className="px-6 py-2.5 rounded-xl! bg-white border border-slate-200 text-slate-700 font-semibold flex items-center gap-2 shadow-sm hover:shadow-md hover:bg-slate-50 transition-all"
                            >
                                <Edit className="w-4 h-4" />
                                Edit Profile
                            </motion.button>
                        ) : (
                            <>
                                {isProfileCompleted && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleCancel}
                                        className="px-6 py-2.5 rounded-xl! bg-white border border-slate-200 text-slate-600 font-semibold flex items-center gap-2 shadow-sm hover:bg-slate-50 transition-all"
                                    >
                                        <X className="w-4 h-4" />
                                        Cancel
                                    </motion.button>
                                )}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleSave}
                                    className="px-6 py-2.5 rounded-xl! bg-slate-900 text-white font-semibold flex items-center gap-2 shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all group"
                                >
                                    <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    <span>Save Changes</span>
                                </motion.button>
                            </>
                        )}
                    </div>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                >
                    {/* Left Column - Hero Profile Card (Takes up 4 cols on large screens) */}
                    <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6">
                        <div className={`${glassClasses} p-8 flex flex-col items-center text-center group`}>
                            {/* Decorative background element inside card */}
                            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-slate-100" />

                            <div className="relative mb-6 mt-4">
                                <div className="w-36 h-36 rounded-3xl bg-white shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-center p-2 relative z-10">
                                    <div className="w-full h-full bg-slate-50 rounded-2xl flex items-center justify-center overflow-hidden relative border border-slate-100">
                                        <Building2 className="w-14 h-14 text-slate-300" />
                                        {isEditing && (
                                            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center cursor-pointer hover:bg-slate-900/70 transition-colors">
                                                <UploadCloud className="w-6 h-6 text-white mb-2" />
                                                <span className="text-xs font-semibold text-white">Upload Logo</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="w-full relative z-10">
                                {!isEditing ? (
                                    <>
                                        <h2 className="text-2xl font-bold text-slate-900 mb-2">{profileData.name}</h2>
                                        <p className="text-sm text-slate-500 mb-8 px-2 leading-relaxed">{profileData.tagline}</p>
                                    </>
                                ) : (
                                    <div className="w-full space-y-4 mb-8">
                                        <input
                                            type="text"
                                            value={editData.name}
                                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                            className={`${inputClasses} text-center font-bold text-lg`}
                                            placeholder="Company Name"
                                        />
                                        <textarea
                                            value={editData.tagline}
                                            onChange={(e) => setEditData({ ...editData, tagline: e.target.value })}
                                            className={`${inputClasses} text-center text-sm resize-none h-24`}
                                            placeholder="Company Tagline"
                                        />
                                    </div>
                                )}

                                <div className="w-full space-y-4 text-sm text-left bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                            <Briefcase className="w-4 h-4" />
                                        </div>
                                        {!isEditing ? (
                                            <span className="text-slate-700 font-medium">{profileData.industry}</span>
                                        ) : (
                                            <input
                                                type="text"
                                                value={editData.industry}
                                                onChange={(e) => setEditData({ ...editData, industry: e.target.value })}
                                                className={inputClasses}
                                            />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        {!isEditing ? (
                                            <span className="text-slate-700 font-medium">{profileData.location}</span>
                                        ) : (
                                            <input
                                                type="text"
                                                value={editData.location}
                                                onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                                                className={inputClasses}
                                            />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                            <Users className="w-4 h-4" />
                                        </div>
                                        {!isEditing ? (
                                            <span className="text-slate-700 font-medium">{profileData.size}</span>
                                        ) : (
                                            <input
                                                type="text"
                                                value={editData.size}
                                                onChange={(e) => setEditData({ ...editData, size: e.target.value })}
                                                className={inputClasses}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </motion.div>

                    {/* Right Column - Details (Takes up 8 cols on large screens) */}
                    <motion.div variants={itemVariants} className="lg:col-span-8 space-y-6">

                        {/* About Card */}
                        <div className={`${glassClasses} p-8`}>
                            <h3 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-2">
                                <span className="bg-blue-100 text-blue-600 p-1.5 rounded-lg">
                                    <Building2 className="w-5 h-5" />
                                </span>
                                About the Company
                            </h3>
                            {!isEditing ? (
                                <p className="text-slate-600 leading-relaxed text-[15px]">
                                    {profileData.description}
                                </p>
                            ) : (
                                <textarea
                                    value={editData.description}
                                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                    className={`${inputClasses} resize-none h-40`}
                                    placeholder="Company Description"
                                />
                            )}

                            <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                                        <Mail className="w-3.5 h-3.5" /> Contact Email
                                    </p>
                                    {!isEditing ? (
                                        <p className="text-slate-800 font-semibold">{profileData.email}</p>
                                    ) : (
                                        <input
                                            type="email"
                                            value={editData.email}
                                            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                            className={inputClasses}
                                        />
                                    )}
                                </div>
                                <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                                        <Phone className="w-3.5 h-3.5" /> Phone Number
                                    </p>
                                    {!isEditing ? (
                                        <p className="text-slate-800 font-semibold">{profileData.phone}</p>
                                    ) : (
                                        <input
                                            type="tel"
                                            value={editData.phone}
                                            onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                            className={inputClasses}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Specialties / Tech Stack */}
                        <div className={`${glassClasses} p-8`}>
                            <h3 className="text-xl font-bold text-slate-900 mb-5 flex items-center gap-2">
                                <span className="bg-purple-100 text-purple-600 p-1.5 rounded-lg">
                                    <Star className="w-5 h-5" />
                                </span>
                                Core Specialties
                            </h3>
                            <div className="flex flex-wrap gap-2.5">
                                {!isEditing ? (
                                    profileData.specialties.map((spec, idx) => (
                                        <span key={idx} className="px-4 py-2 rounded-full bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:border-purple-200 hover:bg-purple-50 transition-all flex items-center gap-2 shadow-sm">
                                            <CheckCircle2 className="w-4 h-4 text-purple-500" />
                                            {spec}
                                        </span>
                                    ))
                                ) : (
                                    <div className="w-full">
                                        <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Comma separated list of specialties</p>
                                        <textarea
                                            value={editData.specialties.join(", ")}
                                            onChange={(e) => setEditData({ ...editData, specialties: e.target.value.split(",").map(s => s.trim()) })}
                                            className={`${inputClasses} resize-none h-24`}
                                            placeholder="e.g. React, Node.js, AI, Machine Learning"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Visual Stats / Verification Card */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="bg-white border border-slate-200 rounded-3xl p-6 relative overflow-hidden shadow-sm group hover:shadow-md hover:border-indigo-200 transition-all">
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
                                <div className="relative z-10 flex flex-col h-full justify-between">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center mb-5">
                                        <Star className="w-6 h-6 text-indigo-600 fill-indigo-600/20" />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-extrabold text-slate-900 mb-1 tracking-tight">Top Tier</h4>
                                        <p className="text-sm font-medium text-slate-500">Verified Employer Status</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-3xl p-6 relative overflow-hidden shadow-sm group hover:shadow-md hover:border-emerald-200 transition-all">
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
                                <div className="relative z-10 flex flex-col h-full justify-between">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center mb-5">
                                        <TrendingUp className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-extrabold text-slate-900 mb-1 tracking-tight">Active Hiring</h4>
                                        <p className="text-sm font-medium text-slate-500">12 Open Positions</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default RecruiterCompanyProfilePage;
