import { Linkedin, Github, Twitter, Facebook, Instagram, Youtube } from 'lucide-react';

const inputClasses = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300";
const labelClasses = "block text-sm font-semibold text-slate-700 mb-1.5";

const SocialStep = ({ formData, setFormData }) => {
    const handleChange = (e) => {
        setFormData({
            ...formData,
            socials: { ...formData.socials, [e.target.name]: e.target.value }
        });
    };

    return (
        <div className="space-y-6 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className={labelClasses}>LinkedIn</label>
                    <div className="relative">
                        <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input type="url" name="linkedin" value={formData.socials.linkedin || ''} onChange={handleChange} className={`${inputClasses} pl-10`} placeholder="https://linkedin.com/company/..." />
                    </div>
                </div>

                <div>
                    <label className={labelClasses}>Twitter</label>
                    <div className="relative">
                        <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input type="url" name="twitter" value={formData.socials.twitter || ''} onChange={handleChange} className={`${inputClasses} pl-10`} placeholder="https://twitter.com/..." />
                    </div>
                </div>

                <div>
                    <label className={labelClasses}>GitHub</label>
                    <div className="relative">
                        <Github className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input type="url" name="github" value={formData.socials.github || ''} onChange={handleChange} className={`${inputClasses} pl-10`} placeholder="https://github.com/..." />
                    </div>
                </div>

                <div>
                    <label className={labelClasses}>Facebook</label>
                    <div className="relative">
                        <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input type="url" name="facebook" value={formData.socials.facebook || ''} onChange={handleChange} className={`${inputClasses} pl-10`} placeholder="https://facebook.com/..." />
                    </div>
                </div>

                <div>
                    <label className={labelClasses}>Instagram</label>
                    <div className="relative">
                        <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input type="url" name="instagram" value={formData.socials.instagram || ''} onChange={handleChange} className={`${inputClasses} pl-10`} placeholder="https://instagram.com/..." />
                    </div>
                </div>

                <div>
                    <label className={labelClasses}>YouTube</label>
                    <div className="relative">
                        <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input type="url" name="youtube" value={formData.socials.youtube || ''} onChange={handleChange} className={`${inputClasses} pl-10`} placeholder="https://youtube.com/..." />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SocialStep;
