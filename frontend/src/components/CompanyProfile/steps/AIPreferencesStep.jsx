import { Cpu, Zap, Target, AlertTriangle } from 'lucide-react';

const inputClasses = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300";
const labelClasses = "block text-sm font-semibold text-slate-700 mb-1.5";

const AIPreferencesStep = ({ formData, setFormData }) => {
    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({
            ...formData,
            ai_preferences: { ...formData.ai_preferences, [e.target.name]: value }
        });
    };

    return (
        <div className="space-y-8 pb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                    <Cpu className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <h4 className="text-blue-900 font-bold mb-1">AI Hiring Engine</h4>
                    <p className="text-blue-700 text-sm">Configure how our AI engine screens and matches candidates to your company profile automatically.</p>
                </div>
            </div>

            <div className="space-y-4">
                <label className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white cursor-pointer transition-all">
                    <div className="flex gap-4 items-center">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-indigo-500" />
                        </div>
                        <div>
                            <span className="font-bold text-slate-800 block">Enable AI Resume Screening</span>
                            <span className="text-sm text-slate-500">Automatically parse and score incoming resumes based on job requirements.</span>
                        </div>
                    </div>
                    <div className="relative inline-block w-12 h-6 rounded-full bg-slate-200">
                        <input
                            type="checkbox"
                            name="enable_ai_screening"
                            checked={formData.ai_preferences?.enable_ai_screening}
                            onChange={handleChange}
                            className="sr-only peer"
                        />
                        <span className="absolute inset-0 rounded-full bg-slate-300 transition-colors peer-checked:bg-blue-500"></span>
                        <span className="absolute inset-y-1 left-1 w-4 h-4 rounded-full bg-white transition-transform peer-checked:translate-x-6"></span>
                    </div>
                </label>

                <label className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white cursor-pointer transition-all">
                    <div className="flex gap-4 items-center">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                            <Target className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <span className="font-bold text-slate-800 block">Enable Auto-Shortlisting</span>
                            <span className="text-sm text-slate-500">Automatically move candidates to shortlisted if they pass the minimum score.</span>
                        </div>
                    </div>
                    <div className="relative inline-block w-12 h-6 rounded-full bg-slate-200">
                        <input
                            type="checkbox"
                            name="enable_auto_shortlisting"
                            checked={formData.ai_preferences?.enable_auto_shortlisting}
                            onChange={handleChange}
                            className="sr-only peer"
                        />
                        <span className="absolute inset-0 rounded-full bg-slate-300 transition-colors peer-checked:bg-emerald-500"></span>
                        <span className="absolute inset-y-1 left-1 w-4 h-4 rounded-full bg-white transition-transform peer-checked:translate-x-6"></span>
                    </div>
                </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div>
                    <label className={labelClasses}>Minimum Resume Score (0-100)</label>
                    <input
                        type="number"
                        name="minimum_resume_score"
                        value={formData.ai_preferences?.minimum_resume_score || 70}
                        onChange={handleChange}
                        min="0" max="100"
                        className={inputClasses}
                    />
                </div>
                <div>
                    <label className={labelClasses}>Minimum Experience (Years)</label>
                    <input
                        type="number"
                        name="minimum_experience_years"
                        value={formData.ai_preferences?.minimum_experience_years || 0}
                        onChange={handleChange}
                        min="0"
                        className={inputClasses}
                    />
                </div>
                <div className="col-span-1 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700 mb-1.5 flex! items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" /> Blacklist Keywords
                    </label>
                    <input
                        type="text"
                        name="blacklist_keywords_input"
                        placeholder="e.g. outsourced, temporary, banned (Comma separated)"
                        className={inputClasses}
                        onChange={(e) => {
                            const val = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                            setFormData({
                                ...formData,
                                ai_preferences: { ...formData.ai_preferences, blacklist_keywords: val }
                            });
                        }}
                    />
                    <p className="text-xs text-slate-500 mt-2">Resumes containing these keywords will receive a severe penalty in AI scoring.</p>
                </div>
            </div>
        </div>
    );
};

export default AIPreferencesStep;
