import { Building2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CompanySettings = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium leading-6 text-slate-900 ">Company Profile</h3>
                <p className="mt-1 text-sm text-slate-500 ">
                    Manage your company information, branding, and culture details.
                </p>
            </div>

            <div className="bg-white  shadow rounded-lg p-8 border border-slate-200  text-center flex flex-col items-center justify-center">
                <div className="h-16 w-16 bg-blue-100  text-blue-600  rounded-full flex items-center justify-center mb-4">
                    <Building2 size={32} />
                </div>

                <h4 className="text-xl font-semibold text-slate-900  mb-2">
                    Company Profile is Managed Separately
                </h4>

                <p className="text-slate-500  max-w-md mx-auto mb-8">
                    Your comprehensive company profile, including branding, gallery, and culture settings, is managed in the dedicated Company Profile module.
                </p>

                <button
                    onClick={() => navigate('/dashboard/company')}
                    className="inline-flex items-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                    Edit Company Profile
                    <ExternalLink size={18} />
                </button>
            </div>
        </div>
    );
};

export default CompanySettings;
