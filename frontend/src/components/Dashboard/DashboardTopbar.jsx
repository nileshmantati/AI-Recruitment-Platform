import { T } from "../../Js/theme.js";
import { Search } from "lucide-react";
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const DashboardTopbar = ({ role }) => {
    const { auth } = useAuth();
    const navigate = useNavigate();
    const getInitials = (name = "") => {
        const words = name.trim().split(/\s+/);

        if (words.length >= 2) {
            return (words[0][0] + words[1][0]).toUpperCase();
        }

        return words[0].slice(0, 2).toUpperCase();
    };

    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white/80 px-6 backdrop-blur-md">
            <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 sm:w-80">
                <Search size={16} className="text-slate-400" />
                <input placeholder="Search candidates, jobs..." className="w-full bg-transparent text-md outline-none placeholder:text-slate-400" />
            </div>
            <div className="flex items-center gap-3">
                {/* <button onClick={() => setDarkMode(!darkMode)} className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100">
                    {darkMode ? <Sun size={17} /> : <Moon size={17} />}
                </button> */}
                <div className="flex items-center gap-2 pl-2">
                    <button
                        className="mb-1 me-3 flex items-center border border-slate-400 hover:border-slate-400! text-white gap-3 rounded-xl! px-4 py-2.5 text-md font-medium transition-all shadow-md"
                        style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}
                        onClick={() => navigate("/")}
                    ><span>Home</span>
                    </button>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full text-md font-bold text-white" style={{ background: T.primary }}>{getInitials(auth.username)}</div>
                    <div className="hidden sm:block">
                        <div className="text-md font-semibold text-slate-800 capitalize">{auth.username}</div>
                        <div className="text-sm text-slate-400 capitalize">{role}</div>
                    </div>
                </div>
            </div>
        </header >
    )
}

export default DashboardTopbar