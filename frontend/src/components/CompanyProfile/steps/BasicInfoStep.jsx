import { Building2, Globe, Phone, Mail, FileText, Briefcase, Hash } from 'lucide-react';
import { companyService } from '../../../services/companyService';
import toast from 'react-hot-toast';
import { useState } from 'react';

const inputClasses = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300";
const labelClasses = "block text-sm font-semibold text-slate-700 mb-1.5";

const BasicInfoStep = ({ formData, setFormData }) => {
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) return toast.error("Logo size must be less than 2MB");
        setUploadingLogo(true);
        try {
            const res = await companyService.uploadLogo(file);
            setFormData({ ...formData, logo: res.logo_url });
            toast.success("Logo uploaded!");
        } catch {
            toast.error("Failed to upload logo.");
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleBannerUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) return toast.error("Banner size must be less than 5MB");
        setUploadingBanner(true);
        try {
            const res = await companyService.uploadBanner(file);
            setFormData({ ...formData, cover_banner: res.banner_url });
            toast.success("Banner uploaded!");
        } catch {
            toast.error("Failed to upload banner.");
        } finally {
            setUploadingBanner(false);
        }
    };

    return (
        <div className="space-y-6 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2 flex flex-col sm:flex-row gap-6 items-start sm:items-center p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-white overflow-hidden relative">
                            {formData.logo ? (
                                <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <Building2 className="w-8 h-8 text-slate-300" />
                            )}
                            <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                            {uploadingLogo && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>}
                        </div>
                        <div className="text-center mt-2 text-xs font-semibold text-slate-500">Upload Logo</div>
                    </div>
                    <div className="relative flex-1 w-full group">
                        <div className="w-full h-24 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-white overflow-hidden relative">
                            {formData.cover_banner ? (
                                <img src={formData.cover_banner} alt="Banner" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-sm font-medium text-slate-400">Click to upload cover banner (1200x400)</span>
                            )}
                            <input type="file" accept="image/*" onChange={handleBannerUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                            {uploadingBanner && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>}
                        </div>
                    </div>
                </div>

                <div>
                    <label className={labelClasses}>Company Name *</label>
                    <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className={`${inputClasses} pl-8!`} placeholder="e.g. Acme Corp" required />
                    </div>
                </div>

                <div>
                    <label className={labelClasses}>Tagline</label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input type="text" name="tagline" value={formData.tagline} onChange={handleChange} className={`${inputClasses} pl-8!`} placeholder="Innovating the future..." />
                    </div>
                </div>

                <div>
                    <label className={labelClasses}>Industry *</label>
                    <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input type="text" name="industry" value={formData.industry} onChange={handleChange} className={`${inputClasses} pl-8!`} placeholder="e.g. Information Technology" required />
                    </div>
                </div>

                <div>
                    <label className={labelClasses}>Company Size</label>
                    <select name="size" value={formData.size} onChange={handleChange} className={inputClasses}>
                        <option value="">Select Size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="501-1000">501-1000 employees</option>
                        <option value="1000+">1000+ employees</option>
                    </select>
                </div>

                <div>
                    <label className={labelClasses}>Founded Year</label>
                    <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input type="number" name="founded_year" value={formData.founded_year} onChange={handleChange} className={`${inputClasses} pl-8!`} placeholder="e.g. 2010" />
                    </div>
                </div>

                <div>
                    <label className={labelClasses}>Website URL</label>
                    <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input type="url" name="website" value={formData.website} onChange={handleChange} className={`${inputClasses} pl-8!`} placeholder="https://..." />
                    </div>
                </div>

                <div>
                    <label className={labelClasses}>Company Email *</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className={`${inputClasses} pl-8!`} placeholder="contact@company.com" required />
                    </div>
                </div>

                <div>
                    <label className={labelClasses}>Company Phone</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={`${inputClasses} pl-8!`} placeholder="+1 (555) 000-0000" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BasicInfoStep;
