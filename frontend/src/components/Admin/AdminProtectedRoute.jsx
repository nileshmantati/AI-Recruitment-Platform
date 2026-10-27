import { Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft, Home, LogOut } from 'lucide-react';
import { T } from '../../Js/theme';

const AdminProtectedRoute = ({ children, requiredPermission = null }) => {
    const { auth, hasPermission, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // 1. Authentication check
    if (!auth.isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2. Role boundary check: Candidates and Recruiters must never access Admin routes
    if (auth.role?.toUpperCase() !== 'ADMIN') {
        return <Navigate to="/dashboard" replace />;
    }

    // 3. Permission check for Staff Admins
    if (requiredPermission && !hasPermission(requiredPermission)) {
        const hasAnyPermission =
            auth.isSuperuser || (Array.isArray(auth.permissions) && auth.permissions.length > 0);

        // Case A: Staff Admin has no permissions assigned at all
        if (!hasAnyPermission) {
            return (
                <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 shadow-sm">
                        <ShieldAlert size={36} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">No Permissions Assigned</h2>
                    <p className="mt-2 max-w-md text-sm text-slate-500">
                        Your administrative account (<span className="font-semibold text-slate-700">{auth.username}</span>) is active, but no module permissions have been granted to it yet. Please contact a Super Administrator to assign your permissions.
                    </p>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors no-underline cursor-pointer"
                        >
                            <Home size={16} /> Return to Main Site
                        </Link>
                        <button
                            type="button"
                            onClick={() => {
                                logout();
                                navigate('/login');
                            }}
                            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 cursor-pointer"
                            style={{ background: T.primary }}
                        >
                            <LogOut size={16} /> Sign In with Different Account
                        </button>
                    </div>
                </div>
            );
        }

        // Case B: User has some permissions, but lacks permission for this specific section
        // Select a fallback destination that is NOT the current path to avoid navigation loops
        const fallbackRoute =
            hasPermission('dashboard.view') && location.pathname !== '/admin/dashboard'
                ? { path: '/admin/dashboard', label: 'Return to Dashboard' }
                : hasPermission('jobs.view') && location.pathname !== '/admin/jobs'
                    ? { path: '/admin/jobs', label: 'Go to Job Moderation' }
                    : hasPermission('users.view') && location.pathname !== '/admin/users'
                        ? { path: '/admin/users', label: 'Go to User Management' }
                        : hasPermission('analytics.view') && location.pathname !== '/admin/analytics'
                            ? { path: '/admin/analytics', label: 'Go to Application Analytics' }
                            : null;

        return (
            <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 shadow-sm">
                    <ShieldAlert size={36} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Permission Required</h2>
                <p className="mt-2 max-w-md text-sm text-slate-500">
                    Your administrative account lacks the explicit permission <span className="font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">({requiredPermission})</span> required to view this section.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    {fallbackRoute ? (
                        <Link
                            to={fallbackRoute.path}
                            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 no-underline cursor-pointer"
                            style={{ background: T.primary }}
                        >
                            <ArrowLeft size={16} /> {fallbackRoute.label}
                        </Link>
                    ) : (
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 no-underline cursor-pointer"
                            style={{ background: T.primary }}
                        >
                            <Home size={16} /> Return to Main Site
                        </Link>
                    )}
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return children;
};

export default AdminProtectedRoute;
