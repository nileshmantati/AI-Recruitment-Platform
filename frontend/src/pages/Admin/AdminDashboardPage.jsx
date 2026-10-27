import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDashboardStats, getAdminAuditLogs } from '../../services/adminApi';
import { KpiCard } from '../../ui/DashboardUI';
import {
    Users,
    Briefcase,
    FileText,
    Building2,
    ShieldCheck,
    AlertCircle,
    ArrowUpRight,
    RefreshCw,
    Activity,
} from 'lucide-react';
import { T } from '../../Js/theme';

const STATUS_CONFIG = {
    EVALUATED: { label: 'AI Evaluated', bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
    SHORTLISTED: { label: 'Shortlisted', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    INTERVIEW_SCHEDULED: { label: 'Interview Scheduled', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    PENDING: { label: 'Pending Review', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    REJECTED: { label: 'Rejected', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    ERROR: { label: 'Failed Evaluation', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
};

const AdminDashboardPage = () => {
    const { hasPermission } = useAuth();
    const [stats, setStats] = useState(null);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const canViewAuditLogs = hasPermission('audit_logs.view');

    useEffect(() => {
        let isMounted = true;
        Promise.all([
            getDashboardStats(),
            canViewAuditLogs
                ? getAdminAuditLogs({ page_size: 5 }).catch(() => ({ results: [] }))
                : Promise.resolve({ results: [] }),
        ])
            .then(([statsData, logsData]) => {
                if (isMounted) {
                    setStats(statsData);
                    setAuditLogs(logsData.results || []);
                    setLoading(false);
                }
            })
            .catch((err) => {
                if (isMounted) {
                    setError(err.response?.data?.detail || err.message || 'Unable to load dashboard statistics.');
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [canViewAuditLogs]);

    const handleRefresh = async () => {
        setRefreshing(true);
        setError(null);
        try {
            const statsData = await getDashboardStats();
            setStats(statsData);
            if (canViewAuditLogs) {
                const logsData = await getAdminAuditLogs({ page_size: 5 }).catch(() => ({ results: [] }));
                setAuditLogs(logsData.results || []);
            }
        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Unable to load dashboard statistics.');
        } finally {
            setRefreshing(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-40 rounded-3xl bg-white border border-slate-200 p-6 animate-pulse" />
                    ))}
                </div>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="h-64 rounded-3xl bg-white border border-slate-200 p-6 animate-pulse" />
                    <div className="h-64 rounded-3xl bg-white border border-slate-200 p-6 animate-pulse" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-3xl bg-white border border-rose-200 p-8 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mb-4">
                    <AlertCircle size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Failed to Load Dashboard</h3>
                <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">{error}</p>
                <button
                    onClick={handleRefresh}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:opacity-90 transition-all cursor-pointer"
                    style={{ background: T.primary }}
                >
                    <RefreshCw size={16} /> Try Again
                </button>
            </div>
        );
    }

    const users = stats?.users || {};
    const jobs = stats?.jobs || {};
    const applications = stats?.applications || {};
    const companies = stats?.companies || {};
    const byStatus = applications.by_status || {};

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">System Overview</h2>
                    <p className="text-sm font-medium text-slate-500">
                        Real-time platform activity and operational health metrics.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        <RefreshCw size={14} className={refreshing ? 'animate-spin text-indigo-600' : ''} />
                        <span>Refresh Metrics</span>
                    </button>
                </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                    icon={Users}
                    label="Total Platform Users"
                    value={users.total || 0}
                    color="#4F46E5"
                    badge={`${users.active || 0} Active`}
                    subtitle={`(${users.candidates || 0} Cand / ${users.recruiters || 0} Rec)`}
                />
                <KpiCard
                    icon={Briefcase}
                    label="Platform Jobs"
                    value={jobs.total || 0}
                    color="#06B6D4"
                    badge={`${jobs.active || 0} Active`}
                    subtitle={`(${jobs.inactive || 0} Inactive)`}
                />
                <KpiCard
                    icon={FileText}
                    label="Total Applications"
                    value={applications.total || 0}
                    color="#8B5CF6"
                    badge="Processed"
                    subtitle={`${byStatus.EVALUATED || 0} AI Evaluated`}
                />
                <KpiCard
                    icon={Building2}
                    label="Companies"
                    value={companies.total || 0}
                    color="#10B981"
                    badge={`${companies.verified || 0} Verified`}
                    subtitle={`${companies.pending_verification || 0} Pending`}
                />
            </div>

            {/* Detailed Breakdowns Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Application Status Pipeline */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                                <FileText size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-base">Application Status Pipeline</h3>
                                <p className="text-xs text-slate-400">Status counts across all platform submissions</p>
                            </div>
                        </div>
                        <Link
                            to="/admin/analytics"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 no-underline"
                        >
                            <span>Analytics</span>
                            <ArrowUpRight size={14} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {Object.entries(byStatus).map(([statusKey, count]) => {
                            const config = STATUS_CONFIG[statusKey] || {
                                label: statusKey,
                                bg: 'bg-slate-50',
                                text: 'text-slate-700',
                                border: 'border-slate-200',
                            };
                            return (
                                <div
                                    key={statusKey}
                                    className={`rounded-2xl border p-4 ${config.bg} ${config.border}`}
                                >
                                    <span className="text-xs font-semibold text-slate-500 block truncate">
                                        {config.label}
                                    </span>
                                    <span className={`text-2xl font-black mt-1 block ${config.text}`}>
                                        {count}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Account & Verification Breakdown */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                                    <ShieldCheck size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-base">Account Security & Verification</h3>
                                    <p className="text-xs text-slate-400">Platform identity and authorization breakdown</p>
                                </div>
                            </div>
                            <Link
                                to="/admin/users"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 no-underline"
                            >
                                <span>Manage</span>
                                <ArrowUpRight size={14} />
                            </Link>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-3 w-3 rounded-full bg-emerald-500" />
                                    <span className="text-xs font-bold text-slate-700">Active Accounts</span>
                                </div>
                                <span className="text-sm font-extrabold text-slate-900">{users.active || 0}</span>
                            </div>

                            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-3 w-3 rounded-full bg-rose-500" />
                                    <span className="text-xs font-bold text-slate-700">Inactive / Suspended Accounts</span>
                                </div>
                                <span className="text-sm font-extrabold text-slate-900">{users.inactive || 0}</span>
                            </div>

                            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-3 w-3 rounded-full bg-cyan-500" />
                                    <span className="text-xs font-bold text-slate-700">Email Verified Accounts</span>
                                </div>
                                <span className="text-sm font-extrabold text-slate-900">{users.email_verified || 0}</span>
                            </div>

                            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-3 w-3 rounded-full bg-indigo-500" />
                                    <span className="text-xs font-bold text-slate-700">Administrative Staff (Super + Staff)</span>
                                </div>
                                <span className="text-sm font-extrabold text-slate-900">
                                    {(users.super_admins || 0) + (users.staff_admins || 0)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Administrative Activity (Audit Logs) */}
            {canViewAuditLogs && (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                                <Activity size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-base">Recent Administrative Audit Events</h3>
                                <p className="text-xs text-slate-400">Latest immutable logs recorded by the platform audit service</p>
                            </div>
                        </div>
                    </div>

                    {auditLogs.length === 0 ? (
                        <div className="p-8 text-center text-sm text-slate-400">
                            No administrative audit records logged yet.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                                        <th className="pb-3 pl-2">Timestamp</th>
                                        <th className="pb-3">Actor</th>
                                        <th className="pb-3">Action</th>
                                        <th className="pb-3">Target</th>
                                        <th className="pb-3">Summary</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {auditLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="py-3 pl-2 whitespace-nowrap text-slate-500 font-mono">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </td>
                                            <td className="py-3 font-semibold text-slate-800">
                                                {log.actor_username || 'System'}
                                            </td>
                                            <td className="py-3">
                                                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="py-3 text-slate-600">
                                                {log.target_type}: {log.target_repr || log.target_id || 'N/A'}
                                            </td>
                                            <td className="py-3 text-slate-600 max-w-xs truncate" title={log.summary}>
                                                {log.summary}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminDashboardPage;
