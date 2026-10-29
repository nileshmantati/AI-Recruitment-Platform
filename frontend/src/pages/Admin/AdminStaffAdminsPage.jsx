import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    getStaffAdmins,
    getAssignablePermissions,
    provisionStaffAdmin,
    updateStaffAdminPermissions,
    updateStaffAdminStatus
} from '../../services/adminApi';
import {
    Shield,
    Users,
    Plus,
    RefreshCw,
    X,
    AlertTriangle,
    Key,
    UserCheck,
    UserX,
    Lock,
    Search
} from 'lucide-react';
import { T } from '../../Js/theme';
import toast from 'react-hot-toast';

const AdminStaffAdminsPage = () => {
    const { auth } = useAuth();
    const isSuperuser = !!auth?.isSuperuser;

    const [staffAdmins, setStaffAdmins] = useState([]);
    const [availablePermissions, setAvailablePermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Provision Modal State
    const [showProvisionModal, setShowProvisionModal] = useState(false);
    const [provisionForm, setProvisionForm] = useState({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        permissions: []
    });
    const [submittingProvision, setSubmittingProvision] = useState(false);

    // Edit Permissions Modal State
    const [editPermTarget, setEditPermTarget] = useState(null);
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [submittingPermissions, setSubmittingPermissions] = useState(false);

    // Status Modal State
    const [statusTarget, setStatusTarget] = useState(null);
    const [statusReason, setStatusReason] = useState('');
    const [submittingStatus, setSubmittingStatus] = useState(false);

    const loadData = useCallback(() => {
        setLoading(true);
        Promise.all([
            getStaffAdmins(),
            getAssignablePermissions().catch(() => [])
        ])
            .then(([adminsData, permsData]) => {
                setStaffAdmins(Array.isArray(adminsData) ? adminsData : []);
                setAvailablePermissions(Array.isArray(permsData) ? permsData : []);
            })
            .catch((err) => {
                console.error('Failed to load staff admin data:', err);
                toast.error(err.response?.data?.detail || 'Failed to load staff administrative accounts.');
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        let isMounted = true;
        Promise.all([
            getStaffAdmins(),
            getAssignablePermissions().catch(() => [])
        ])
            .then(([adminsData, permsData]) => {
                if (!isMounted) return;
                setStaffAdmins(Array.isArray(adminsData) ? adminsData : []);
                setAvailablePermissions(Array.isArray(permsData) ? permsData : []);
            })
            .catch((err) => {
                if (!isMounted) return;
                console.error('Failed to load staff admin data:', err);
                toast.error(err.response?.data?.detail || 'Failed to load staff administrative accounts.');
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    // Handle Provision Form Submission
    const handleProvisionSubmit = async (e) => {
        e.preventDefault();
        if (!provisionForm.username.trim() || !provisionForm.email.trim() || !provisionForm.password) {
            toast.error('Username, email, and password are required.');
            return;
        }
        if (provisionForm.password.length < 8) {
            toast.error('Password must be at least 8 characters long.');
            return;
        }

        setSubmittingProvision(true);
        try {
            await provisionStaffAdmin(provisionForm);
            toast.success(`Staff Admin '${provisionForm.username}' successfully provisioned.`);
            setShowProvisionModal(false);
            setProvisionForm({
                username: '',
                email: '',
                password: '',
                first_name: '',
                last_name: '',
                permissions: []
            });
            loadData();
        } catch (err) {
            const data = err.response?.data;
            const errMsg = data?.detail || data?.error || (typeof data === 'object' ? Object.values(data)[0] : null) || 'Failed to provision staff admin.';
            toast.error(String(errMsg));
        } finally {
            setSubmittingProvision(false);
        }
    };

    // Handle Permissions Update Submission
    const handlePermissionsSubmit = async () => {
        if (!editPermTarget) return;
        setSubmittingPermissions(true);
        try {
            await updateStaffAdminPermissions(editPermTarget.user.id, selectedPermissions);
            toast.success(`Permissions updated for '${editPermTarget.user.username}'.`);
            setEditPermTarget(null);
            loadData();
        } catch (err) {
            const data = err.response?.data;
            const errMsg = data?.detail || 'Failed to update permissions.';
            toast.error(String(errMsg));
        } finally {
            setSubmittingPermissions(false);
        }
    };

    // Handle Status Toggle Submission
    const handleStatusSubmit = async () => {
        if (!statusTarget) return;
        setSubmittingStatus(true);
        const newStatus = !statusTarget.is_active;
        try {
            await updateStaffAdminStatus(statusTarget.user.id, newStatus, statusReason);
            toast.success(
                `Staff Admin '${statusTarget.user.username}' ${newStatus ? 'activated' : 'deactivated'}.`
            );
            setStatusTarget(null);
            setStatusReason('');
            loadData();
        } catch (err) {
            const data = err.response?.data;
            const errMsg = data?.detail || 'Failed to update staff admin status.';
            toast.error(String(errMsg));
        } finally {
            setSubmittingStatus(false);
        }
    };

    // Filter staff admins by search
    const filteredStaff = staffAdmins.filter((sa) => {
        const term = search.toLowerCase().trim();
        if (!term) return true;
        const u = sa.user || {};
        return (
            (u.username || '').toLowerCase().includes(term) ||
            (u.email || '').toLowerCase().includes(term) ||
            (u.first_name || '').toLowerCase().includes(term) ||
            (u.last_name || '').toLowerCase().includes(term)
        );
    });

    const totalStaff = staffAdmins.length;
    const activeStaff = staffAdmins.filter((s) => s.is_active).length;
    const inactiveStaff = totalStaff - activeStaff;

    return (
        <div className="space-y-6">
            {/* Header Banner */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <div
                            className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm"
                            style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}
                        >
                            <Shield size={20} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Staff Administrator Governance</h1>
                            <p className="text-xs text-slate-500">
                                Provision Staff Admins, assign granular module permissions, and manage access limits.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={loadData}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                        title="Refresh List"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>

                    {isSuperuser && (
                        <button
                            onClick={() => setShowProvisionModal(true)}
                            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-white shadow-md transition-all hover:opacity-90 cursor-pointer"
                            style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}
                        >
                            <Plus size={16} />
                            Provision Staff Admin
                        </button>
                    )}
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <Users size={22} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-800">{totalStaff}</div>
                        <div className="text-xs font-medium text-slate-500">Total Staff Admins</div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <UserCheck size={22} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-emerald-700">{activeStaff}</div>
                        <div className="text-xs font-medium text-slate-500">Active Accounts</div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                        <UserX size={22} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-rose-700">{inactiveStaff}</div>
                        <div className="text-xs font-medium text-slate-500">Inactive Accounts</div>
                    </div>
                </div>
            </div>

            {/* Search Filter */}
            <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                <Search size={18} className="text-slate-400 ml-1" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search staff by username, email, or name..."
                    className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                />
                {search && (
                    <button
                        onClick={() => setSearch('')}
                        className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                        Clear
                    </button>
                )}
            </div>

            {/* Staff Admins List Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-bold text-slate-800">Staff Administrator Directory</h2>
                        <p className="text-xs text-slate-400">
                            Staff Admins have limited privileges scoped strictly to their assigned module permissions.
                        </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                        {filteredStaff.length} Accounts
                    </span>
                </div>

                {loading ? (
                    <div className="flex min-h-[240px] items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>
                    </div>
                ) : filteredStaff.length === 0 ? (
                    <div className="flex min-h-[220px] flex-col items-center justify-center p-6 text-center">
                        <Shield size={36} className="text-slate-300 mb-2" />
                        <p className="text-sm font-semibold text-slate-700">No Staff Administrators Found</p>
                        <p className="text-xs text-slate-400 mt-1">
                            {search
                                ? 'No accounts matched your search criteria.'
                                : 'Use the "Provision Staff Admin" button to create your first Staff Admin.'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                <tr>
                                    <th className="px-6 py-3.5">Administrator</th>
                                    <th className="px-6 py-3.5">Status</th>
                                    <th className="px-6 py-3.5">Assigned Permissions</th>
                                    <th className="px-6 py-3.5">Created By</th>
                                    <th className="px-6 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {filteredStaff.map((profile) => {
                                    const user = profile.user || {};
                                    const perms = Array.isArray(profile.permissions) ? profile.permissions : [];
                                    const isSelf = user.id === auth?.user_id;

                                    return (
                                        <tr key={profile.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 font-bold text-xs text-indigo-700">
                                                        {(user.username || 'U').slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                                                            {user.username}
                                                            {isSelf && (
                                                                <span className="rounded bg-indigo-100 px-1.5 py-0.2 text-[10px] font-bold text-indigo-700">
                                                                    You
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-slate-400">{user.email}</div>
                                                        {(user.first_name || user.last_name) && (
                                                            <div className="text-[11px] text-slate-500">
                                                                {user.first_name} {user.last_name}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${profile.is_active
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        : 'bg-rose-50 text-rose-700 border-rose-200'
                                                        }`}
                                                >
                                                    <span
                                                        className={`h-1.5 w-1.5 rounded-full ${profile.is_active ? 'bg-emerald-500' : 'bg-rose-500'
                                                            }`}
                                                    />
                                                    {profile.is_active ? 'Active' : 'Deactivated'}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                {perms.length === 0 ? (
                                                    <span className="text-xs italic text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                                        No permissions granted
                                                    </span>
                                                ) : (
                                                    <div className="flex flex-wrap gap-1 max-w-md">
                                                        {perms.slice(0, 4).map((p) => (
                                                            <span
                                                                key={p}
                                                                className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-mono font-medium text-slate-700 border border-slate-200"
                                                            >
                                                                {p}
                                                            </span>
                                                        ))}
                                                        {perms.length > 4 && (
                                                            <span
                                                                className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-600 border border-indigo-200"
                                                                title={perms.slice(4).join(', ')}
                                                            >
                                                                +{perms.length - 4} more
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-xs text-slate-500">
                                                <div>{profile.created_by?.username || 'Superadmin'}</div>
                                                <div className="text-[11px] text-slate-400">
                                                    {profile.created_at
                                                        ? new Date(profile.created_at).toLocaleDateString()
                                                        : 'N/A'}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditPermTarget(profile);
                                                            setSelectedPermissions(perms);
                                                        }}
                                                        disabled={!isSuperuser}
                                                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                                                        title="Edit Permissions"
                                                    >
                                                        <Key size={13} className="text-indigo-600" />
                                                        Permissions
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            setStatusTarget(profile);
                                                            setStatusReason('');
                                                        }}
                                                        disabled={!isSuperuser || isSelf}
                                                        className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold shadow-sm transition-all cursor-pointer ${profile.is_active
                                                            ? 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 disabled:opacity-40'
                                                            : 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-40'
                                                            }`}
                                                        title={isSelf ? 'Cannot deactivate your own account' : undefined}
                                                    >
                                                        {profile.is_active ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ========================================================= */}
            {/* Modal 1: Provision Staff Admin                             */}
            {/* ========================================================= */}
            {showProvisionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden my-8">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/60">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                                    <Plus size={18} />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-800">Provision Staff Administrator</h3>
                                    <p className="text-xs text-slate-500">Create a new staff admin with explicit permissions.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowProvisionModal(false)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleProvisionSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Username <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={provisionForm.username}
                                        onChange={(e) =>
                                            setProvisionForm({ ...provisionForm, username: e.target.value })
                                        }
                                        placeholder="e.g. staff_moderator"
                                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Email Address <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={provisionForm.email}
                                        onChange={(e) =>
                                            setProvisionForm({ ...provisionForm, email: e.target.value })
                                        }
                                        placeholder="e.g. staff@airecruitment.com"
                                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        First Name (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={provisionForm.first_name}
                                        onChange={(e) =>
                                            setProvisionForm({ ...provisionForm, first_name: e.target.value })
                                        }
                                        placeholder="e.g. Jane"
                                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Last Name (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={provisionForm.last_name}
                                        onChange={(e) =>
                                            setProvisionForm({ ...provisionForm, last_name: e.target.value })
                                        }
                                        placeholder="e.g. Doe"
                                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Initial Password <span className="text-rose-500">* (Min 8 characters)</span>
                                </label>
                                <input
                                    type="password"
                                    required
                                    minLength={8}
                                    value={provisionForm.password}
                                    onChange={(e) =>
                                        setProvisionForm({ ...provisionForm, password: e.target.value })
                                    }
                                    placeholder="Enter secure initial password..."
                                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            {/* Permissions Selector */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-xs font-bold text-slate-700">
                                        Assign Module Permissions
                                    </label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setProvisionForm({
                                                    ...provisionForm,
                                                    permissions: availablePermissions.map((p) => p.id)
                                                })
                                            }
                                            className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                                        >
                                            Select All
                                        </button>
                                        <span className="text-slate-300">|</span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setProvisionForm({
                                                    ...provisionForm,
                                                    permissions: []
                                                })
                                            }
                                            className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                                    {availablePermissions.map((perm) => {
                                        const isChecked = provisionForm.permissions.includes(perm.id);
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
                                                            ? [...provisionForm.permissions, perm.id]
                                                            : provisionForm.permissions.filter((p) => p !== perm.id);
                                                        setProvisionForm({ ...provisionForm, permissions: next });
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
                                <Lock size={16} className="shrink-0 mt-0.5 text-amber-600" />
                                <div>
                                    <span className="font-bold">Security Safeguard:</span> Staff Admins cannot create
                                    other Staff Admins, self-assign permissions, or access Superadmin-exclusive settings.
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowProvisionModal(false)}
                                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingProvision}
                                    className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-md transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer"
                                    style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}
                                >
                                    {submittingProvision ? 'Provisioning...' : 'Confirm Provisioning'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* Modal 2: Edit Permissions                                 */}
            {/* ========================================================= */}
            {editPermTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden my-8">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/60">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                                    <Key size={18} />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-800">
                                        Edit Permissions for {editPermTarget.user.username}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Assigned permissions dictate which sections and actions this admin can perform.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setEditPermTarget(null)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-700">
                                    Assignable Permissions ({selectedPermissions.length} selected)
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelectedPermissions(availablePermissions.map((p) => p.id))
                                        }
                                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                                    >
                                        Select All
                                    </button>
                                    <span className="text-slate-300">|</span>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedPermissions([])}
                                        className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                                {availablePermissions.map((perm) => {
                                    const isChecked = selectedPermissions.includes(perm.id);
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
                                                        ? [...selectedPermissions, perm.id]
                                                        : selectedPermissions.filter((p) => p !== perm.id);
                                                    setSelectedPermissions(next);
                                                }}
                                                className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <div>
                                                <div className="font-semibold">{perm.name}</div>
                                                <div className="text-[10px] text-slate-400 font-mono">{perm.id}</div>
                                                {perm.description && (
                                                    <div className="text-[10px] text-slate-500 mt-0.5">
                                                        {perm.description}
                                                    </div>
                                                )}
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditPermTarget(null)}
                                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handlePermissionsSubmit}
                                    disabled={submittingPermissions}
                                    className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-md transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer"
                                    style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}
                                >
                                    {submittingPermissions ? 'Saving...' : 'Save Permissions'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* Modal 3: Activate / Deactivate Confirmation                */}
            {/* ========================================================= */}
            {statusTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden my-8">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/60">
                            <div className="flex items-center gap-2">
                                <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${statusTarget.is_active
                                        ? 'bg-rose-100 text-rose-700'
                                        : 'bg-emerald-100 text-emerald-700'
                                        }`}
                                >
                                    <AlertTriangle size={18} />
                                </div>
                                <h3 className="text-base font-bold text-slate-800">
                                    {statusTarget.is_active ? 'Deactivate Staff Admin' : 'Activate Staff Admin'}
                                </h3>
                            </div>
                            <button
                                onClick={() => setStatusTarget(null)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <p className="text-sm text-slate-600">
                                Are you sure you want to {statusTarget.is_active ? 'deactivate' : 'activate'} the
                                administrative account for{' '}
                                <span className="font-bold text-slate-800">
                                    {statusTarget.user.username}
                                </span>
                                ?
                                {statusTarget.is_active &&
                                    ' Deactivating will immediately revoke login and admin portal access.'}
                            </p>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Reason for Audit Log (Optional)
                                </label>
                                <textarea
                                    rows={3}
                                    value={statusReason}
                                    onChange={(e) => setStatusReason(e.target.value)}
                                    placeholder="Enter administrative justification..."
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setStatusTarget(null)}
                                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleStatusSubmit}
                                    disabled={submittingStatus}
                                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-md transition-all cursor-pointer ${statusTarget.is_active
                                        ? 'bg-rose-600 hover:bg-rose-700'
                                        : 'bg-emerald-600 hover:bg-emerald-700'
                                        } disabled:opacity-50`}
                                >
                                    {submittingStatus
                                        ? 'Processing...'
                                        : statusTarget.is_active
                                            ? 'Confirm Deactivation'
                                            : 'Confirm Activation'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminStaffAdminsPage;
