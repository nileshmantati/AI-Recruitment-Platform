import { useState, useEffect } from 'react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { getAdminAnalytics } from '../../services/adminApi';
import {
    TrendingUp,
    Sparkles,
    Calendar,
    RefreshCw,
    Award,
    AlertCircle,
    Briefcase,
} from 'lucide-react';
import { T } from '../../Js/theme';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
    EVALUATED: '#0EA5E9',
    SHORTLISTED: '#10B981',
    INTERVIEW_SCHEDULED: '#6366F1',
    PENDING: '#F59E0B',
    REJECTED: '#EF4444',
    ERROR: '#64748B',
};

const STATUS_LABELS = {
    EVALUATED: 'AI Evaluated',
    SHORTLISTED: 'Shortlisted',
    INTERVIEW_SCHEDULED: 'Interview Scheduled',
    PENDING: 'Pending Review',
    REJECTED: 'Rejected',
    ERROR: 'Failed Evaluation',
};

const SCORE_BRACKET_COLORS = {
    below_50: '#EF4444',
    '50_to_69': '#F59E0B',
    '70_to_84': '#0EA5E9',
    '85_and_above': '#10B981',
};

const SCORE_BRACKET_LABELS = {
    below_50: 'Needs Improvement (<50)',
    '50_to_69': 'Fair Match (50-69)',
    '70_to_84': 'Strong Match (70-84)',
    '85_and_above': 'Top Tier Match (85+)',
};

const formatDateISO = (d) => d.toISOString().split('T')[0];

const AdminAnalyticsPage = () => {
    // Presets: 7, 30, 90, or 'custom'
    const [preset, setPreset] = useState('30');
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return formatDateISO(d);
    });
    const [endDate, setEndDate] = useState(() => formatDateISO(new Date()));

    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const applyPreset = (days) => {
        setPreset(days);
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - parseInt(days, 10));
        setStartDate(formatDateISO(start));
        setEndDate(formatDateISO(end));
    };

    useEffect(() => {
        let isMounted = true;
        const s = new Date(startDate);
        const e = new Date(endDate);
        if (s > e) {
            toast.error('Start date cannot be after end date.');
            return;
        }
        const diffDays = Math.round((e - s) / (1000 * 60 * 60 * 24));
        if (diffDays > 365) {
            toast.error('Date range cannot exceed 365 days.');
            return;
        }

        getAdminAnalytics({
            start_date: startDate,
            end_date: endDate,
        })
            .then((data) => {
                if (isMounted) {
                    setAnalytics(data);
                    setError(null);
                    setLoading(false);
                    setRefreshing(false);
                }
            })
            .catch((err) => {
                if (isMounted) {
                    console.error('Failed to load analytics:', err);
                    setError(
                        err.response?.data?.detail ||
                        err.response?.data?.[0] ||
                        err.message ||
                        'Failed to load analytics data.'
                    );
                    setLoading(false);
                    setRefreshing(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [startDate, endDate]);

    const handleRefresh = async () => {
        setRefreshing(true);
        setError(null);
        try {
            const data = await getAdminAnalytics({
                start_date: startDate,
                end_date: endDate,
            });
            setAnalytics(data);
        } catch (err) {
            console.error('Failed to refresh analytics:', err);
            setError(
                err.response?.data?.detail ||
                err.response?.data?.[0] ||
                err.message ||
                'Failed to load analytics data.'
            );
        } finally {
            setRefreshing(false);
        }
    };

    if (loading && !analytics) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 rounded-3xl bg-white border border-slate-200 p-6 animate-pulse" />
                    ))}
                </div>
                <div className="h-80 rounded-3xl bg-white border border-slate-200 p-6 animate-pulse" />
            </div>
        );
    }

    if (error && !analytics) {
        return (
            <div className="rounded-3xl bg-white border border-rose-200 p-8 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mb-4">
                    <AlertCircle size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Failed to Load Analytics</h3>
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

    const totalApplications = analytics?.total_applications || 0;
    const scoreMetrics = analytics?.score_metrics || {};
    const statusBreakdown = analytics?.status_breakdown || {};
    const dailyTrends = analytics?.daily_trends || [];
    const topJobs = analytics?.top_jobs || [];

    // Format status breakdown for BarChart
    const statusBarData = Object.entries(statusBreakdown).map(([key, count]) => ({
        status: STATUS_LABELS[key] || key,
        count,
        color: STATUS_COLORS[key] || '#64748B',
    }));

    // Format score distribution
    const scoreDistData = Object.entries(scoreMetrics.distribution || {}).map(([key, count]) => ({
        bracket: SCORE_BRACKET_LABELS[key] || key,
        count,
        color: SCORE_BRACKET_COLORS[key] || '#4F46E5',
    }));

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Application Analytics</h2>
                    <p className="text-sm font-medium text-slate-500">
                        Historical candidate application velocity and AI resume score metrics.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        <RefreshCw size={14} className={refreshing ? 'animate-spin text-indigo-600' : ''} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Timeframe Presets & Custom Date Picker */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
                        Timeframe:
                    </span>
                    {['7', '30', '90'].map((d) => (
                        <button
                            key={d}
                            type="button"
                            onClick={() => applyPreset(d)}
                            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${preset === d
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {d} Days
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto text-xs">
                    <Calendar size={15} className="text-slate-400" />
                    <input
                        type="date"
                        value={startDate}
                        max={endDate}
                        onChange={(e) => {
                            setPreset('custom');
                            setStartDate(e.target.value);
                        }}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-slate-700 outline-none focus:border-indigo-500"
                    />
                    <span className="text-slate-400 font-bold">to</span>
                    <input
                        type="date"
                        value={endDate}
                        min={startDate}
                        max={formatDateISO(new Date())}
                        onChange={(e) => {
                            setPreset('custom');
                            setEndDate(e.target.value);
                        }}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-slate-700 outline-none focus:border-indigo-500"
                    />
                </div>
            </div>

            {/* Top Score & Summary Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Total In Period
                        </span>
                        <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-slate-900">{totalApplications}</div>
                    <span className="text-xs text-slate-400 mt-1 block">Submissions across date range</span>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Avg AI Resume Score
                        </span>
                        <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-600">
                            <Sparkles size={20} />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-slate-900">
                        {scoreMetrics.average ? `${scoreMetrics.average}%` : 'N/A'}
                    </div>
                    <span className="text-xs text-slate-400 mt-1 block">Based on evaluated submissions</span>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Score Extremes (Min / Max)
                        </span>
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                            <Award size={20} />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-slate-900">
                        {scoreMetrics.min || 0}% / {scoreMetrics.max || 0}%
                    </div>
                    <span className="text-xs text-slate-400 mt-1 block">Lowest and highest candidate scores</span>
                </div>
            </div>

            {/* Daily Trends Chart */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-base font-bold text-slate-800">Application Velocity Trend</h3>
                        <p className="text-xs text-slate-400">Daily candidate submissions across the selected window</p>
                    </div>
                </div>

                {dailyTrends.length === 0 ? (
                    <div className="py-16 text-center text-xs text-slate-400">
                        No application activity recorded in this date range.
                    </div>
                ) : (
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dailyTrends} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="appTrendGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={T.primary} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={T.primary} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} allowDecimals={false} />
                                <RechartsTooltip
                                    contentStyle={{
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        fontSize: '12px',
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="applications"
                                    name="Applications"
                                    stroke={T.primary}
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#appTrendGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Two-Column Breakdown: Statuses & Score Distribution */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Status Breakdown Bar Chart */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-base font-bold text-slate-800 mb-1">Status Volume Breakdown</h3>
                    <p className="text-xs text-slate-400 mb-5">Applications grouped by current workflow stage</p>

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={statusBarData} margin={{ top: 10, right: 10, left: -25, bottom: 25 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis
                                    dataKey="status"
                                    stroke="#94A3B8"
                                    fontSize={10}
                                    tickLine={false}
                                    interval={0}
                                    angle={-15}
                                    textAnchor="end"
                                />
                                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} allowDecimals={false} />
                                <RechartsTooltip
                                    contentStyle={{
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                    }}
                                />
                                <Bar dataKey="count" name="Applications" radius={[6, 6, 0, 0]}>
                                    {statusBarData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Score Bracket Distribution */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-base font-bold text-slate-800 mb-1">AI Resume Score Distribution</h3>
                    <p className="text-xs text-slate-400 mb-5">Evaluated applications segmented by match quality</p>

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={scoreDistData} margin={{ top: 10, right: 10, left: -25, bottom: 25 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis
                                    dataKey="bracket"
                                    stroke="#94A3B8"
                                    fontSize={10}
                                    tickLine={false}
                                    interval={0}
                                    angle={-15}
                                    textAnchor="end"
                                />
                                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} allowDecimals={false} />
                                <RechartsTooltip
                                    contentStyle={{
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                    }}
                                />
                                <Bar dataKey="count" name="Evaluations" radius={[6, 6, 0, 0]}>
                                    {scoreDistData.map((entry, index) => (
                                        <Cell key={`score-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Top Jobs Table */}
            {topJobs.length > 0 && (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Briefcase size={18} className="text-indigo-600" />
                        <h3 className="text-base font-bold text-slate-800">Top Jobs by Application Volume</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                                <tr>
                                    <th className="py-3 pl-4">Job Title</th>
                                    <th className="py-3 text-right pr-4">Applications in Period</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {topJobs.map((j, idx) => (
                                    <tr key={j.id} className="hover:bg-slate-50/50">
                                        <td className="py-3 pl-4 font-bold text-slate-800 flex items-center gap-2">
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] text-slate-600 font-bold">
                                                {idx + 1}
                                            </span>
                                            {j.title}
                                        </td>
                                        <td className="py-3 text-right pr-4 font-black text-indigo-600">
                                            {j.application_count}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAnalyticsPage;
