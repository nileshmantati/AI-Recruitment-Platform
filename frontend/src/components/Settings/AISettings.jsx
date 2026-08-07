import { useState, useEffect } from 'react';
import { Loader2, Sparkles, BrainCircuit } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const AISettings = () => {
    const [settings, setSettings] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // For arrays
    const [skillInput, setSkillInput] = useState('');
    const [blacklistInput, setBlacklistInput] = useState('');

    const fetchSettings = async () => {
        try {
            const response = await api.get('/settings/ai/');
            setSettings(response.data);
        } catch {
            toast.error('Failed to load AI preferences');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.put('/settings/ai/', settings);
            toast.success('AI Preferences saved successfully');
        } catch {
            toast.error('Failed to save AI preferences');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddArrayItem = (field, value, setInput) => {
        if (!value.trim()) return;
        const currentArray = settings[field] || [];
        if (!currentArray.includes(value.trim())) {
            setSettings({ ...settings, [field]: [...currentArray, value.trim()] });
        }
        setInput('');
    };

    const handleRemoveArrayItem = (field, itemToRemove) => {
        const currentArray = settings[field] || [];
        setSettings({ ...settings, [field]: currentArray.filter(item => item !== itemToRemove) });
    };

    if (isLoading || !settings) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium leading-6 text-slate-900  flex items-center gap-2">
                        <Sparkles className="text-blue-500" size={20} />
                        AI Settings
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 ">
                        Configure how the AI evaluates and processes candidate applications.
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    {isSaving && <Loader2 className="animate-spin -ml-1 mr-2" size={16} />}
                    Save AI Preferences
                </button>
            </div>

            <div className="bg-white  shadow rounded-lg p-6 border border-slate-200  space-y-8">

                {/* Core Automation */}
                <div>
                    <h4 className="text-sm font-semibold text-slate-900  uppercase tracking-wider mb-4 border-b border-slate-200  pb-2 flex items-center gap-2">
                        <BrainCircuit size={16} /> Core Automation
                    </h4>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-slate-900 ">Enable Resume AI Screening</label>
                                <p className="text-sm text-slate-500  mt-1">Automatically extract and parse candidate data from uploaded resumes.</p>
                            </div>
                            <button
                                type="button"
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${settings.enable_ai_screening ? 'bg-blue-600' : 'bg-slate-200 '}`}
                                onClick={() => setSettings({ ...settings, enable_ai_screening: !settings.enable_ai_screening })}
                            >
                                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.enable_ai_screening ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-slate-900 ">Enable Auto Shortlisting</label>
                                <p className="text-sm text-slate-500  mt-1">Automatically move candidates to 'Shortlisted' if their score exceeds the minimum threshold.</p>
                            </div>
                            <button
                                type="button"
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${settings.enable_auto_shortlisting ? 'bg-blue-600' : 'bg-slate-200 '}`}
                                onClick={() => setSettings({ ...settings, enable_auto_shortlisting: !settings.enable_auto_shortlisting })}
                            >
                                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.enable_auto_shortlisting ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Scoring Criteria */}
                <div>
                    <h4 className="text-sm font-semibold text-slate-900  uppercase tracking-wider mb-4 border-b border-slate-200  pb-2">
                        Scoring Criteria
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 ">Minimum Resume Score ({settings.minimum_resume_score}/100)</label>
                            <input
                                type="range"
                                min="0" max="100"
                                value={settings.minimum_resume_score}
                                onChange={(e) => setSettings({ ...settings, minimum_resume_score: parseInt(e.target.value) })}
                                className="w-full mt-2 accent-blue-600"
                            />
                            <div className="flex justify-between text-xs text-slate-500 mt-1">
                                <span>Lenient (0)</span>
                                <span>Strict (100)</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 ">Minimum Experience (Years)</label>
                            <input
                                type="number"
                                min="0"
                                value={settings.minimum_experience_years}
                                onChange={(e) => setSettings({ ...settings, minimum_experience_years: parseInt(e.target.value) || 0 })}
                                className="mt-1 block w-full rounded-md border-slate-300  bg-white  px-3 py-2 border sm:text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Keyword Analysis */}
                <div>
                    <h4 className="text-sm font-semibold text-slate-900  uppercase tracking-wider mb-4 border-b border-slate-200  pb-2">
                        Keyword Analysis
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Preferred Skills */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700  mb-2">Preferred Skills (Boosts Score)</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddArrayItem('preferred_skills', skillInput, setSkillInput))}
                                    className="flex-1 rounded-md border-slate-300  bg-white  px-3 py-2 border sm:text-sm"
                                    placeholder="e.g., React, Python"
                                />
                                <button type="button" onClick={() => handleAddArrayItem('preferred_skills', skillInput, setSkillInput)} className="px-3 py-2 bg-slate-100  border border-slate-300  rounded-md text-sm hover:bg-slate-200">Add</button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {settings.preferred_skills?.map((skill, idx) => (
                                    <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800  ">
                                        {skill}
                                        <button type="button" onClick={() => handleRemoveArrayItem('preferred_skills', skill)} className="ml-1 text-blue-600  hover:text-blue-900">&times;</button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Blacklisted Skills/Keywords */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700  mb-2">Blacklisted Keywords (Penalizes Score)</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={blacklistInput}
                                    onChange={(e) => setBlacklistInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddArrayItem('blacklist_keywords', blacklistInput, setBlacklistInput))}
                                    className="flex-1 rounded-md border-slate-300  bg-white  px-3 py-2 border sm:text-sm"
                                    placeholder="e.g., obsolete_tech"
                                />
                                <button type="button" onClick={() => handleAddArrayItem('blacklist_keywords', blacklistInput, setBlacklistInput)} className="px-3 py-2 bg-slate-100  border border-slate-300  rounded-md text-sm hover:bg-slate-200">Add</button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {settings.blacklist_keywords?.map((keyword, idx) => (
                                    <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800  ">
                                        {keyword}
                                        <button type="button" onClick={() => handleRemoveArrayItem('blacklist_keywords', keyword)} className="ml-1 text-red-600  hover:text-red-900">&times;</button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AISettings;
