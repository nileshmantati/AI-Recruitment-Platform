import { useState } from 'react';
import { Briefcase, Clock, Calendar, CheckCircle, Plus, X } from 'lucide-react';

const inputClasses = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300";
const labelClasses = "block text-sm font-semibold text-slate-700 mb-1.5";

const CultureStep = ({ formData, setFormData }) => {
    const [newBenefit, setNewBenefit] = useState('');
    const [newPerk, setNewPerk] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const addBenefit = () => {
        if (newBenefit.trim()) {
            setFormData({ ...formData, benefits: [...(formData.benefits || []), newBenefit.trim()] });
            setNewBenefit('');
        }
    };

    const removeBenefit = (index) => {
        const updated = [...formData.benefits];
        updated.splice(index, 1);
        setFormData({ ...formData, benefits: updated });
    };

    const addPerk = () => {
        if (newPerk.trim()) {
            setFormData({ ...formData, perks: [...(formData.perks || []), newPerk.trim()] });
            setNewPerk('');
        }
    };

    const removePerk = (index) => {
        const updated = [...formData.perks];
        updated.splice(index, 1);
        setFormData({ ...formData, perks: updated });
    };

    return (
        <div className="space-y-6 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className={labelClasses}>Working Mode</label>
                    <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <select name="working_mode" value={formData.working_mode} onChange={handleChange} className={`${inputClasses} pl-8!`}>
                            <option value="REMOTE">Remote</option>
                            <option value="HYBRID">Hybrid</option>
                            <option value="ONSITE">Onsite</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className={labelClasses}>Working Days</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input type="text" name="working_days" value={formData.working_days} onChange={handleChange} className={`${inputClasses} pl-8!`} placeholder="e.g. Monday - Friday" />
                    </div>
                </div>

                <div>
                    <label className={labelClasses}>Working Hours</label>
                    <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input type="text" name="working_hours" value={formData.working_hours} onChange={handleChange} className={`${inputClasses} pl-8!`} placeholder="e.g. 9:00 AM - 5:00 PM" />
                    </div>
                </div>

                <div>
                    <label className={labelClasses}>Dress Code</label>
                    <input type="text" name="dress_code" value={formData.dress_code} onChange={handleChange} className={inputClasses} placeholder="e.g. Smart Casual, Business, None" />
                </div>

                <div className="col-span-1 md:col-span-2">
                    <label className={labelClasses}>Languages Spoken</label>
                    <input type="text" name="languages" value={formData.languages} onChange={handleChange} className={inputClasses} placeholder="e.g. English, Spanish, French (comma separated)" />
                </div>

                <div className="col-span-1 md:col-span-2">
                    <label className={labelClasses}>Benefits</label>
                    <div className="flex gap-2 mb-3">
                        <input
                            type="text"
                            value={newBenefit}
                            onChange={(e) => setNewBenefit(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                            className={inputClasses}
                            placeholder="e.g. Health Insurance, 401k..."
                        />
                        <button type="button" onClick={addBenefit} className="px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors">
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.benefits?.map((benefit, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-sm font-medium">
                                <CheckCircle className="w-3.5 h-3.5" />
                                {benefit}
                                <button type="button" onClick={() => removeBenefit(idx)} className="text-blue-400 hover:text-blue-800 ml-1">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                <div className="col-span-1 md:col-span-2">
                    <label className={labelClasses}>Perks</label>
                    <div className="flex gap-2 mb-3">
                        <input
                            type="text"
                            value={newPerk}
                            onChange={(e) => setNewPerk(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPerk())}
                            className={inputClasses}
                            placeholder="e.g. Free Lunch, Gym Membership..."
                        />
                        <button type="button" onClick={addPerk} className="px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors">
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.perks?.map((perk, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-sm font-medium">
                                <CheckCircle className="w-3.5 h-3.5" />
                                {perk}
                                <button type="button" onClick={() => removePerk(idx)} className="text-purple-400 hover:text-purple-800 ml-1">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CultureStep;
