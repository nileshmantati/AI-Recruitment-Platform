import { T } from "../../Js/theme.js";
import { Search } from "lucide-react";
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import NotificationCenter from '../Notifications/NotificationCenter.jsx';

const DashboardTopbar = ({ role }) => {
    const { auth } = useAuth();
    const navigate = useNavigate();
    const getInitials = (name = "") => {
        const words = (name || "").trim().split(/\s+/);

        if (words.length >= 2 && words[0] && words[1]) {
            return (words[0][0] + words[1][0]).toUpperCase();
        }

        return (name || "AD").slice(0, 2).toUpperCase();
    };

    const effectiveRole = (role || auth?.role || '').toLowerCase();
    const displayRole = auth?.isSuperuser
        ? 'Super Admin'
        : (effectiveRole === 'admin' ? 'Staff Admin' : (role || auth?.role || ''));

    return (
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white/95 px-6 backdrop-blur-md">
            <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 sm:w-80">
                <Search size={16} className="text-slate-400" />
                <input
                    aria-label={effectiveRole === 'admin' ? "Search users and jobs" : "Search candidates and jobs"}
                    placeholder={effectiveRole === 'admin' ? "Search users, jobs..." : "Search candidates, jobs..."}
                    className="w-full bg-transparent text-md outline-none placeholder:text-slate-400"
                />
            </div>
            <div className="flex items-center gap-3">
                <NotificationCenter role={effectiveRole} className="cursor-pointer" />
                <div className="flex items-center gap-2 pl-2 cursor-pointer">
                    <button
                        className="mb-1 me-3 flex items-center border border-slate-400 hover:border-slate-400! text-white gap-3 rounded-xl! px-4 py-2.5 text-md font-medium transition-all shadow-md cursor-pointer"
                        style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}
                        onClick={() => navigate("/")}
                    >Home
                    </button>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full text-md font-bold text-white" style={{ background: T.primary }}>{getInitials(auth?.username)}</div>
                    <div className="hidden sm:block">
                        <div className="text-md font-semibold text-slate-800 capitalize">{auth?.username || 'User'}</div>
                        <div className="text-sm text-slate-400 capitalize">{displayRole}</div>
                    </div>
                </div>
            </div>
        </header >
    )
}

export default DashboardTopbar