import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import { Briefcase, Users, FileText } from 'lucide-react';
import { T } from '../../Js/theme.js';

const AnalyticsOverview = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recentApplications, setRecentApplications] = useState([]);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await api.get('analytics/recruiter-stats/');
                setStats(response.data);
            } catch (error) {
                console.error("Failed to load analytics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [stats]);

    useEffect(() => {
        retrivelatesetApplications();
    }, [])

    const retrivelatesetApplications = async () => {
        try {
            const response = await api.get('applications/latest/');
            setRecentApplications(response.data);
        } catch (err) {
            console.error(err);
            setError('Could not fetch recent applications.');
        }
    };

    const statusStyles = {
        INTERVIEW_SCHEDULED: { bg: `${T.primary}1A`, color: T.primary, label: "Interview" },
        EVALUATED: { bg: `${T.secondary}1A`, color: "#0E7490", label: "Evaluated" },
        PENDING: { bg: "#F1F5F9", color: "#475569", label: "Applied" },
        SHORTLISTED: { bg: `${T.success}1A`, color: "#15803D", label: "Shortlisted" },
        REJECTED: { bg: `${T.danger}1A`, color: "#B91C1C", label: "Rejected" },
    };

    const getTimeAgo = (date) => {
        const diff = Date.now() - new Date(date).getTime();

        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 60) return `${minutes} min ago`;
        if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
        return `${days} day${days > 1 ? "s" : ""} ago`;
    };

    if (loading)
        return (<div className="flex h-96 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>)

    if (!stats) return null;

    function KpiCard({ icon: Icon, label, value, delta, color }) {
        return (
            <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${color}18`, color }}>
                        <Icon size={18} />
                    </div>
                </div>
                <div className="text-2xl font-extrabold text-slate-900">{value}</div>
                <div className="mt-1 text-xs font-medium text-slate-500">{label}</div>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                <KpiCard icon={Briefcase} label="Total Jobs" value={stats.total_jobs} color={T.primary} />
                <KpiCard icon={FileText} label="Applications" value={stats.total_applications} color={T.secondary} />
                <KpiCard icon={Users} label="Shortlisted" value={stats.shortlisted} color={T.accent} />
                {/* <KpiCard icon={Target} label="AI Match Rate" value={"92%"} color={T.warning} /> */}
                {/* <KpiCard icon={Award} label="Hiring Success" value={"87%"} color={T.success} /> */}
            </div>
            <div>
                {stats.total_jobs > 0 && (
                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <h6 className="mb-6 text-lg font-semibold text-gray-900">
                            Applications Per Job
                        </h6>

                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={stats.chart_data}
                                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />

                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: "#6b7280" }}
                                    />

                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: "#6b7280" }}
                                    />

                                    <Tooltip
                                        cursor={{ fill: "rgba(59,130,246,0.08)" }}
                                        contentStyle={{
                                            borderRadius: "12px",
                                            border: "none",
                                            boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                                        }}
                                    />

                                    <Bar
                                        dataKey="applicants"
                                        fill="#3B82F6"
                                        radius={[6, 6, 0, 0]}
                                        barSize={40}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm xl:col-span-2">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg! font-bold mb-0 text-slate-900">Recent applications</h3>
                        <button className="text-lg! font-semibold" style={{ color: T.primary }}>View all</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="text-sm text-slate-400 text-center">
                                    <th className="pb-3 font-medium text-start">Candidate</th>
                                    <th className="pb-3 font-medium">Role</th>
                                    <th className="pb-3 font-medium">Match</th>
                                    <th className="pb-3 font-medium">Status</th>
                                    <th className="pb-3 font-medium">Applied</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentApplications.map((a) => {
                                    const style = statusStyles[a.status] || { bg: "#F1F5F9", color: "#475569", label: a.status };
                                    return (
                                        <tr key={a.id} className="border-t border-slate-50 text-center">
                                            <td className="py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: T.accent }}>
                                                        {a.candidate_name ? a.candidate_name.substring(0, 2).toUpperCase() : '??'}
                                                    </div>
                                                    <span className="font-semibold text-slate-800">{a.candidate_name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 text-slate-500 capitalize">{a.job_details?.title || 'Unknown Role'}</td>
                                            <td className="py-3 font-semibold text-slate-800">{a.resume_score}%</td>
                                            <td className="py-3">
                                                <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: style.bg, color: style.color }}>
                                                    {style.label}
                                                </span>
                                            </td>
                                            <td className="py-3 text-slate-400">{getTimeAgo(a.applied_at)}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AnalyticsOverview;