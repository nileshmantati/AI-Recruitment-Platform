import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, User } from "lucide-react";
import PrimaryButton from './PrimaryButton';
import { T } from '../Js/theme';

const Navigation = () => {
    const navigate = useNavigate();
    const { auth, logout } = useAuth();
    const [scrolled, setScrolled] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        const h = () => setScrolled(window.scrollY > 8);
        window.addEventListener("scroll", h);
        return () => window.removeEventListener("scroll", h);
    }, []);

    return (
        <nav
            className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? "py-3 shadow-sm" : "py-3"}`}
            style={{ background: scrolled ? "rgba(248, 250, 252, 0.35)" : `radial-gradient(1200px 600px at 50% -10%, ${T.primary}14, transparent), radial-gradient(800px 500px at 90% 10%, ${T.secondary}14, transparent)`, backdropFilter: scrolled ? "blur(12px)" : "none" }}
        >
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-black tracking-tight">
                        <i className="bi bi-robot me-2" style={{ color: T.primary }}></i>
                        <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>
                            AI
                        </span> Recruiter
                    </span>
                </div>
                <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
                    <Link to="/" className="text-black! hover:text-primary! text-decoration-none">Home</Link>
                    <Link to="/resume-analyzer" className="text-black! hover:text-primary! text-decoration-none">Resume Analyzer</Link>
                    <Link to="/" className="text-black! hover:text-primary! text-decoration-none">Features</Link>
                    <Link to="/" className="text-black hover:text-primary text-decoration-none">How it works</Link>
                    <Link to="/" className="text-black hover:text-primary text-decoration-none">FAQ</Link>
                </div>
                <div className="flex items-center gap-4">
                    {auth.isAuthenticated ? (
                        <>
                            <Link to="/dashboard" className="text-sm font-semibold text-slate-700 hover:text-slate-900">
                                Dashboard
                            </Link>
                            <div className="hidden sm:flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-sm border border-slate-200">
                                <User size={18} className="text-indigo-600" />
                                <span className="text-sm font-bold text-slate-800">
                                    {auth.username}
                                </span>
                            </div>
                            <button onClick={handleLogout} className="rounded-lg! border border-red-500! px-4 py-2 text-sm! font-medium text-red-600 hover:bg-red-50 transition-colors transition-all">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <PrimaryButton className="px-3! py-2.5! text-sm! rounded-xl!" onClick={() => navigate("/login")}>
                                Log in <ArrowRight size={16} />
                            </PrimaryButton>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navigation;