import { motion } from 'framer-motion';
import {
    User, Users, Bell, Shield,
    Bot, GitMerge, Puzzle, Palette, Lock, AlertTriangle
} from 'lucide-react';

const SECTIONS = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'team', label: 'Team Members', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'ai', label: 'AI Settings', icon: Bot },
    { id: 'workflow', label: 'Hiring Workflow', icon: GitMerge },
    { id: 'integrations', label: 'Integrations', icon: Puzzle },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'privacy', label: 'Privacy', icon: Lock },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, danger: true },
];

const SettingsSidebar = ({ activeSection, setActiveSection }) => {
    return (
        <div className="h-full flex flex-col py-6">
            <div className="px-6 mb-6">
                <h2 className="text-xl font-bold text-slate-800 ">Settings</h2>
                <p className="text-sm text-slate-500  mt-1">Manage your preferences</p>
            </div>

            <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
                {SECTIONS.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    const isDanger = section.danger;

                    return (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`
                                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                                relative group
                                ${isActive
                                    ? isDanger
                                        ? 'bg-red-50 text-red-600  '
                                        : 'bg-blue-50 text-blue-600  '
                                    : isDanger
                                        ? 'text-red-500 hover:bg-red-50 '
                                        : 'text-slate-600 hover:bg-slate-100  '
                                }
                            `}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className={`absolute left-0 w-1 h-6 rounded-r-full ${isDanger ? 'bg-red-500' : 'bg-blue-500'}`}
                                    initial={false}
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                />
                            )}
                            <Icon size={18} className={isActive ? '' : 'opacity-70 group-hover:opacity-100'} />
                            {section.label}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default SettingsSidebar;
