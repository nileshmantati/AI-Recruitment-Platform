import { useState, useEffect } from 'react';
import { Loader2, Moon, Sun, Monitor } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const AppearanceSettings = () => {
    const [settings, setSettings] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const colorMap = {
        blue: '#3b82f6',
        purple: '#a855f7',
        emerald: '#10b981',
        amber: '#f59e0b',
        rose: '#f43f5e'
    };

    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            try {
                const response = await api.get('/settings/appearance/');
                if (isMounted) setSettings(response.data);
            } catch {
                if (isMounted) toast.error('Failed to load appearance settings');
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
            await api.put('/settings/appearance/', { [key]: value });
            toast.success('Appearance updated');
        } catch {
            toast.error('Failed to update appearance');
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
                <h3 className="text-lg font-medium leading-6 text-slate-900 ">Appearance</h3>
                <p className="mt-1 text-sm text-slate-500 ">
                    Customize how the platform looks on your device.
                </p>
            </div>

            <div className="bg-white  shadow rounded-lg p-6 border border-slate-200  space-y-8">

                {/* Theme Selection */}
                <div>
                    <h4 className="text-base font-medium text-slate-900  mb-4">Theme Preferences</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => handleUpdate('theme', 'light')}
                            className={`flex flex-col items-center p-4 border rounded-lg transition-colors ${settings.theme === 'light' ? 'border-blue-500 bg-blue-50  text-blue-700 ' : 'border-slate-200  text-slate-600  hover:bg-slate-50 '}`}
                        >
                            <Sun size={24} className="mb-2" />
                            <span className="font-medium text-sm">Light</span>
                        </button>

                        <button
                            onClick={() => handleUpdate('theme', 'dark')}
                            className={`flex flex-col items-center p-4 border rounded-lg transition-colors ${settings.theme === 'dark' ? 'border-blue-500 bg-blue-50  text-blue-700 ' : 'border-slate-200  text-slate-600  hover:bg-slate-50 '}`}
                        >
                            <Moon size={24} className="mb-2" />
                            <span className="font-medium text-sm">Dark</span>
                        </button>

                        <button
                            onClick={() => handleUpdate('theme', 'system')}
                            className={`flex flex-col items-center p-4 border rounded-lg transition-colors ${settings.theme === 'system' ? 'border-blue-500 bg-blue-50  text-blue-700 ' : 'border-slate-200  text-slate-600  hover:bg-slate-50 '}`}
                        >
                            <Monitor size={24} className="mb-2" />
                            <span className="font-medium text-sm">System</span>
                        </button>
                    </div>
                </div>

                {/* Accent Color */}
                <div className="pt-6 border-t border-slate-200 ">
                    <h4 className="text-base font-medium text-slate-900  mb-4">Accent Color</h4>
                    <div className="flex gap-4">
                        {['blue', 'purple', 'emerald', 'amber', 'rose'].map((color) => (
                            <button
                                key={color}
                                onClick={() => handleUpdate('accent_color', color)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform ${settings.accent_color === color ? 'scale-110 ring-2 ring-offset-2 ring-slate-400 ' : 'hover:scale-105'}`}
                                style={{ backgroundColor: colorMap[color] || '#3b82f6' }}
                            >
                                {settings.accent_color === color && <div className="w-2 h-2 bg-white rounded-full"></div>}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Animations */}
                <div className="pt-6 border-t border-slate-200  flex items-center justify-between">
                    <div>
                        <h4 className="text-base font-medium text-slate-900 ">Enable Animations</h4>
                        <p className="text-sm text-slate-500  mt-1">Show UI animations and page transitions.</p>
                    </div>
                    <button
                        type="button"
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${settings.enable_animations ? 'bg-blue-600' : 'bg-slate-200 '}`}
                        onClick={() => handleUpdate('enable_animations', !settings.enable_animations)}
                    >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.enable_animations ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AppearanceSettings;
