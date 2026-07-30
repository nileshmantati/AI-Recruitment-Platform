import { MapPin, Globe, Map } from 'lucide-react';

const inputClasses = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300";
const labelClasses = "block text-sm font-semibold text-slate-700 mb-1.5";

const ContactStep = ({ formData, setFormData }) => {
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="space-y-6 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className={labelClasses}>Country *</label>
                    <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input type="text" name="country" value={formData.country} onChange={handleChange} className={`${inputClasses} pl-8!`} placeholder="e.g. United States" required />
                    </div>
                </div>

                <div>
                    <label className={labelClasses}>State / Province *</label>
                    <div className="relative">
                        <Map className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input type="text" name="state" value={formData.state} onChange={handleChange} className={`${inputClasses} pl-8!`} placeholder="e.g. California" required />
                    </div>
                </div>

                <div>
                    <label className={labelClasses}>City *</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input type="text" name="city" value={formData.city} onChange={handleChange} className={`${inputClasses} pl-8!`} placeholder="e.g. San Francisco" required />
                    </div>
                </div>

                <div>
                    <label className={labelClasses}>Postal Code / ZIP</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input type="text" name="postal_code" value={formData.postal_code} onChange={handleChange} className={`${inputClasses} pl-8!`} placeholder="e.g. 94105" />
                    </div>
                </div>

                <div className="col-span-1 md:col-span-2">
                    <label className={labelClasses}>Full Address *</label>
                    <textarea name="address" value={formData.address} onChange={handleChange} className={`${inputClasses} h-24 resize-none`} placeholder="e.g. 123 Tech Lane, Suite 400" required />
                </div>

                <div className="col-span-1 md:col-span-2">
                    <label className={labelClasses}>Google Maps Link</label>
                    <div className="relative">
                        <Map className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input type="url" name="google_map_link" value={formData.google_map_link} onChange={handleChange} className={`${inputClasses} pl-8!`} placeholder="https://maps.google.com/..." />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactStep;
