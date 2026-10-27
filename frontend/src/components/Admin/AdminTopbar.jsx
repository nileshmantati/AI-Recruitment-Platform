import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, ExternalLink, ShieldCheck, ShieldAlert } from 'lucide-react';

const getPageTitle = (pathname) => {
    if (pathname.startsWith('/admin/dashboard')) return 'Platform Dashboard';
    if (pathname.startsWith('/admin/users')) return 'User Management';
    if (pathname.startsWith('/admin/jobs')) return 'Job Moderation';
    if (pathname.startsWith('/admin/analytics')) return 'Application Analytics';
    return 'Admin Portal';
};

const AdminTopbar = ({ toggleMobileMenu }) => {
    const location = useLocation();
    const { auth } = useAuth();
    const pageTitle = getPageTitle(location.pathname);

    return (
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur-md">
            {/* Left: Mobile Toggle & Page Title */}
            <div className="flex items-center gap-3">
                <button
                    onClick={toggleMobileMenu}
                    className="flex lg:hidden h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                    aria-label="Open sidebar"
                >
                    <Menu size={20} />
                </button>
                <div className="flex flex-col">
                    <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                        {pageTitle}
                    </h1>
                </div>
            </div>

            {/* Right: Security Pill & Link to Main Site */}
            <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 rounded-xl bg-slate-100/80 px-3 py-1.5 border border-slate-200/60">
                    {auth.isSuperuser ? (
                        <ShieldCheck size={16} className="text-indigo-600" />
                    ) : (
                        <ShieldAlert size={16} className="text-emerald-600" />
                    )}
                    <span className="text-xs font-bold text-slate-700">
                        {auth.isSuperuser ? 'Super Admin Mode' : 'Staff Admin Mode'}
                    </span>
                </div>

                <Link
                    to="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors no-underline"
                >
                    <span>View Site</span>
                    <ExternalLink size={13} />
                </Link>
            </div>
        </header>
    );
};

export default AdminTopbar;
