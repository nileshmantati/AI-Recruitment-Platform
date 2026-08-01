import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const Toggle = ({ enabled, onChange, label, description }) => (
    <div className="flex items-center justify-between py-4 border-b border-slate-200  last:border-0">
        <div className="flex-1 pr-4">
            <label className="text-sm font-medium text-slate-900 ">{label}</label>
            {description && <p className="text-sm text-slate-500  mt-1">{description}</p>}
        </div>
        <button
            type="button"
            className={`
                relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${enabled ? 'bg-blue-600' : 'bg-slate-200 '}
            `}
            onClick={() => onChange(!enabled)}
        >
            <span
                className={`
                    pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                    ${enabled ? 'translate-x-5' : 'translate-x-0'}
                `}
            />
        </button>
    </div>
);

const NotificationsSettings = () => {
    const [settings, setSettings] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);const fetchSettings = async () => {
        try {
            const response = await api.get('/settings/notifications/');
            setSettings(response.data);
        } catch { toast.error('Failed to load notification settings');
        } finally {
            setIsLoading(false);
        }
    };

    

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleToggle = async (key, value) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings); // Optimistic UI update
        setIsSaving(true);

        try {
            await api.put('/settings/notifications/', { [key]: value });
            toast.success('Preferences updated');
        } catch { setSettings(settings); // Revert on failure
            toast.error('Failed to update preferences');
        } finally {
            setIsSaving(false);
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
                <h3 className="text-lg font-medium leading-6 text-slate-900 ">Notification Preferences</h3>
                <p className="mt-1 text-sm text-slate-500 ">
                    Decide how you want to be notified about activity in your workspace.
                </p>
            </div>

            <div className="bg-white  shadow rounded-lg border border-slate-200  p-2">
                <div className="px-4">
                    <h4 className="text-sm font-semibold text-slate-900  py-4 uppercase tracking-wider border-b border-slate-200 ">
                        Delivery Methods
                    </h4>
                    <Toggle
                        label="Email Notifications"
                        description="Receive notifications via email."
                        enabled={settings.email_notifications}
                        onChange={(v) => handleToggle('email_notifications', v)}
                    />
                    <Toggle
                        label="Browser Notifications"
                        description="Receive push notifications in your browser."
                        enabled={settings.browser_notifications}
                        onChange={(v) => handleToggle('browser_notifications', v)}
                    />
                </div>

                <div className="px-4 mt-4">
                    <h4 className="text-sm font-semibold text-slate-900  py-4 uppercase tracking-wider border-b border-slate-200 ">
                        Recruitment Events
                    </h4>
                    <Toggle
                        label="New Applications"
                        description="Notify me when a candidate applies to my jobs."
                        enabled={settings.new_applications}
                        onChange={(v) => handleToggle('new_applications', v)}
                    />
                    <Toggle
                        label="Interview Reminders"
                        description="Get a reminder 1 hour before an interview."
                        enabled={settings.interview_reminders}
                        onChange={(v) => handleToggle('interview_reminders', v)}
                    />
                    <Toggle
                        label="Candidate Status Updates"
                        description="Notify me when a candidate moves to a new stage."
                        enabled={settings.candidate_status_updates}
                        onChange={(v) => handleToggle('candidate_status_updates', v)}
                    />
                    <Toggle
                        label="Resume AI Completion"
                        description="Notify me when the AI finishes evaluating a batch of resumes."
                        enabled={settings.resume_ai_completion}
                        onChange={(v) => handleToggle('resume_ai_completion', v)}
                    />
                </div>

                <div className="px-4 mt-4">
                    <h4 className="text-sm font-semibold text-slate-900  py-4 uppercase tracking-wider border-b border-slate-200 ">
                        Updates & Alerts
                    </h4>
                    <Toggle
                        label="Weekly Reports"
                        description="Receive a weekly summary of recruitment activities."
                        enabled={settings.weekly_reports}
                        onChange={(v) => handleToggle('weekly_reports', v)}
                    />
                    <Toggle
                        label="Security Alerts"
                        description="Get notified about unusual login activity."
                        enabled={settings.security_alerts}
                        onChange={(v) => handleToggle('security_alerts', v)}
                    />
                </div>
            </div>
        </div>
    );
};

export default NotificationsSettings;
