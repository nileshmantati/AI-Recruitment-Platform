import { Palette, Layout } from 'lucide-react';

const inputClasses = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300";
const labelClasses = "block text-sm font-semibold text-slate-700 mb-1.5";

const BrandingStep = ({ formData, setFormData }) => {
    const handleChange = (e) => {
        setFormData({
            ...formData,
            branding: { ...formData.branding, [e.target.name]: e.target.value }
        });
    };

    return (
        <div className="space-y-8 pb-8">
            <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-purple-500" />
                    Color Palette
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className={labelClasses}>Primary Color</label>
                        <div className="flex gap-4 items-center">
                            <input
                                type="color"
                                name="primary_color"
                                value={formData.branding?.primary_color || '#0f172a'}
                                onChange={handleChange}
                                className="w-14 h-14 rounded-xl cursor-pointer border-0 p-1 bg-white shadow-sm"
                            />
                            <input
                                type="text"
                                name="primary_color"
                                value={formData.branding?.primary_color || '#0f172a'}
                                onChange={handleChange}
                                className={inputClasses}
                            />
                        </div>
                    </div>
                    <div>
                        <label className={labelClasses}>Secondary Color</label>
                        <div className="flex gap-4 items-center">
                            <input
                                type="color"
                                name="secondary_color"
                                value={formData.branding?.secondary_color || '#3b82f6'}
                                onChange={handleChange}
                                className="w-14 h-14 rounded-xl cursor-pointer border-0 p-1 bg-white shadow-sm"
                            />
                            <input
                                type="text"
                                name="secondary_color"
                                value={formData.branding?.secondary_color || '#3b82f6'}
                                onChange={handleChange}
                                className={inputClasses}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Layout className="w-5 h-5 text-indigo-500" />
                    Career Page Theme
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {['light', 'dark', 'glass'].map((theme) => (
                        <label key={theme} className={`
                            relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all
                            ${formData.branding?.theme === theme ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-slate-200 hover:border-slate-300 bg-white'}
                        `}>
                            <input
                                type="radio"
                                name="theme"
                                value={theme}
                                checked={formData.branding?.theme === theme}
                                onChange={handleChange}
                                className="sr-only"
                            />
                            <span className="capitalize font-semibold text-slate-700">{theme}</span>
                            {formData.branding?.theme === theme && (
                                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500" />
                            )}
                        </label>
                    ))}
                </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-2">Office Photos Gallery</h3>
                <p className="text-sm text-slate-500 mb-4">Upload photos of your office and team to attract candidates. (Handled via Dashboard later)</p>
                <div className="w-full h-32 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center">
                    <span className="text-slate-400 font-medium">Gallery management available in dashboard after creation.</span>
                </div>
            </div>
        </div>
    );
};

export default BrandingStep;
