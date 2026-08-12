import { CreditCard } from 'lucide-react';

const CandidateBillingSettings = () => {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">Billing & Plan</h3>
                <p className="mt-1 text-sm sm:text-base text-slate-500">
                    View your active candidate account plan details.
                </p>
            </div>

            <div className="bg-white shadow rounded-xl p-6 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 bg-purple-50 text-purple-600 rounded-xl">
                        <CreditCard size={26} />
                    </div>
                    <div>
                        <h4 className="text-base sm:text-lg font-bold text-slate-900">Free Candidate Plan</h4>
                        <p className="text-sm sm:text-base text-slate-500 mt-1">Unlimited job applications & AI resume matching.</p>
                    </div>
                </div>
                <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs sm:text-sm font-bold bg-green-100 text-green-800 border border-green-200">
                    Active
                </span>
            </div>
        </div>
    );
};

export default CandidateBillingSettings;
