import {
    Sparkles, LogOut, ChevronRight, ChevronLeft, LayoutDashboard,
    Briefcase, Users, Settings, FileText, BarChart3, Calendar,
    Building2, ChevronDown, User, Shield, Bell, Bot, GitMerge,
    Puzzle, Palette, Lock, AlertTriangle, Bookmark, FileUser,
    Activity, UserCircle, CreditCard, HelpCircle, KeyRound
} from "lucide-react";
import { T } from "../../Js/theme.js";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '../../context/AuthContext.jsx';
import { useState, useEffect } from 'react';

const RecruiterSidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard" },
    { icon: User, label: "Account" },
    { icon: Building2, label: "Company" },
    { icon: Briefcase, label: "Jobs" },
    { icon: FileText, label: "Applications" },
    { icon: Users, label: "Candidates" },
    { icon: Sparkles, label: "Resume AI" },
    { icon: BarChart3, label: "Analytics" },
    { icon: Calendar, label: "Interview" },
    { icon: Settings, label: "Settings" },
];
const CandidateSidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard" },
    { icon: UserCircle, label: "Profile" },
    { icon: Briefcase, label: "Jobs" },
    { icon: FileText, label: "Applications" },
    { icon: Bookmark, label: "Saved Jobs" },
    { icon: Sparkles, label: "Resume AI" },
    { icon: Activity, label: "Activity" },
    { icon: Calendar, label: "Interviews" },
    { icon: Settings, label: "Settings" },
];

const CANDIDATE_SETTINGS_SECTIONS = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'privacy', label: 'Privacy & Data', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, danger: true },
];

const SETTINGS_SECTIONS = [
    { id: 'team', label: 'Team Members', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'ai', label: 'AI Preferences', icon: Bot },
    { id: 'workflow', label: 'Hiring Workflow', icon: GitMerge },
    { id: 'integrations', label: 'Integrations', icon: Puzzle },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'privacy', label: 'Privacy & Data', icon: Lock },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, danger: true },
];

const DashboardSidebar = ({ collapsed, setCollapsed, active, setActive, role }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();

    const [settingsOpen, setSettingsOpen] = useState(active === "Settings");

    useEffect(() => {
        if (active === "Settings") {
            setSettingsOpen(true);
        } else {
            setSettingsOpen(false);
        }
    }, [active]);

    const handleItemClick = (item) => {
        if (item.label === "Settings") {
            setSettingsOpen(!settingsOpen);
            setActive("Settings");
        } else {
            setActive(item.label);
        }
    };

    const currentHash = location.hash.replace('#', '') || 'team';

    return (
        <aside className={`flex flex-col border-r border-slate-100 bg-white transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}>
            <div className="flex items-center gap-2.5 border-b border-slate-100 ps-3 pe-2 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>
                    <i className="bi bi-robot text-white"></i>
                </div>
                {!collapsed && <span className="truncate text-2xl font-bold text-slate-900"><span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>
                    AI
                </span> Recruiter</span>}
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4">
                {role === 'recruiter' ? RecruiterSidebarItems.map((item) => (
                    <div key={item.label} className="mb-1">
                        <button
                            onClick={() => handleItemClick(item)}
                            className={`flex w-full items-center gap-3 !rounded-xl cursor-pointer px-3 py-2.5 text-md font-medium transition-all ${active === item.label ? "text-white shadow-md" : "text-slate-600 hover:bg-slate-50"}`}
                            style={active === item.label ? { background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` } : {}}
                        >
                            <item.icon size={18} className="shrink-0" />
                            {!collapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
                            {!collapsed && item.label === "Settings" && (
                                <ChevronDown size={16} className={`transition-transform duration-200 ${settingsOpen ? 'rotate-180' : ''}`} />
                            )}
                        </button>

                        {!collapsed && item.label === "Settings" && settingsOpen && (
                            <div className="ml-4 py-2 space-y-1">
                                {SETTINGS_SECTIONS.map((subItem) => {
                                    const isActiveSub = active === "Settings" && currentHash === subItem.id;
                                    return (
                                        <button
                                            key={subItem.id}
                                            onClick={() => {
                                                navigate('/dashboard/settings#' + subItem.id);
                                            }}
                                            className={`flex w-full items-center gap-3 !rounded-lg px-3 py-2 text-sm font-medium transition-all ${isActiveSub
                                                ? subItem.danger
                                                    ? 'bg-red-50 text-red-600'
                                                    : 'bg-indigo-50 text-indigo-600'
                                                : subItem.danger
                                                    ? 'text-red-500 hover:bg-red-50'
                                                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                                                }`}
                                        >
                                            <subItem.icon size={16} className="shrink-0" />
                                            <span className="truncate">{subItem.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )) : CandidateSidebarItems.map((item) => (
                    <div key={item.label} className="mb-1">
                        <button
                            onClick={() => handleItemClick(item)}
                            className={`flex w-full items-center gap-3 !rounded-xl cursor-pointer px-3 py-2.5 text-md font-medium transition-all ${active === item.label ? "text-white shadow-md" : "text-slate-600 hover:bg-slate-50"}`}
                            style={active === item.label ? { background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` } : {}}
                        >
                            <item.icon size={18} className="shrink-0" />
                            {!collapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
                            {!collapsed && item.label === "Settings" && (
                                <ChevronDown size={16} className={`transition-transform duration-200 ${settingsOpen ? 'rotate-180' : ''}`} />
                            )}
                        </button>

                        {!collapsed && item.label === "Settings" && settingsOpen && (
                            <div className="ml-4 py-2 space-y-1">
                                {CANDIDATE_SETTINGS_SECTIONS.map((subItem) => {
                                    const isActiveSub = active === "Settings" && currentHash === subItem.id;
                                    return (
                                        <button
                                            key={subItem.id}
                                            onClick={() => {
                                                navigate('/dashboard/settings#' + subItem.id);
                                            }}
                                            className={`flex w-full items-center gap-3 !rounded-lg px-3 py-2 text-sm font-medium transition-all ${isActiveSub
                                                ? subItem.danger
                                                    ? 'bg-red-50 text-red-600'
                                                    : 'bg-indigo-50 text-indigo-600'
                                                : subItem.danger
                                                    ? 'text-red-500 hover:bg-red-50'
                                                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                                                }`}
                                        >
                                            <subItem.icon size={16} className="shrink-0" />
                                            <span className="truncate">{subItem.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))
                }
            </nav>

            <div className="border-t border-slate-100 p-3">
                <button onClick={() => logout(navigate('/login'))} className="flex w-full items-center gap-3 !rounded-xl px-3 py-2.5 text-md font-medium text-slate-600 hover:bg-slate-50">
                    <LogOut size={18} className="shrink-0" />
                    {!collapsed && <span className="truncate">Logout</span>}
                </button>
                <button onClick={() => setCollapsed(!collapsed)} className="mt-1 flex w-full items-center justify-center !rounded-xl border border-slate-100 py-2 text-slate-400 hover:bg-slate-50">
                    {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </div>
        </aside>
    )
}

export default DashboardSidebar