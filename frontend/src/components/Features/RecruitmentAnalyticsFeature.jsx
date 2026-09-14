import { motion } from 'framer-motion';
import { ChartNoAxesCombined, TrendingUp, Users, ClipboardList, CheckCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { T } from '../../Js/theme';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const data = [
    { name: 'Jan', applications: 120 },
    { name: 'Feb', applications: 180 },
    { name: 'Mar', applications: 250 },
    { name: 'Apr', applications: 210 },
    { name: 'May', applications: 380 },
    { name: 'Jun', applications: 450 },
    { name: 'Jul', applications: 856 },
];

const RecruitmentAnalyticsFeature = () => {
    return (
        <section className="py-16 sm:py-24 bg-slate-50 relative overflow-hidden border-y border-slate-200">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center mb-12">
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-100px" }}
                        className="max-w-xl"
                    >
                        <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 mb-6">
                            <ChartNoAxesCombined size={24} />
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
                            Recruitment Analytics
                        </h2>
                        <p className="text-lg text-slate-600 leading-relaxed mb-8">
                            Understand your hiring performance through meaningful recruitment metrics and insights. Track where your best candidates are coming from and how fast they move through your pipeline.
                        </p>
                    </motion.div>

                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-100px" }}
                        className="grid grid-cols-2 gap-4"
                    >
                        {[
                            { label: "Total Candidates", value: "1,248", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                            { label: "Total Applications", value: "856", icon: ClipboardList, color: "text-indigo-600", bg: "bg-indigo-50" },
                            { label: "Shortlisted", value: "142", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
                            { label: "Interviews", value: "67", icon: CheckCircle, color: "text-amber-600", bg: "bg-amber-50" }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                                <div className={`h-10 w-10 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
                                    <stat.icon size={20} />
                                </div>
                                <span className="block text-2xl font-black text-slate-900 mb-1">{stat.value}</span>
                                <span className="block text-xs font-semibold text-slate-500 uppercase">{stat.label}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Chart Container */}
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-100px" }}
                        className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg"
                    >
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Applications Over Time</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={T.primary} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={T.primary} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ color: T.primary, fontWeight: 'bold' }}
                                    />
                                    <Area type="monotone" dataKey="applications" stroke={T.primary} strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Funnel Container */}
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-100px" }}
                        className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-lg flex flex-col"
                    >
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Hiring Funnel</h3>

                        <div className="flex-1 flex flex-col justify-between">
                            {[
                                { stage: "Applications", count: 856, width: "100%", bg: "bg-slate-800" },
                                { stage: "AI Evaluated", count: 642, width: "85%", bg: "bg-indigo-600" },
                                { stage: "Shortlisted", count: 142, width: "50%", bg: "bg-indigo-500" },
                                { stage: "Interview", count: 67, width: "30%", bg: "bg-indigo-400" },
                                { stage: "Selected", count: 31, width: "15%", bg: "bg-emerald-500" },
                            ].map((item, i) => (
                                <div key={i} className="w-full relative mb-4 last:mb-0">
                                    <div className="flex justify-between items-end mb-1 px-1">
                                        <span className="text-xs font-semibold text-slate-600">{item.stage}</span>
                                        <span className="text-sm font-bold text-slate-900">{item.count}</span>
                                    </div>
                                    <div className="h-8 w-full bg-slate-50 rounded-lg overflow-hidden flex justify-center border border-slate-100">
                                        <div
                                            className={`h-full ${item.bg} rounded-md transition-all duration-1000 ease-out`}
                                            style={{ width: item.width }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default RecruitmentAnalyticsFeature;
