import toast from 'react-hot-toast';

const CandidateHelpSettings = () => {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">Help & Support</h3>
                <p className="mt-1 text-sm sm:text-base text-slate-500">
                    Get assistance, read documentation, or contact support.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                    { label: '📖 Documentation', desc: 'Learn how to maximize your candidate profile and AI resume matching', action: () => toast.success('Opening documentation...') },
                    { label: '💬 Live Chat', desc: 'Connect with support representatives in real-time', action: () => toast.success('Support chat initializing...') },
                    { label: '🐛 Report a Bug', desc: 'Help us resolve issues by submitting a bug report', action: () => toast.success('Bug report form ready') },
                    { label: '✉️ Contact Us', desc: 'Reach out to support@airecruiter.com for custom help', action: () => toast.success('Contact info copied!') },
                ].map(item => (
                    <button
                        key={item.label}
                        type="button"
                        onClick={item.action}
                        className="p-5 border border-slate-200 bg-white rounded-xl shadow-sm text-left hover:border-indigo-300 hover:shadow transition"
                    >
                        <h4 className="font-bold text-slate-900 text-base sm:text-lg">{item.label}</h4>
                        <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">{item.desc}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CandidateHelpSettings;
