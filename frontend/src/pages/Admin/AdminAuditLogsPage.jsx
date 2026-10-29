import { useState, useEffect, useCallback } from 'react';
import { getAdminAuditLogs } from '../../services/adminApi';
import {
    FileText,
    Search,
    RefreshCw,
    X,
    Eye,
    ChevronLeft,
    ChevronRight,
    Activity
} from 'lucide-react';
import { T } from '../../Js/theme';
import toast from 'react-hot-toast';

const ACTION_COLORS = {
    STAFF_ADMIN_PROVISIONED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    STAFF_PERMISSIONS_UPDATED: 'bg-purple-50 text-purple-700 border-purple-200',
    ADMIN_ACCOUNT_ACTIVATED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    ADMIN_ACCOUNT_DEACTIVATED: 'bg-rose-50 text-rose-700 border-rose-200',
    USER_ACCOUNT_ACTIVATED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    USER_ACCOUNT_DEACTIVATED: 'bg-amber-50 text-amber-700 border-amber-200',
    JOB_ACTIVATED: 'bg-teal-50 text-teal-700 border-teal-200',
    JOB_DEACTIVATED: 'bg-rose-50 text-rose-700 border-rose-200',
    RECRUITER_VERIFIED: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    RECRUITER_UNVERIFIED: 'bg-slate-50 text-slate-700 border-slate-200',
    SUPER_ADMIN_BOOTSTRAPPED: 'bg-emerald-50 text-emerald-800 border-emerald-300',
};

const AdminAuditLogsPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Filters
    const [search, setSearch] = useState('');
    const [submittedSearch, setSubmittedSearch] = useState('');
    const [actionFilter, setActionFilter] = useState('');
    const [targetTypeFilter, setTargetTypeFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Detail Modal
    const [selectedLog, setSelectedLog] = useState(null);

    const fetchLogs = useCallback(() => {
        setLoading(true);
        getAdminAuditLogs({
            page,
            action: actionFilter,
            target_type: targetTypeFilter,
            search: submittedSearch.trim(),
            start_date: startDate || undefined,
            end_date: endDate || undefined,
        })
            .then((data) => {
                setLogs(data.results || []);
                setTotalCount(data.count || 0);
                const size = 20;
                setTotalPages(Math.ceil((data.count || 0) / size) || 1);
            })
            .catch((err) => {
                console.error('Failed to load audit logs:', err);
                toast.error(err.response?.data?.detail || 'Failed to load audit logs.');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [page, actionFilter, targetTypeFilter, submittedSearch, startDate, endDate]);

    useEffect(() => {
        let isMounted = true;
        getAdminAuditLogs({
            page,
            action: actionFilter,
            target_type: targetTypeFilter,
            search: submittedSearch.trim(),
            start_date: startDate || undefined,
            end_date: endDate || undefined,
        })
            .then((data) => {
                if (!isMounted) return;
                setLogs(data.results || []);
                setTotalCount(data.count || 0);
                const size = 20;
                setTotalPages(Math.ceil((data.count || 0) / size) || 1);
            })
            .catch((err) => {
                if (!isMounted) return;
                console.error('Failed to load audit logs:', err);
                toast.error(err.response?.data?.detail || 'Failed to load audit logs.');
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [page, actionFilter, targetTypeFilter, submittedSearch, startDate, endDate]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(1);
        setSubmittedSearch(search);
    };

    const handleClearFilters = () => {
        setSearch('');
        setSubmittedSearch('');
        setActionFilter('');
        setTargetTypeFilter('');
        setStartDate('');
        setEndDate('');
        setPage(1);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <div
                            className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm"
                            style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}
                        >
                            <FileText size={20} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Security Audit Trail</h1>
                            <p className="text-xs text-slate-500">
                                Tamper-resistant log of administrative events, account modifications, and security actions.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchLogs}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm space-y-3">
                <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
                        <Search size={16} className="text-slate-400 shrink-0" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search summary, target, or actor..."
                            className="w-full bg-transparent text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch('');
                                    setSubmittedSearch('');
                                }}
                                className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
                        style={{ background: T.primary }}
                    >
                        Search
                    </button>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1 border-t border-slate-100">
                    <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Action Type</label>
                        <select
                            value={actionFilter}
                            onChange={(e) => {
                                setActionFilter(e.target.value);
                                setPage(1);
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                        >
                            <option value="">All Actions</option>
                            <option value="STAFF_ADMIN_PROVISIONED">Staff Admin Provisioned</option>
                            <option value="STAFF_PERMISSIONS_UPDATED">Staff Permissions Updated</option>
                            <option value="ADMIN_ACCOUNT_ACTIVATED">Admin Account Activated</option>
                            <option value="ADMIN_ACCOUNT_DEACTIVATED">Admin Account Deactivated</option>
                            <option value="USER_ACCOUNT_ACTIVATED">User Activated</option>
                            <option value="USER_ACCOUNT_DEACTIVATED">User Deactivated</option>
                            <option value="JOB_ACTIVATED">Job Activated</option>
                            <option value="JOB_DEACTIVATED">Job Deactivated</option>
                            <option value="RECRUITER_VERIFIED">Recruiter Verified</option>
                            <option value="RECRUITER_UNVERIFIED">Recruiter Unverified</option>
                            <option value="SUPER_ADMIN_BOOTSTRAPPED">Super Admin Bootstrapped</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Target Resource</label>
                        <select
                            value={targetTypeFilter}
                            onChange={(e) => {
                                setTargetTypeFilter(e.target.value);
                                setPage(1);
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                        >
                            <option value="">All Resources</option>
                            <option value="USER">User / Admin</option>
                            <option value="JOB">Job Post</option>
                            <option value="COMPANY">Company Profile</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => {
                                setStartDate(e.target.value);
                                setPage(1);
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => {
                                setEndDate(e.target.value);
                                setPage(1);
                            }}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                </div>

                {(actionFilter || targetTypeFilter || startDate || endDate || submittedSearch) && (
                    <div className="flex justify-end pt-1">
                        <button
                            type="button"
                            onClick={handleClearFilters}
                            className="text-xs font-semibold text-rose-600 hover:text-rose-800 cursor-pointer"
                        >
                            Reset All Filters
                        </button>
                    </div>
                )}
            </div>

            {/* Table Container */}
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-bold text-slate-800">Audit Events</h2>
                        <p className="text-xs text-slate-400">Total recorded entries: {totalCount}</p>
                    </div>
                    <span className="text-xs text-slate-500">
                        Page {page} of {totalPages}
                    </span>
                </div>

                {loading ? (
                    <div className="flex min-h-[260px] items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"></div>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="flex min-h-[220px] flex-col items-center justify-center p-6 text-center">
                        <Activity size={36} className="text-slate-300 mb-2" />
                        <p className="text-sm font-semibold text-slate-700">No Audit Events Found</p>
                        <p className="text-xs text-slate-400 mt-1">
                            Try adjusting your filters or date range to see earlier events.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                <tr>
                                    <th className="px-6 py-3.5">Timestamp</th>
                                    <th className="px-6 py-3.5">Actor</th>
                                    <th className="px-6 py-3.5">Action</th>
                                    <th className="px-6 py-3.5">Target</th>
                                    <th className="px-6 py-3.5">Summary</th>
                                    <th className="px-6 py-3.5 text-right">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {logs.map((log) => {
                                    const actionBadge =
                                        ACTION_COLORS[log.action] || 'bg-slate-100 text-slate-700 border-slate-200';
                                    const dt = new Date(log.timestamp);

                                    return (
                                        <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-6 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                                                <div>{dt.toLocaleDateString()}</div>
                                                <div className="text-[11px] text-slate-400">
                                                    {dt.toLocaleTimeString()}
                                                </div>
                                            </td>

                                            <td className="px-6 py-3.5 font-semibold text-xs text-slate-800">
                                                {log.actor_username || 'System'}
                                            </td>

                                            <td className="px-6 py-3.5">
                                                <span
                                                    className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-mono font-semibold border ${actionBadge}`}
                                                >
                                                    {log.action}
                                                </span>
                                            </td>

                                            <td className="px-6 py-3.5 text-xs text-slate-600">
                                                {log.target_repr ? (
                                                    <div>
                                                        <span className="font-medium text-slate-800">
                                                            {log.target_repr}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 block font-mono">
                                                            {log.target_type} #{log.target_id}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400">—</span>
                                                )}
                                            </td>

                                            <td className="px-6 py-3.5 text-xs text-slate-600 max-w-md truncate">
                                                {log.summary || '—'}
                                            </td>

                                            <td className="px-6 py-3.5 text-right whitespace-nowrap">
                                                <button
                                                    onClick={() => setSelectedLog(log)}
                                                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 cursor-pointer"
                                                >
                                                    <Eye size={13} className="text-indigo-600" />
                                                    Inspect
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination Footer */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3 bg-slate-50/50">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                        >
                            <ChevronLeft size={14} /> Previous
                        </button>

                        <span className="text-xs text-slate-500">
                            Page {page} of {totalPages}
                        </span>

                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages}
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                        >
                            Next <ChevronRight size={14} />
                        </button>
                    </div>
                )}
            </div>

            {/* Inspect Modal */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden my-8">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/60">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                                    <FileText size={18} />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-800">Audit Event Details</h3>
                                    <p className="text-xs text-slate-500">
                                        ID #{selectedLog.id} • {new Date(selectedLog.timestamp).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Action
                                </span>
                                <div className="mt-1">
                                    <span
                                        className={`inline-block rounded-md px-2.5 py-1 text-xs font-mono font-semibold border ${ACTION_COLORS[selectedLog.action] ||
                                            'bg-slate-100 text-slate-700 border-slate-200'
                                            }`}
                                    >
                                        {selectedLog.action}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Acting Admin
                                    </span>
                                    <div className="mt-1 text-sm font-semibold text-slate-800">
                                        {selectedLog.actor_username || 'System Automation'}
                                    </div>
                                </div>

                                <div>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Target Resource
                                    </span>
                                    <div className="mt-1 text-sm font-semibold text-slate-800">
                                        {selectedLog.target_type || 'N/A'}{' '}
                                        {selectedLog.target_id && `(#${selectedLog.target_id})`}
                                    </div>
                                    {selectedLog.target_repr && (
                                        <div className="text-xs text-slate-500">{selectedLog.target_repr}</div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Summary
                                </span>
                                <div className="mt-1 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                                    {selectedLog.summary || 'No summary recorded.'}
                                </div>
                            </div>

                            {/* Network Metadata */}
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                    <span className="font-bold text-slate-500">Client IP Address</span>
                                    <div className="font-mono text-slate-700 mt-0.5">
                                        {selectedLog.ip_address || 'Unavailable'}
                                    </div>
                                </div>

                                <div>
                                    <span className="font-bold text-slate-500">Correlation ID</span>
                                    <div className="font-mono text-slate-700 mt-0.5">
                                        {selectedLog.correlation_id || 'None'}
                                    </div>
                                </div>
                            </div>

                            {/* Structured Changes / Metadata */}
                            <div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Sanitized Changes & Metadata
                                </span>
                                <pre className="mt-1 text-xs text-slate-800 bg-slate-900 text-slate-100 p-3 rounded-xl overflow-x-auto max-h-48 font-mono">
                                    {JSON.stringify(selectedLog.metadata || {}, null, 2)}
                                </pre>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedLog(null)}
                                    className="rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-md cursor-pointer"
                                    style={{ background: T.primary }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAuditLogsPage;
