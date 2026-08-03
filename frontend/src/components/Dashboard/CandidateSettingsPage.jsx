import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Lock, Palette, CreditCard, HelpCircle, AlertTriangle, Save, Eye, EyeOff, Moon, Sun, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { T } from '../../Js/theme';

import { useNavigate } from 'react-router-dom';

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };

const Toggle = ({ value, onChange, label }) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <button onClick={() => onChange(!value)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${value ? '' : 'bg-slate-200'}`}
            style={value ? { background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` } : {}}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${value ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
);

const CandidateSettingsPage = () => {
    const { auth, logout } = useAuth();
    const navigate = useNavigate();

    // Account state
    const [account, setAccount] = useState({ username: auth.username || '', email: auth.email || '' });
    const [savingAccount, setSavingAccount] = useState(false);

    // Password state
    const [passwords, setPasswords] = useState({ current: '', new_pass: '', confirm: '' });
    const [showPass, setShowPass] = useState({ current: false, new_pass: false, confirm: false });
    const [savingPass, setSavingPass] = useState(false);

    // Notifications state
    const [notifs, setNotifs] = useState({
        application_updates: true, interview_reminders: true,
        new_job_alerts: false, ai_feedback: true, email_digest: false,
    });

    // Appearance state
    const [theme, setTheme] = useState('light');

    const handleSaveAccount = async () => {
        setSavingAccount(true);
        try {
            await api.patch('auth/profile/', account);
            toast.success('Account details updated!');
        } catch { toast.error('Failed to update account.'); }
        finally { setSavingAccount(false); }
    };

    const handleChangePassword = async () => {
        if (passwords.new_pass !== passwords.confirm) { toast.error('New passwords do not match.'); return; }
        if (passwords.new_pass.length < 8) { toast.error('Password must be at least 8 characters.'); return; }
        setSavingPass(true);
        try {
            await api.post('auth/change-password/', { current_password: passwords.current, new_password: passwords.new_pass });
            toast.success('Password changed successfully!');
            setPasswords({ current: '', new_pass: '', confirm: '' });
        } catch (e) { toast.error(e.response?.data?.error || 'Failed to change password.'); }
        finally { setSavingPass(false); }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('Are you absolutely sure? This action is IRREVERSIBLE and will delete all your data.')) return;
        try { await api.delete('auth/account/'); toast.success('Account deleted.'); logout(); navigate('/login'); }
        catch { toast.error('Failed to delete account.'); }
    };

    const SectionWrapper = ({ id, title, icon: Icon, children, danger }) => (
        <div id={id}
            className={`scroll-mt-4 rounded-2xl border ${danger ? 'border-red-100' : 'border-slate-100'} bg-white shadow-sm overflow-hidden`}>
            <div className={`flex items-center gap-3 border-b px-6 py-4 ${danger ? 'border-red-100 bg-red-50/50' : 'border-slate-100'}`}
                style={!danger ? { background: `${T.primary}06` } : {}}>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${danger ? 'bg-red-100 text-red-600' : 'text-white'}`}
                    style={!danger ? { background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` } : {}}>
                    <Icon size={15} />
                </div>
                <h3 className={`font-bold text-sm tracking-wide uppercase ${danger ? 'text-red-800' : 'text-slate-800'}`}>{title}</h3>
            </div>
            <div className="p-6">{children}</div>
        </div>
    );

    const PassField = ({ label, key_, placeholder }) => (
        <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                <input type={showPass[key_] ? 'text' : 'password'} value={passwords[key_]}
                    onChange={e => setPasswords(p => ({ ...p, [key_]: e.target.value }))}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400" />
                <button type="button" onClick={() => setShowPass(p => ({ ...p, [key_]: !p[key_] }))} className="text-slate-400 hover:text-slate-600 transition">
                    {showPass[key_] ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex h-full justify-center min-h-screen" style={{ background: T.bg }}>
            {/* Main content */}
            <motion.div variants={container} initial="hidden" animate="show"
                className="flex-1 space-y-6 px-4 py-8 sm:px-6 max-w-3xl">
                {/* Account */}
                <SectionWrapper id="account" title="Account" icon={User}>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {[
                            { label: 'Username', key: 'username', placeholder: 'johndoe' },
                            { label: 'Email', key: 'email', placeholder: 'john@example.com', type: 'email' },
                        ].map(f => (
                            <div key={f.key}>
                                <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wider">{f.label}</label>
                                <input type={f.type || 'text'} value={account[f.key]}
                                    onChange={e => setAccount(p => ({ ...p, [f.key]: e.target.value }))}
                                    placeholder={f.placeholder}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all" />
                            </div>
                        ))}
                    </div>
                    <button onClick={handleSaveAccount} disabled={savingAccount}
                        className="mt-4 flex items-center gap-2 !rounded-xl px-5 py-2 text-sm font-bold text-white shadow-md transition hover:scale-95 disabled:opacity-60"
                        style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>
                        <Save size={14} /> {savingAccount ? 'Saving...' : 'Save Account'}
                    </button>
                </SectionWrapper>

                {/* Notifications */}
                <SectionWrapper id="notifications" title="Notifications" icon={Bell}>
                    <div className="divide-y divide-slate-100">
                        <Toggle value={notifs.application_updates} onChange={v => setNotifs(p => ({ ...p, application_updates: v }))} label="Application status updates" />
                        <Toggle value={notifs.interview_reminders} onChange={v => setNotifs(p => ({ ...p, interview_reminders: v }))} label="Interview reminders" />
                        <Toggle value={notifs.new_job_alerts} onChange={v => setNotifs(p => ({ ...p, new_job_alerts: v }))} label="New job alerts matching my skills" />
                        <Toggle value={notifs.ai_feedback} onChange={v => setNotifs(p => ({ ...p, ai_feedback: v }))} label="AI feedback notifications" />
                        <Toggle value={notifs.email_digest} onChange={v => setNotifs(p => ({ ...p, email_digest: v }))} label="Weekly email digest" />
                    </div>
                    <button onClick={() => toast.success('Notification preferences saved!')}
                        className="mt-4 flex items-center gap-2 !rounded-xl px-5 py-2 text-sm font-bold text-white shadow-md transition hover:scale-95"
                        style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>
                        <Save size={14} /> Save Preferences
                    </button>
                </SectionWrapper>

                {/* Security */}
                <SectionWrapper id="security" title="Security" icon={Shield}>
                    <div className="space-y-4">
                        <PassField label="Current Password" key_="current" placeholder="Enter current password" />
                        <PassField label="New Password" key_="new_pass" placeholder="Min. 8 characters" />
                        <PassField label="Confirm New Password" key_="confirm" placeholder="Repeat new password" />
                    </div>
                    <button onClick={handleChangePassword} disabled={savingPass || !passwords.current || !passwords.new_pass}
                        className="mt-4 flex items-center gap-2 !rounded-xl px-5 py-2 text-sm font-bold text-white shadow-md transition hover:scale-95 disabled:opacity-60"
                        style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>
                        <Shield size={14} /> {savingPass ? 'Changing...' : 'Change Password'}
                    </button>
                </SectionWrapper>

                {/* Privacy */}
                <SectionWrapper id="privacy" title="Privacy & Data" icon={Lock}>
                    <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
                        <p>Your resume and profile data are used only to match you with relevant job opportunities. We never share your data with third parties without your explicit consent.</p>
                        <div className="flex flex-wrap gap-2 pt-2">
                            <button onClick={() => toast.success('Data export requested. You will receive an email shortly.')}
                                className="!rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition">
                                Export My Data
                            </button>
                            <button onClick={() => toast.success('Your data will be cleared within 30 days per our policy.')}
                                className="!rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition">
                                Request Data Deletion
                            </button>
                        </div>
                    </div>
                </SectionWrapper>

                {/* Appearance */}
                <SectionWrapper id="appearance" title="Appearance" icon={Palette}>
                    <p className="mb-4 text-sm text-slate-500">Choose your preferred display theme.</p>
                    <div className="flex gap-3">
                        {[
                            { id: 'light', label: 'Light', icon: Sun },
                            { id: 'dark', label: 'Dark', icon: Moon },
                        ].map(t => (
                            <button key={t.id} onClick={() => { setTheme(t.id); toast.success(`${t.label} mode coming soon!`); }}
                                className={`flex flex-1 flex-col items-center gap-2 rounded-2xl border-2 py-4 transition-all ${theme === t.id ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                                <t.icon size={22} className={theme === t.id ? 'text-indigo-600' : 'text-slate-400'} />
                                <span className={`text-sm font-semibold ${theme === t.id ? 'text-indigo-700' : 'text-slate-600'}`}>{t.label}</span>
                                {theme === t.id && <Check size={14} className="text-indigo-500" />}
                            </button>
                        ))}
                    </div>
                </SectionWrapper>

                {/* Billing */}
                <SectionWrapper id="billing" title="Billing" icon={CreditCard}>
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 flex items-center justify-between">
                        <div>
                            <p className="font-bold text-slate-800">Free Plan</p>
                            <p className="text-xs text-slate-500 mt-0.5">Unlimited job applications · AI resume analysis</p>
                        </div>
                        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">Active</span>
                    </div>
                    <button onClick={() => toast.success('Premium plans coming soon!')}
                        className="mt-4 flex items-center gap-2 !rounded-xl px-5 py-2 text-sm font-bold text-white shadow-md transition hover:scale-95"
                        style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>
                        <CreditCard size={14} /> Upgrade to Premium
                    </button>
                </SectionWrapper>

                {/* Help */}
                <SectionWrapper id="help" title="Help & Support" icon={HelpCircle}>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {[
                            { label: '📖 Documentation', desc: 'Learn how to use AI Recruiter effectively', action: () => toast.success('Opening docs...') },
                            { label: '💬 Live Chat', desc: 'Chat with our support team', action: () => toast.success('Support chat coming soon!') },
                            { label: '🐛 Report a Bug', desc: 'Help us improve by reporting issues', action: () => toast.success('Bug report form coming soon!') },
                            { label: '✉️ Email Support', desc: 'Send us a detailed message', action: () => toast.success('support@airecruiter.com') },
                        ].map(item => (
                            <button key={item.label} onClick={item.action}
                                className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-left hover:border-slate-200 hover:bg-white transition-all">
                                <p className="font-semibold text-slate-800 text-sm">{item.label}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                            </button>
                        ))}
                    </div>
                </SectionWrapper>

                {/* Danger Zone */}
                <SectionWrapper id="danger" title="Danger Zone" icon={AlertTriangle} danger>
                    <div className="space-y-4">
                        <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                            <p className="font-bold text-red-800 text-sm">Delete Account</p>
                            <p className="mt-1 text-xs text-red-600">Permanently delete your account and all associated data. This action cannot be undone.</p>
                            <button onClick={handleDeleteAccount}
                                className="mt-3 flex items-center gap-2 !rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition">
                                <AlertTriangle size={13} /> Delete My Account
                            </button>
                        </div>
                    </div>
                </SectionWrapper>
            </motion.div>
        </div>
    );
};

export default CandidateSettingsPage;
