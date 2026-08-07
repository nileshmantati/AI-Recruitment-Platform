import { useState, useEffect } from 'react';
import { Shield, Key, Smartphone, Monitor, Clock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const SecuritySettings = () => {
    const [settings, setSettings] = useState(null);
    const [loginHistory, setLoginHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [passwords, setPasswords] = useState({ current: '', new_pass: '' });
    const [isSubmittingPass, setIsSubmittingPass] = useState(false);

    const fetchData = async () => {
        try {
            const [settingsRes, historyRes] = await Promise.all([
                api.get('/settings/security/'),
                api.get('/settings/security/login-history/')
            ]);
            setSettings(settingsRes.data);
            setLoginHistory(historyRes.data);
        } catch {
            toast.error('Failed to load security data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChangePassword = async () => {
        if (!passwords.current || !passwords.new_pass) {
            toast.error('Please enter both current and new password');
            return;
        }
        if (passwords.new_pass.length < 8) {
            toast.error('New password must be at least 8 characters');
            return;
        }

        setIsSubmittingPass(true);
        try {
            await api.put('/settings/security/', {
                current_password: passwords.current,
                new_password: passwords.new_pass
            });
            toast.success('Password updated successfully');
            setPasswords({ current: '', new_pass: '' });
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to update password');
        } finally {
            setIsSubmittingPass(false);
        }
    };

    const handle2FAToggle = async () => {
        const newValue = !settings.two_factor_auth;
        setSettings({ ...settings, two_factor_auth: newValue });
        try {
            await api.put('/settings/security/', { two_factor_auth: newValue });
            if (newValue) {
                toast.success('2FA Setup initialized (UI preview)');
            } else {
                toast.success('2FA Disabled');
            }
        } catch {
            setSettings(settings);
            toast.error('Failed to update 2FA settings');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium leading-6 text-slate-900 ">Security</h3>
                <p className="mt-1 text-sm text-slate-500 ">
                    Manage your password and secure your account.
                </p>
            </div>

            {/* Password Section */}
            <div className="bg-white  shadow rounded-lg p-6 border border-slate-200 ">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-50  text-blue-600  rounded-lg">
                        <Key size={24} />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-base font-semibold text-slate-900 ">Change Password</h4>
                        <p className="text-sm text-slate-500  mt-1">Ensure your account is using a long, random password to stay secure.</p>

                        <div className="mt-4 space-y-4 max-w-md">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 ">Current Password</label>
                                <input
                                    type="password"
                                    value={passwords.current}
                                    onChange={(e) => setPasswords(p => ({ ...p, current: e.target.value }))}
                                    placeholder="••••••••"
                                    className="mt-1 block w-full rounded-md border-slate-300  bg-white  px-3 py-2 border shadow-sm sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 ">New Password</label>
                                <input
                                    type="password"
                                    value={passwords.new_pass}
                                    onChange={(e) => setPasswords(p => ({ ...p, new_pass: e.target.value }))}
                                    placeholder="••••••••"
                                    className="mt-1 block w-full rounded-md border-slate-300  bg-white  px-3 py-2 border shadow-sm sm:text-sm"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleChangePassword}
                                disabled={isSubmittingPass}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition"
                            >
                                {isSubmittingPass ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2FA Section */}
            <div className="bg-white  shadow rounded-lg p-6 border border-slate-200 ">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-50  text-emerald-600  rounded-lg">
                        <Shield size={24} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-base font-semibold text-slate-900 ">Two-Factor Authentication (2FA)</h4>
                                <p className="text-sm text-slate-500  mt-1">Add additional security to your account using two factor authentication.</p>
                            </div>
                            <button
                                type="button"
                                className={`
                                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                                    ${settings?.two_factor_auth ? 'bg-blue-600' : 'bg-slate-200 '}
                                `}
                                onClick={handle2FAToggle}
                            >
                                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings?.two_factor_auth ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                        </div>
                        {settings?.two_factor_auth && (
                            <div className="mt-4 p-4 bg-slate-50  rounded-md border border-slate-200  text-sm text-slate-600 ">
                                Scan the QR code with an authenticator app (e.g., Google Authenticator, Authy) to complete setup. [UI Ready Placeholder]
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Login History */}
            <div className="bg-white  shadow rounded-lg overflow-hidden border border-slate-200 ">
                <div className="px-6 py-5 border-b border-slate-200  flex justify-between items-center">
                    <div>
                        <h4 className="text-base font-semibold text-slate-900 ">Recent Login Activity</h4>
                        <p className="text-sm text-slate-500  mt-1">If you notice any suspicious activity, change your password.</p>
                    </div>
                    <button className="text-sm text-red-600 hover:text-red-700   font-medium">
                        Logout All Devices
                    </button>
                </div>

                <ul className="divide-y divide-slate-200 ">
                    {loginHistory.length === 0 ? (
                        <li className="px-6 py-6 text-center text-sm text-slate-500">No login history available.</li>
                    ) : (
                        loginHistory.map((history) => (
                            <li key={history.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 ">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-slate-100  rounded-full text-slate-500 ">
                                        {(history.device || '').toLowerCase().includes('mobile') ? <Smartphone size={20} /> : <Monitor size={20} />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900 ">
                                            {history.browser || 'Unknown Browser'} on {history.device || 'Unknown Device'}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-slate-500  mt-1">
                                            <span>{history.ip_address || 'Unknown IP'}</span>
                                            <span>&bull;</span>
                                            <span className="flex items-center gap-1"><Clock size={12} /> {new Date(history.login_time).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
};

export default SecuritySettings;
