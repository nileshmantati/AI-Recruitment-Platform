import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    Briefcase,
    BarChart3,
    Shield,
    ChevronLeft,
    ChevronRight,
    LogOut,
} from 'lucide-react';
import { T } from '../../Js/theme';

const ADMIN_NAV_ITEMS = [
    {
        name: 'Dashboard',
        path: '/admin/dashboard',
        icon: LayoutDashboard,
        permission: 'dashboard.view',
    },
    {
        name: 'Users',
        path: '/admin/users',
        icon: Users,
        permission: 'users.view',
    },
    {
        name: 'Jobs',
        path: '/admin/jobs',
        icon: Briefcase,
        permission: 'jobs.view',
    },
    {
        name: 'Analytics',
        path: '/admin/analytics',
        icon: BarChart3,
        permission: 'analytics.view',
    },
];

const AdminSidebar = ({ collapsed, setCollapsed, isMobileOpen, closeMobileMenu }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { auth, logout, hasPermission } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Filter nav items based on explicit permissions
    const visibleNavItems = ADMIN_NAV_ITEMS.filter((item) => hasPermission(item.permission));

    const sidebarContent = (
        <div className="flex h-full flex-col justify-between bg-white border-r border-slate-200">
            {/* Header / Brand */}
            <div>
                <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100">
                    <Link
                        to="/admin"
                        onClick={closeMobileMenu}
                        className="flex items-center gap-2.5 font-bold no-underline text-slate-900 overflow-hidden"
                    >
                        <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-md text-white"
                            style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}
                        >
                            <Shield size={20} />
                        </div>
                        {!collapsed && (
                            <div className="flex flex-col">
                                <span className="text-base font-black tracking-tight text-slate-800">
                                    Admin<span style={{ color: T.primary }}>Portal</span>
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    AI Recruitment
                                </span>
                            </div>
                        )}
                    </Link>

                    {/* Desktop collapse toggle */}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>

                {/* Role Status Tag */}
                {!collapsed && (
                    <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/70">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                Role Level
                            </span>
                            <span
                                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                    auth.isSuperuser
                                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                }`}
                            >
                                {auth.isSuperuser ? 'Super Admin' : 'Staff Admin'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Navigation Links */}
                <nav className="p-3 space-y-1">
                    {visibleNavItems.length === 0 ? (
                        !collapsed && (
                            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
                                <p className="text-xs font-semibold text-slate-500">No Modules Assigned</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">Contact Super Admin to request section permissions.</p>
                            </div>
                        )
                    ) : (
                        visibleNavItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname.startsWith(item.path);

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={closeMobileMenu}
                                    title={collapsed ? item.name : undefined}
                                    className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all no-underline ${
                                        isActive
                                            ? 'text-white shadow-md'
                                            : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                                    }`}
                                    style={isActive ? { background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})` } : {}}
                                >
                                    <Icon size={18} className="shrink-0" />
                                    {!collapsed && <span>{item.name}</span>}
                                </Link>
                            );
                        })
                    )}
                </nav>
            </div>

            {/* User Details & Logout */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/50">
                {!collapsed && (
                    <div className="mb-2 px-2 flex items-center gap-2.5 overflow-hidden">
                        <div
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
                            style={{ background: T.primary }}
                        >
                            {(auth.username || 'AD').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="truncate text-xs font-bold text-slate-800">
                                {auth.username}
                            </span>
                            <span className="truncate text-[11px] text-slate-400">
                                {auth.isSuperuser ? 'Full Administrative Access' : 'Permission-Gated Staff'}
                            </span>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleLogout}
                    title={collapsed ? "Log out" : undefined}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                    <LogOut size={16} className="shrink-0" />
                    {!collapsed && <span>Sign Out</span>}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={`hidden lg:flex shrink-0 transition-all duration-300 h-screen sticky top-0 ${
                    collapsed ? 'w-20' : 'w-64'
                }`}
            >
                {sidebarContent}
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={closeMobileMenu}
                >
                    <div
                        className="fixed inset-y-0 left-0 w-64 z-50 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {sidebarContent}
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminSidebar;
