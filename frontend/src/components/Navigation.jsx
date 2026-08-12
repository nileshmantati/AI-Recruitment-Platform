import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, User, Menu, X } from "lucide-react";
import PrimaryButton from './PrimaryButton';
import { T } from '../Js/theme';

const Navigation = () => {
    const navigate = useNavigate();
    const { auth, logout } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsMobileMenuOpen(false);
    };

    const navItems = [
        { name: "Home", path: "/" },
        { name: "Resume Analyzer", path: "/resume-analyzer" },
        { name: "Features", path: "#" },
        { name: "How it Works", path: "#" },
        { name: "FAQ", path: "#" },
    ];

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    // Close menu when resizing to desktop view
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isMobileMenuOpen]);

    const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <nav
            className={`sticky top-0 z-[100] w-full transition-all duration-300 ${scrolled ? "py-2 shadow-sm" : "py-4"
                }`}
            style={{
                background: scrolled
                    ? "rgba(248, 250, 252, 0.95)"
                    : `radial-gradient(1200px 600px at 50% -10%, ${T.primary}14, transparent), radial-gradient(800px 500px at 90% 10%, ${T.secondary}14, transparent)`,
                backdropFilter: scrolled ? "blur(12px)" : "none"
            }}
        >
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <Link
                        to="/"
                        onClick={closeMobileMenu}
                        className="flex items-center gap-2 no-underline"
                    >
                        <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight flex items-center">
                            <i className="bi bi-robot me-2" style={{ color: T.primary }}></i>
                            <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}>
                                AI
                            </span> <span className="ml-1">Recruiter</span>
                        </span>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden items-center gap-8 text-base font-medium text-slate-600 md:flex">
                    {navItems.map((item, index) => (
                        <Link
                            key={`${item.name}-${index}`}
                            to={item.path}
                            className={`transition-colors no-underline ${location.pathname === item.path
                                ? "text-indigo-600 font-semibold"
                                : "text-slate-700 hover:text-indigo-600"
                                }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-4">
                    {auth.isAuthenticated ? (
                        <>
                            <Link to="/findjobs" className="text-base no-underline font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                                Jobs
                            </Link>
                            <Link to="/dashboard" className="text-base no-underline font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                                Dashboard
                            </Link>
                            <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-sm border border-slate-200">
                                <User size={18} className="text-indigo-600" />
                                <span className="max-w-[90px] sm:max-w-[120px] lg:max-w-[150px] truncate text-sm font-semibold">
                                    {auth.username}
                                </span>
                            </div>
                            <button onClick={handleLogout} className="rounded-lg border border-red-500 px-4 py-2 text-base font-medium text-red-600 hover:bg-red-50 transition-colors">
                                Logout
                            </button>
                        </>
                    ) : (
                        <PrimaryButton className="px-4 py-2.5 text-sm rounded-xl" onClick={() => navigate("/login")}>
                            Log in <ArrowRight size={16} />
                        </PrimaryButton>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <div className="flex md:hidden items-center gap-3">
                    <button
                        onClick={toggleMobileMenu}
                        className="text-slate-600 hover:text-slate-900 focus:outline-none p-2 rounded-md hover:bg-slate-100 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-x-0 top-[60px] h-[calc(100vh-60px)] bg-white z-[100] md:hidden flex flex-col px-6 py-6 overflow-y-auto transition-all duration-300 border-t border-slate-100"
                >
                    <div className="flex flex-col gap-2">
                        {navItems.map((item, index) => (
                            <Link
                                key={`${item.name}-${index}`}
                                to={item.path}
                                className={`flex items-center py-3 px-4 rounded-xl text-lg transition-colors no-underline ${location.pathname === item.path
                                    ? "bg-indigo-50 text-indigo-600 font-semibold"
                                    : "text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                                    }`}
                                onClick={closeMobileMenu}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    <div className="h-px bg-slate-200 w-full my-6"></div>

                    {auth.isAuthenticated ? (
                        <div className="flex flex-col gap-3">
                            <Link to="/findjobs" onClick={closeMobileMenu} className="flex items-center py-3 px-4 rounded-xl text-lg font-semibold text-indigo-600 no-underline hover:bg-indigo-50 transition-colors">
                                Jobs
                            </Link>
                            <Link to="/dashboard" onClick={closeMobileMenu} className="flex items-center py-3 px-4 rounded-xl text-lg font-semibold text-indigo-600 no-underline hover:bg-indigo-50 transition-colors">
                                Dashboard
                            </Link>
                            <div className="mt-2 flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 border border-slate-200">
                                <div className="bg-white p-2 rounded-full shadow-sm">
                                    <User size={20} className="text-indigo-600" />
                                </div>
                                <span className="text-base font-bold text-slate-800 truncate">
                                    {auth.username}
                                </span>
                            </div>
                            <button onClick={handleLogout} className="mt-4 w-full text-center rounded-xl border-2 border-red-500 px-4 py-3 text-base font-bold text-red-600 hover:bg-red-50 transition-colors">
                                Logout
                            </button>
                        </div>
                    ) : (
                        <PrimaryButton className="w-full justify-center px-4 py-3.5 text-base rounded-xl mt-2 flex items-center gap-2" onClick={() => { navigate("/login"); closeMobileMenu(); }}>
                            Log in <ArrowRight size={20} />
                        </PrimaryButton>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navigation;