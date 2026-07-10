import { Sparkles, LogOut, ChevronRight, ChevronLeft, LayoutDashboard, Briefcase, Users, Settings, FileText, BarChart3, Calendar, MessageSquare, Bell } from "lucide-react";
import { T } from "../Js/theme.js";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

const RecruiterSidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard" },
    { icon: Briefcase, label: "Jobs" },
    { icon: FileText, label: "Applications" },
    { icon: Users, label: "Candidates" },
    { icon: Sparkles, label: "Resume AI" },
    { icon: BarChart3, label: "Analytics" },
    { icon: Calendar, label: "Interview" },
    { icon: MessageSquare, label: "Messages" },
    { icon: Bell, label: "Notifications" },
    { icon: Settings, label: "Settings" },
];
const CandidateSidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard" },
    { icon: Briefcase, label: "Jobs" },
    { icon: FileText, label: "Applications" },
    { icon: Sparkles, label: "Resume AI" },
];

const DashboardSidebar = ({ collapsed, setCollapsed, active, setActive, role }) => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    return (
        <aside className={`flex flex-col border-r border-slate-100 bg-white transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}>
            <div className="flex items-center gap-2.5 border-b border-slate-100 ps-3 pe-2 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>
                    <i className="bi bi-robot text-white" style={{ color: T.primary }}></i>
                </div>
                {!collapsed && <span className="truncate text-xl font-bold text-slate-900"><span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>
                    AI
                </span> Recruiter</span>}
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4">
                {role === 'recruiter' ? RecruiterSidebarItems.map((item) => (
                    <button
                        key={item.label}
                        onClick={() => setActive(item.label)}
                        className={`mb-1 flex w-full items-center gap-3 rounded-xl! px-3 py-2.5 text-sm font-medium transition-all ${active === item.label ? "text-white shadow-md" : "text-slate-600 hover:bg-slate-50"}`}
                        style={active === item.label ? { background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` } : {}}
                    >
                        <item.icon size={18} className="shrink-0" />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                    </button>
                )) : CandidateSidebarItems.map((item) => (
                    <button
                        key={item.label}
                        onClick={() => setActive(item.label)}
                        className={`mb-1 flex w-full items-center gap-3 rounded-xl! px-3 py-2.5 text-sm font-medium transition-all ${active === item.label ? "text-white shadow-md" : "text-slate-600 hover:bg-slate-50"}`}
                        style={active === item.label ? { background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` } : {}}
                    >
                        <item.icon size={18} className="shrink-0" />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                    </button>
                ))
                }
            </nav>

            <div className="border-t border-slate-100 p-3">
                <button onClick={() => logout(navigate('/login'))} className="flex w-full items-center gap-3 rounded-xl! px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                    <LogOut size={18} className="shrink-0" />
                    {!collapsed && <span className="truncate">Logout</span>}
                </button>
                <button onClick={() => setCollapsed(!collapsed)} className="mt-1 flex w-full items-center justify-center rounded-xl! border border-slate-100 py-2 text-slate-400 hover:bg-slate-50">
                    {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </div>
        </aside>
    )
}

export default DashboardSidebar