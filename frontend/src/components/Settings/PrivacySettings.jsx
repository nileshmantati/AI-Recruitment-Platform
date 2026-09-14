import { useState, useEffect } from 'react';
import { Loader2, Download, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const PrivacySettings = () => {
    const [settings, setSettings] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            try {
                const response = await api.get('/settings/privacy/');
                if (isMounted) setSettings(response.data);
            } catch {
                if (isMounted) toast.error('Failed to load privacy settings');
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };
        load();
        return () => { isMounted = false; };
    }, []);

    const handleUpdate = async (key, value) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        try {
            await api.put('/settings/privacy/', { [key]: value });
            toast.success('Privacy preferences updated');
        } catch {
            toast.error('Failed to update privacy preferences');
        }
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
            <div>
                <h3 className="text-lg font-medium leading-6 text-slate-900 ">Privacy & Data</h3>
                <p className="mt-1 text-sm text-slate-500 ">
                    Manage your data and privacy preferences.
                </p>
            </div>

            <div className="bg-white  shadow rounded-lg border border-slate-200 ">
                <div className="p-6 border-b border-slate-200 ">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-base font-medium text-slate-900 ">Cookie Preferences</h4>
                            <p className="text-sm text-slate-500  mt-1">Allow platform to use cookies for personalization and analytics.</p>
                        </div>
                        <button
                            type="button"
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${settings.cookie_preferences ? 'bg-blue-600' : 'bg-slate-200 '}`}
                            onClick={() => handleUpdate('cookie_preferences', !settings.cookie_preferences)}
                        >
                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.cookie_preferences ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>

                <div className="p-6 border-b border-slate-200 ">
                    <h4 className="text-base font-medium text-slate-900  mb-4">Export Data</h4>
                    <p className="text-sm text-slate-500  mb-4">
                        Download a copy of all data associated with your account, including profile information and activity logs.
                    </p>
                    <button
                        onClick={() => toast.success('Data export started. You will receive an email shortly.')}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300  rounded-md shadow-sm text-sm font-medium text-slate-700  bg-white  hover:bg-slate-50  transition-colors"
                    >
                        <Download size={16} /> Download My Data
                    </button>
                </div>

                <div className="p-6">
                    <h4 className="text-base font-medium text-slate-900  mb-4">Legal Documents</h4>
                    <ul className="space-y-3">
                        <li>
                            <a href="#" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700  ">
                                Privacy Policy <ExternalLink size={14} />
                            </a>
                        </li>
                        <li>
                            <a href="#" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700  ">
                                Terms & Conditions <ExternalLink size={14} />
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default PrivacySettings;
