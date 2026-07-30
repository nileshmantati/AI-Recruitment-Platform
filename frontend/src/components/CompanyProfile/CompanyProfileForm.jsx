import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2, FileText, MapPin,
    Briefcase, Image as ImageIcon, Cpu, ChevronRight, ChevronLeft, Save, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { companyService } from '../../services/companyService';

// Import Steps (We will create these next)
import BasicInfoStep from './steps/BasicInfoStep';
import AboutStep from './steps/AboutStep';
import ContactStep from './steps/ContactStep';
// Social step removed
import LocationsStep from './steps/LocationsStep';
import CultureStep from './steps/CultureStep';
import DocumentsStep from './steps/DocumentsStep';
import BrandingStep from './steps/BrandingStep';
import AIPreferencesStep from './steps/AIPreferencesStep';

const STEPS = [
    { id: 1, title: 'Basic Info', icon: Building2 },
    { id: 2, title: 'About', icon: FileText },
    { id: 3, title: 'Contact', icon: MapPin },
    // Social step removed
    { id: 4, title: 'Locations', icon: MapPin },
    { id: 5, title: 'Culture', icon: Briefcase },
    { id: 6, title: 'Documents', icon: FileText },
    { id: 7, title: 'Branding', icon: ImageIcon },
    { id: 8, title: 'AI Preferences', icon: Cpu },
];

const CompanyProfileForm = ({ onComplete, initialData = null }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(initialData || {
        name: '', tagline: '', industry: '', size: '', founded_year: '', website: '', email: '', phone: '',
        about: '', mission: '', vision: '', why_join_us: '',
        country: '', state: '', city: '', address: '', postal_code: '', google_map_link: '',
        working_mode: 'HYBRID', working_days: '', working_hours: '', benefits: [], perks: [], languages: '', dress_code: '',
        branding: { primary_color: '#0f172a', secondary_color: '#3b82f6', theme: 'light' },
        ai_preferences: { enable_ai_screening: true, enable_auto_shortlisting: false, minimum_resume_score: 70, minimum_experience_years: 0, preferred_skills: [], blacklist_keywords: [] }
    });

    const handleNext = () => {
        if (currentStep < STEPS.length) setCurrentStep(prev => prev + 1);
    };

    const handlePrev = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const cleanedData = { ...formData };
            if (cleanedData.founded_year === '') cleanedData.founded_year = null;
            if (cleanedData.ai_preferences?.minimum_experience_years === '') {
                cleanedData.ai_preferences.minimum_experience_years = 0;
            }
            if (cleanedData.ai_preferences?.minimum_resume_score === '') {
                cleanedData.ai_preferences.minimum_resume_score = 70;
            }

            if (initialData?.id) {
                await companyService.updateProfile(initialData.id, cleanedData);
                toast.success('Company profile updated successfully!');
            } else {
                await companyService.createProfile(cleanedData);
                toast.success('Company profile created successfully!');
            }
            if (onComplete) onComplete();
        } catch (error) {
            console.error('Error saving profile:', error);
            toast.error(error.response?.data?.detail || 'Failed to save profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        const props = { formData, setFormData };
        switch (currentStep) {
            case 1: return <BasicInfoStep {...props} />;
            case 2: return <AboutStep {...props} />;
            case 3: return <ContactStep {...props} />;
            case 4: return <LocationsStep {...props} />;
            case 5: return <CultureStep {...props} />;
            case 6: return <DocumentsStep {...props} />;
            case 7: return <BrandingStep {...props} />;
            case 8: return <AIPreferencesStep {...props} />;
            default: return null;
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto w-full h-full">
            {/* Sidebar / Progress */}
            <div className="lg:w-1/4 w-full shrink-0">
                <div className="bg-white/70 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 sticky top-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Profile Setup</h3>
                    <div className="space-y-2">
                        {STEPS.map((step) => {
                            const Icon = step.icon;
                            const isActive = currentStep === step.id;
                            const isCompleted = currentStep > step.id;

                            return (
                                <button
                                    key={step.id}
                                    onClick={() => setCurrentStep(step.id)}
                                    className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-300 text-left ${isActive
                                        ? 'bg-blue-50 border-blue-200 border text-blue-700 shadow-sm'
                                        : isCompleted
                                            ? 'hover:bg-slate-50 text-slate-600'
                                            : 'text-slate-400 opacity-70 cursor-not-allowed'
                                        }`}
                                    disabled={!isActive && !isCompleted && currentStep !== step.id - 1} // allow jumping to next or previous
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isActive ? 'bg-blue-600 text-white' :
                                        isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                                        }`}>
                                        {isCompleted ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                                    </div>
                                    <span className={`text-sm font-medium ${isActive ? 'font-bold' : ''}`}>{step.title}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Form Content */}
            <div className="lg:w-3/4 w-full flex flex-col min-h-[600px]">
                <div className="bg-white/80 backdrop-blur-2xl border border-slate-200 rounded-3xl shadow-sm p-6 sm:p-8 flex-1 relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="h-full flex flex-col"
                        >
                            <div className="mb-6 border-b border-slate-100 pb-4">
                                <h2 className="text-2xl font-bold text-slate-800">{STEPS[currentStep - 1].title}</h2>
                                <p className="text-sm text-slate-500 mt-1">Please provide accurate information to attract the best candidates.</p>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                {renderStep()}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-6">
                    <button
                        onClick={handlePrev}
                        disabled={currentStep === 1}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all ${currentStep === 1
                            ? 'opacity-0 cursor-default'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:shadow-sm'
                            }`}
                    >
                        <ChevronLeft className="w-4 h-4" /> Back
                    </button>

                    {currentStep < STEPS.length ? (
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold bg-slate-900 text-white hover:bg-slate-800 shadow-md transition-all group"
                        >
                            Next Step <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            )}
                            {loading ? 'Saving...' : 'Submit Profile'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CompanyProfileForm;
