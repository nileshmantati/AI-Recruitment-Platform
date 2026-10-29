import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    getAdminUsers,
    getAdminUserDetails,
    updateAdminUserStatus,
    getAssignablePermissions,
    promoteUserToStaff,
    updateStaffAdminPermissions,
    demoteUserFromStaff,
} from '../../services/adminApi';
import {
    Users,
    Search,
    Eye,
    Shield,
    AlertTriangle,
    RefreshCw,
    X,
    ChevronLeft,
    ChevronRight,
    Briefcase,
    GraduationCap,
    Key,
    Lock,
} from 'lucide-react';
import { T } from '../../Js/theme';
import toast from 'react-hot-toast';

const ROLE_BADGES = {
    CANDIDATE: { label: 'Candidate', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    RECRUITER: { label: 'Recruiter', bg: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    ADMIN: { label: 'Admin', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
};

const AdminUsersPage = () => {
    const { auth, hasPermission } = useAuth();
    const canManageUsers = hasPermission('users.manage');

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Filters
    const [search, setSearch] = useState('');
    const [submittedSearch, setSubmittedSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [activeFilter, setActiveFilter] = useState('');

    // Modals
    const [selectedUser, setSelectedUser] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [statusModalUser, setStatusModalUser] = useState(null);
    const [statusReason, setStatusReason] = useState('');
    const [submittingStatus, setSubmittingStatus] = useState(false);

    // Staff Promotion & Governance State (Superadmin Only)
    const [availablePermissions, setAvailablePermissions] = useState([]);
    const [promoteModalUser, setPromoteModalUser] = useState(null);
    const [promotePermissions, setPromotePermissions] = useState([]);
    const [submittingPromote, setSubmittingPromote] = useState(false);

    const [editPermUser, setEditPermUser] = useState(null);
    const [editPermissions, setEditPermissions] = useState([]);
    const [submittingEditPerm, setSubmittingEditPerm] = useState(false);

    const [demoteModalUser, setDemoteModalUser] = useState(null);
    const [demoteRole, setDemoteRole] = useState('CANDIDATE');
    const [submittingDemote, setSubmittingDemote] = useState(false);

    useEffect(() => {
        let isMounted = true;
        getAdminUsers({
            page,
            role: roleFilter,
            is_active: activeFilter,
            search: submittedSearch.trim(),
        })
            .then((data) => {
                if (isMounted) {
                    setUsers(data.results || []);
                    setTotalCount(data.count || 0);
                    const size = 20; // Default backend StandardAdminPagination
                    setTotalPages(Math.ceil((data.count || 0) / size) || 1);
                    setLoading(false);
                }
            })
            .catch((err) => {
                if (isMounted) {
                    console.error('Failed to load users:', err);
                    toast.error(err.response?.data?.detail || 'Failed to load user list.');
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [page, roleFilter, activeFilter, submittedSearch]);

    const fetchUsers = () => {
        setLoading(true);
        getAdminUsers({
            page,
            role: roleFilter,
            is_active: activeFilter,
            search: submittedSearch.trim(),
        })
            .then((data) => {
                setUsers(data.results || []);
                setTotalCount(data.count || 0);
                const size = 20;
                setTotalPages(Math.ceil((data.count || 0) / size) || 1);
            })
            .catch((err) => {
                toast.error(err.response?.data?.detail || 'Failed to load user list.');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        setSubmittedSearch(search);
    };

    const handleOpenDetail = async (user) => {
        setSelectedUser(user);
        setDetailLoading(true);
        try {
            const fullDetails = await getAdminUserDetails(user.id);
            setSelectedUser(fullDetails);
        } catch (err) {
            console.error('Failed to load user details:', err);
            toast.error('Could not fetch full user profile.');
        } finally {
            setDetailLoading(false);
        }
    };

    const handleOpenStatusModal = (user) => {
        setStatusModalUser(user);
        setStatusReason('');
    };

    const handleConfirmStatusToggle = async () => {
        if (!statusModalUser) return;
        const newStatus = !statusModalUser.is_active;

        setSubmittingStatus(true);
        try {
            await updateAdminUserStatus(statusModalUser.id, newStatus, statusReason);
            toast.success(
                `User '${statusModalUser.username}' account has been ${newStatus ? 'activated' : 'deactivated'
                }.`
            );
            setStatusModalUser(null);
            fetchUsers();
        } catch (err) {
            console.error('Status toggle failed:', err);
            const msg =
                err.response?.data?.detail ||
                (Array.isArray(err.response?.data) && err.response.data[0]) ||
                err.response?.data?.message ||
                'Failed to update user account status.';
            toast.error(msg);
        } finally {
            setSubmittingStatus(false);
        }
    };

    // Helper to evaluate if current admin can toggle target user's status
    const canToggleTargetUser = (targetUser) => {
        if (!canManageUsers) return false;
        // Cannot modify self
        if (targetUser.username === auth.username) return false;
        // Staff Admin cannot modify Super Admin
        if (targetUser.is_superuser && !auth.isSuperuser) return false;
        // Staff Admin cannot modify other Staff Admins
        if (targetUser.is_staff && !auth.isSuperuser) return false;
        return true;
    };

    useEffect(() => {
        if (auth?.isSuperuser) {
            getAssignablePermissions()
                .then((data) => setAvailablePermissions(Array.isArray(data) ? data : []))
                .catch(() => { });
        }
    }, [auth?.isSuperuser]);

    const handlePromoteSubmit = async (e) => {
        e.preventDefault();
        if (!promoteModalUser) return;
        setSubmittingPromote(true);
        try {
            await promoteUserToStaff(promoteModalUser.id, promotePermissions);
            toast.success(`User '${promoteModalUser.username}' successfully promoted to Staff Admin!`);
            setPromoteModalUser(null);
            fetchUsers();
        } catch (err) {
            const data = err.response?.data;
            const errMsg = data?.detail || data?.error || (typeof data === 'object' ? Object.values(data)[0] : null) || 'Failed to promote user.';
            toast.error(String(errMsg));
        } finally {
            setSubmittingPromote(false);
        }
    };

    const handleEditPermSubmit = async (e) => {
        e.preventDefault();
        if (!editPermUser) return;
        setSubmittingEditPerm(true);
        try {
            await updateStaffAdminPermissions(editPermUser.id, editPermissions);
            toast.success(`Permissions updated for '${editPermUser.username}'!`);
            setEditPermUser(null);
            fetchUsers();
        } catch (err) {
            const data = err.response?.data;
            const errMsg = data?.detail || 'Failed to update permissions.';
            toast.error(String(errMsg));
        } finally {
            setSubmittingEditPerm(false);
        }
    };

    const handleDemoteSubmit = async (e) => {
        e.preventDefault();
        if (!demoteModalUser) return;
        setSubmittingDemote(true);
        try {
            await demoteUserFromStaff(demoteModalUser.id, demoteRole);
            toast.success(`User '${demoteModalUser.username}' demoted to ${demoteRole}.`);
            setDemoteModalUser(null);
            fetchUsers();
        } catch (err) {
            const data = err.response?.data;
            const errMsg = data?.detail || 'Failed to demote user.';
            toast.error(String(errMsg));
        } finally {
            setSubmittingDemote(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">User Management</h2>
                    <p className="text-sm font-medium text-slate-500">
                        Inspect registered candidate, recruiter, and administrator profiles ({totalCount} total).
                    </p>
                </div>
                <button
                    onClick={() => {
                        setPage(1);
                        fetchUsers();
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors cursor-pointer"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin text-indigo-600' : ''} />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Search and Filters Bar */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col md:flex-row items-center gap-3">
                <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by username, email, or name..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-sm outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                    />
                </form>

                <div className="flex items-center gap-2.5 w-full md:w-auto">
                    {/* Role Filter */}
                    <div className="relative flex-1 md:w-40">
                        <select
                            value={roleFilter}
                            onChange={(e) => {
                                setRoleFilter(e.target.value);
                                setPage(1);
                            }}
                            className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
                        >
                            <option value="">All Roles</option>
                            <option value="CANDIDATE">Candidate</option>
                            <option value="RECRUITER">Recruiter</option>
                            <option value="ADMIN">Administrator</option>
                        </select>
                    </div>

                    {/* Active Status Filter */}
                    <div className="relative flex-1 md:w-36">
                        <select
                            value={activeFilter}
                            onChange={(e) => {
                                setActiveFilter(e.target.value);
                                setPage(1);
                            }}
                            className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
                        >
                            <option value="">All Statuses</option>
                            <option value="true">Active Only</option>
                            <option value="false">Inactive Only</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 mb-3" />
                        <p className="text-sm text-slate-500 font-medium">Loading user records...</p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="p-12 text-center">
                        <Users size={36} className="mx-auto text-slate-300 mb-3" />
                        <h4 className="text-base font-bold text-slate-800">No Users Found</h4>
                        <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or filters.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                <tr>
                                    <th className="py-3.5 pl-6">User / Identity</th>
                                    <th className="py-3.5">Role</th>
                                    <th className="py-3.5">Account Status</th>
                                    <th className="py-3.5">Company / Phone</th>
                                    <th className="py-3.5">Joined Date</th>
                                    <th className="py-3.5 pr-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                {users.map((u) => {
                                    const roleBadge = ROLE_BADGES[u.role] || {
                                        label: u.role,
                                        bg: 'bg-slate-100 text-slate-700 border-slate-200',
                                    };
                                    const isSelf = u.username === auth.username;
                                    const canModify = canToggleTargetUser(u);

                                    return (
                                        <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                                            {/* Identity */}
                                            <td className="py-3.5 pl-6 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
                                                        style={{ background: u.is_superuser ? T.primaryDark : T.primary }}
                                                    >
                                                        {u.username.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-bold text-slate-900">{u.username}</span>
                                                            {isSelf && (
                                                                <span className="rounded bg-indigo-100 px-1.5 py-0.2 text-[10px] font-bold text-indigo-700">
                                                                    You
                                                                </span>
                                                            )}
                                                            {u.is_superuser && (
                                                                <span className="rounded bg-purple-100 px-1.5 py-0.2 text-[10px] font-bold text-purple-700">
                                                                    Super Admin
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-slate-400 text-[11px]">{u.email}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Role */}
                                            <td className="py-3.5 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${roleBadge.bg}`}
                                                >
                                                    {roleBadge.label}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="py-3.5 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${u.is_active
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                            : 'bg-rose-50 text-rose-700 border-rose-200'
                                                            }`}
                                                    >
                                                        {u.is_active ? 'Active' : 'Deactivated'}
                                                    </span>
                                                    <span
                                                        className={`text-[10px] font-medium ${u.is_email_verified ? 'text-slate-400' : 'text-amber-600'
                                                            }`}
                                                    >
                                                        {u.is_email_verified ? 'Verified' : 'Unverified'}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Company / Phone */}
                                            <td className="py-3.5 whitespace-nowrap text-slate-500">
                                                <div>{u.company_name || '—'}</div>
                                                <div className="text-[10px] text-slate-400">{u.phone || 'No phone'}</div>
                                            </td>

                                            {/* Joined */}
                                            <td className="py-3.5 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                                                {new Date(u.date_joined).toLocaleDateString()}
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 pr-6 whitespace-nowrap text-right space-x-1.5">
                                                <button
                                                    onClick={() => handleOpenDetail(u)}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                                                >
                                                    <Eye size={12} /> View
                                                </button>

                                                {/* Superadmin Promotion & Governance Controls */}
                                                {auth?.isSuperuser && (
                                                    <>
                                                        {!u.is_superuser && !u.is_staff && u.role !== 'ADMIN' && (
                                                            <button
                                                                onClick={() => {
                                                                    setPromoteModalUser(u);
                                                                    setPromotePermissions([]);
                                                                }}
                                                                className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
                                                                title="Promote this user to Staff Admin with permissions"
                                                            >
                                                                <Shield size={12} className="text-indigo-600" /> Make Staff
                                                            </button>
                                                        )}

                                                        {u.is_staff && !u.is_superuser && (
                                                            <>
                                                                <button
                                                                    onClick={() => {
                                                                        setEditPermUser(u);
                                                                        setEditPermissions(u.admin_permissions || []);
                                                                        getAdminUserDetails(u.id)
                                                                            .then((det) => {
                                                                                if (det.profile?.permissions) {
                                                                                    setEditPermissions(det.profile.permissions);
                                                                                }
                                                                            })
                                                                            .catch(() => { });
                                                                    }}
                                                                    className="inline-flex items-center gap-1 rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1 text-[11px] font-semibold text-purple-700 hover:bg-purple-100 transition-colors cursor-pointer"
                                                                    title="Manage Staff Admin permissions"
                                                                >
                                                                    <Key size={12} className="text-purple-600" /> Permissions
                                                                </button>

                                                                {!isSelf && (
                                                                    <button
                                                                        onClick={() => {
                                                                            setDemoteModalUser(u);
                                                                            setDemoteRole('CANDIDATE');
                                                                        }}
                                                                        className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
                                                                        title="Demote to normal Candidate or Recruiter"
                                                                    >
                                                                        Demote
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                    </>
                                                )}

                                                {canManageUsers && (
                                                    <button
                                                        onClick={() => handleOpenStatusModal(u)}
                                                        disabled={!canModify}
                                                        title={
                                                            isSelf
                                                                ? 'Cannot modify your own administrative status'
                                                                : !canModify
                                                                    ? 'Staff Admins cannot modify Super Admin or Staff accounts'
                                                                    : undefined
                                                        }
                                                        className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${u.is_active
                                                            ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                                                            : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                                                            }`}
                                                    >
                                                        {u.is_active ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination Controls */}
                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-3">
                    <span className="text-xs text-slate-500">
                        Page <span className="font-bold">{page}</span> of{' '}
                        <span className="font-bold">{totalPages}</span>
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage((p) => Math.max(p - 1, 1))}
                            disabled={page <= 1}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={14} /> Previous
                        </button>
                        <button
                            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                            disabled={page >= totalPages}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                        >
                            Next <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* User Details Modal */}
            {selectedUser && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
                    onClick={() => setSelectedUser(null)}
                >
                    <div
                        className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                            <div className="flex items-center gap-2.5">
                                <div
                                    className="flex h-10 w-10 items-center justify-center rounded-2xl text-white font-bold"
                                    style={{ background: T.primary }}
                                >
                                    {selectedUser.username.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-base">{selectedUser.username}</h3>
                                    <p className="text-xs text-slate-400">{selectedUser.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {detailLoading ? (
                            <div className="py-8 text-center text-xs text-slate-400">Loading full profile...</div>
                        ) : (
                            <div className="space-y-4 text-xs">
                                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                                    <div>
                                        <span className="text-slate-400 block font-medium">Role</span>
                                        <span className="font-bold text-slate-800">{selectedUser.role}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block font-medium">Account Status</span>
                                        <span
                                            className={`font-bold ${selectedUser.is_active ? 'text-emerald-600' : 'text-rose-600'
                                                }`}
                                        >
                                            {selectedUser.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block font-medium">Email Verified</span>
                                        <span className="font-bold text-slate-800">
                                            {selectedUser.is_email_verified ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block font-medium">Registered On</span>
                                        <span className="font-bold text-slate-800">
                                            {new Date(selectedUser.date_joined).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Candidate Profile Section */}
                                {selectedUser.profile?.type === 'CANDIDATE' && (
                                    <div className="p-4 rounded-2xl border border-slate-200 space-y-2.5">
                                        <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                                            <GraduationCap size={15} /> Candidate Details
                                        </h4>
                                        <div>
                                            <span className="text-slate-400 block">Skills</span>
                                            <span className="font-semibold text-slate-700">
                                                {selectedUser.profile.skills || 'No skills listed'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block">Experience</span>
                                            <span className="font-semibold text-slate-700">
                                                {selectedUser.profile.experience || 'Not specified'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block">Resume Uploaded</span>
                                            <span className="font-semibold text-slate-700">
                                                {selectedUser.profile.has_resume ? 'Yes' : 'None'}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Recruiter Profile Section */}
                                {selectedUser.profile?.type === 'RECRUITER' && (
                                    <div className="p-4 rounded-2xl border border-slate-200 space-y-2.5">
                                        <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                                            <Briefcase size={15} /> Recruiter Details
                                        </h4>
                                        <div>
                                            <span className="text-slate-400 block">Company</span>
                                            <span className="font-semibold text-slate-700">
                                                {selectedUser.profile.company || 'Not specified'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block">Position</span>
                                            <span className="font-semibold text-slate-700">
                                                {selectedUser.profile.position || 'Not specified'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block">Company Verified</span>
                                            <span className="font-semibold text-slate-700">
                                                {selectedUser.profile.company_verified ? 'Verified' : 'Pending Verification'}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Admin Profile Section */}
                                {selectedUser.profile?.type === 'ADMIN' && (
                                    <div className="p-4 rounded-2xl border border-slate-200 space-y-2.5">
                                        <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                                            <Shield size={15} /> Administrative Permissions
                                        </h4>
                                        <div>
                                            <span className="text-slate-400 block mb-1">Granted Permissions</span>
                                            <div className="flex flex-wrap gap-1">
                                                {selectedUser.profile.permissions?.map((p) => (
                                                    <span
                                                        key={p}
                                                        className="font-mono text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded"
                                                    >
                                                        {p}
                                                    </span>
                                                )) || <span className="text-slate-400">Full Super Admin</span>}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Status Change Confirmation Modal */}
            {statusModalUser && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                    onClick={() => !submittingStatus && setStatusModalUser(null)}
                >
                    <div
                        className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div
                                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${statusModalUser.is_active
                                    ? 'bg-rose-100 text-rose-600'
                                    : 'bg-emerald-100 text-emerald-600'
                                    }`}
                            >
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-base">
                                    {statusModalUser.is_active ? 'Deactivate User Account' : 'Reactivate User Account'}
                                </h3>
                                <p className="text-xs text-slate-400">Target: {statusModalUser.username}</p>
                            </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed mb-4">
                            {statusModalUser.is_active
                                ? 'Deactivating this user prevents them from authenticating and logging into the platform. Their profiles and application history are preserved safely.'
                                : 'Activating this user restores login capabilities to their account.'}
                        </p>

                        <div className="mb-5">
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                Reason for audit log (optional):
                            </label>
                            <textarea
                                value={statusReason}
                                onChange={(e) => setStatusReason(e.target.value)}
                                placeholder="E.g., Requested by user, terms compliance violation..."
                                rows={3}
                                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                disabled={submittingStatus}
                                onClick={() => setStatusModalUser(null)}
                                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={submittingStatus}
                                onClick={handleConfirmStatusToggle}
                                className={`rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md transition-all cursor-pointer disabled:opacity-50 ${statusModalUser.is_active
                                    ? 'bg-rose-600 hover:bg-rose-700'
                                    : 'bg-emerald-600 hover:bg-emerald-700'
                                    }`}
                            >
                                {submittingStatus ? 'Updating...' : statusModalUser.is_active ? 'Confirm Deactivate' : 'Confirm Activate'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Promote to Staff Admin Modal */}
            {promoteModalUser && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                    onClick={() => !submittingPromote && setPromoteModalUser(null)}
                >
                    <div
                        className="relative w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
                                    <Shield size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-base">
                                        Promote to Staff Administrator
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Target: <span className="font-semibold text-slate-700">{promoteModalUser.username}</span> ({promoteModalUser.email}) • Current Role: <span className="font-semibold">{promoteModalUser.role}</span>
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setPromoteModalUser(null)}
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handlePromoteSubmit} className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-xs font-bold text-slate-700">
                                        Assign Module Permissions ({promotePermissions.length} selected)
                                    </label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setPromotePermissions(availablePermissions.map((p) => p.id))}
                                            className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                                        >
                                            Select All
                                        </button>
                                        <span className="text-slate-300">|</span>
                                        <button
                                            type="button"
                                            onClick={() => setPromotePermissions([])}
                                            className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                                    {availablePermissions.map((perm) => {
                                        const isChecked = promotePermissions.includes(perm.id);
                                        return (
                                            <label
                                                key={perm.id}
                                                className={`flex items-start gap-2.5 rounded-lg border p-2 text-xs transition-colors cursor-pointer ${isChecked
                                                    ? 'bg-indigo-50/60 border-indigo-200 text-slate-800'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={(e) => {
                                                        const next = e.target.checked
                                                            ? [...promotePermissions, perm.id]
                                                            : promotePermissions.filter((p) => p !== perm.id);
                                                        setPromotePermissions(next);
                                                    }}
                                                    className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <div>
                                                    <div className="font-semibold">{perm.name}</div>
                                                    <div className="text-[10px] text-slate-400 font-mono">{perm.id}</div>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 flex items-start gap-2">
                                <Lock size={15} className="shrink-0 mt-0.5 text-amber-600" />
                                <div>
                                    <span className="font-bold">Privilege Boundary:</span> Promoting this user converts them into a Staff Admin with only the permissions checked above. They cannot self-escalate or grant admin access to others.
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2.5 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setPromoteModalUser(null)}
                                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingPromote}
                                    className="rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
                                    style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}
                                >
                                    {submittingPromote ? 'Promoting...' : 'Confirm Promotion to Staff Admin'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Staff Permissions Modal */}
            {editPermUser && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                    onClick={() => !submittingEditPerm && setEditPermUser(null)}
                >
                    <div
                        className="relative w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
                                    <Key size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-base">
                                        Manage Staff Permissions
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Staff Admin: <span className="font-semibold text-slate-700">{editPermUser.username}</span>
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditPermUser(null)}
                                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleEditPermSubmit} className="space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs font-bold text-slate-700">
                                    Assigned Permissions ({editPermissions.length} selected)
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setEditPermissions(availablePermissions.map((p) => p.id))}
                                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                                    >
                                        Select All
                                    </button>
                                    <span className="text-slate-300">|</span>
                                    <button
                                        type="button"
                                        onClick={() => setEditPermissions([])}
                                        className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                                {availablePermissions.map((perm) => {
                                    const isChecked = editPermissions.includes(perm.id);
                                    return (
                                        <label
                                            key={perm.id}
                                            className={`flex items-start gap-2.5 rounded-lg border p-2 text-xs transition-colors cursor-pointer ${isChecked
                                                ? 'bg-purple-50/60 border-purple-200 text-slate-800'
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={(e) => {
                                                    const next = e.target.checked
                                                        ? [...editPermissions, perm.id]
                                                        : editPermissions.filter((p) => p !== perm.id);
                                                    setEditPermissions(next);
                                                }}
                                                className="mt-0.5 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                                            />
                                            <div>
                                                <div className="font-semibold">{perm.name}</div>
                                                <div className="text-[10px] text-slate-400 font-mono">{perm.id}</div>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>

                            <div className="flex items-center justify-end gap-2.5 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditPermUser(null)}
                                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingEditPerm}
                                    className="rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
                                    style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}
                                >
                                    {submittingEditPerm ? 'Saving...' : 'Save Permissions'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Demote from Staff Admin Modal */}
            {demoteModalUser && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                    onClick={() => !submittingDemote && setDemoteModalUser(null)}
                >
                    <div
                        className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-base">
                                    Demote from Staff Admin
                                </h3>
                                <p className="text-xs text-slate-400">Target: {demoteModalUser.username}</p>
                            </div>
                        </div>

                        <form onSubmit={handleDemoteSubmit} className="space-y-4">
                            <p className="text-xs text-slate-600 leading-relaxed">
                                This will revoke all administrative portal access and staff privileges for{' '}
                                <span className="font-bold text-slate-800">{demoteModalUser.username}</span>.
                            </p>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Target Role after Demotion:
                                </label>
                                <select
                                    value={demoteRole}
                                    onChange={(e) => setDemoteRole(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                                >
                                    <option value="CANDIDATE">Candidate</option>
                                    <option value="RECRUITER">Recruiter</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-end gap-2.5 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setDemoteModalUser(null)}
                                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingDemote}
                                    className="rounded-xl bg-amber-600 hover:bg-amber-700 px-4 py-2 text-xs font-bold text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {submittingDemote ? 'Demoting...' : 'Confirm Demotion'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsersPage;
