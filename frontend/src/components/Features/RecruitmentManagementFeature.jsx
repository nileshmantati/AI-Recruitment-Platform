import { motion } from 'framer-motion';
import { BriefcaseBusiness, ClipboardList, Users, CalendarCheck, ArrowRight } from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const RecruitmentManagementFeature = () => {
    return (
        <section className="py-16 sm:py-24 bg-white relative overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.h2
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-100px" }}
                        className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6 tracking-tight"
                    >
                        Everything You Need to Manage Hiring
                    </motion.h2>
                    <motion.p
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-100px" }}
                        className="text-lg text-slate-600 leading-relaxed"
                    >
                        Powerful recruitment tools designed to keep your entire hiring workflow organized, collaborative, and moving fast.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[280px]">

                    {/* 1. Job Management */}
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-100px" }}
                        className="bg-slate-50 rounded-3xl p-8 border border-slate-200 hover:shadow-xl transition-all duration-300 flex flex-col group lg:col-span-1"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm text-slate-700 mb-6 group-hover:scale-110 group-hover:text-indigo-600 transition-all">
                            <BriefcaseBusiness size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Job Management</h3>
                        <p className="text-sm text-slate-600 mb-auto">Create and manage job openings from one centralized dashboard.</p>

                        <div className="mt-6 flex gap-3">
                            <div className="flex-1 bg-white rounded-xl p-3 shadow-sm border border-slate-100">
                                <span className="block text-2xl font-black text-slate-900">24</span>
                                <span className="block text-xs font-semibold text-slate-500 uppercase">Active Jobs</span>
                            </div>
                            <div className="flex-1 bg-white rounded-xl p-3 shadow-sm border border-slate-100">
                                <span className="block text-2xl font-black text-slate-400">8</span>
                                <span className="block text-xs font-semibold text-slate-400 uppercase">Drafts</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* 2. Application Tracking (Wider) */}
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-100px" }}
                        className="bg-slate-50 rounded-3xl p-8 border border-slate-200 hover:shadow-xl transition-all duration-300 flex flex-col group md:col-span-2 lg:col-span-2 relative overflow-hidden"
                    >
                        <div className="relative z-10">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm text-slate-700 mb-6 group-hover:scale-110 group-hover:text-indigo-600 transition-all">
                                <ClipboardList size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Application Tracking</h3>
                            <p className="text-sm text-slate-600 max-w-sm">Move candidates seamlessly through customizable hiring pipelines.</p>
                        </div>

                        <div className="mt-auto relative z-10 w-full overflow-x-auto pb-2">
                            <div className="flex items-center gap-2 min-w-max">
                                {['Applied', 'AI Evaluated', 'Shortlisted', 'Interview', 'Selected'].map((stage, i, arr) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className={`px-4 py-2 rounded-lg text-xs font-bold ${i === 2 ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}>
                                            {stage}
                                        </div>
                                        {i < arr.length - 1 && <ArrowRight size={14} className="text-slate-300" />}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Decorative gradient */}
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
                    </motion.div>

                    {/* 3. Candidate Management (Wider) */}
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-100px" }}
                        className="bg-slate-50 rounded-3xl p-8 border border-slate-200 hover:shadow-xl transition-all duration-300 flex flex-col group md:col-span-1 lg:col-span-2"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm text-slate-700 mb-6 group-hover:scale-110 group-hover:text-indigo-600 transition-all">
                            <Users size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Candidate Management</h3>
                        <p className="text-sm text-slate-600 mb-6">Centralize candidate profiles, resumes, skills, and applications.</p>

                        <div className="mt-auto bg-white rounded-2xl p-4 border border-slate-100 flex items-center gap-4">
                            <div className="flex -space-x-3">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center overflow-hidden">
                                        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${i}&backgroundColor=e2e8f0`} alt="Avatar" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                                <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-500">
                                    +1k
                                </div>
                            </div>
                            <div className="ml-2">
                                <span className="block text-lg font-black text-slate-900">1,248</span>
                                <span className="block text-xs font-semibold text-slate-500 uppercase">Total Candidates</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* 4. Interview Management */}
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-100px" }}
                        className="bg-slate-50 rounded-3xl p-8 border border-slate-200 hover:shadow-xl transition-all duration-300 flex flex-col group lg:col-span-1"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm text-slate-700 mb-6 group-hover:scale-110 group-hover:text-indigo-600 transition-all">
                            <CalendarCheck size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Interview Management</h3>
                        <p className="text-sm text-slate-600 mb-auto">Schedule and track interviews effortlessly.</p>

                        <div className="mt-6 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm relative">
                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-l-2xl" />
                            <div className="ml-2">
                                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block mb-1">Upcoming Interview</span>
                                <h4 className="text-sm font-bold text-slate-900">John Doe</h4>
                                <p className="text-xs text-slate-500 mb-3">Python Developer</p>
                                <div className="flex justify-between items-center bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                                    <span className="text-xs font-medium text-slate-600">Today · 5:00 PM</span>
                                    <span className="text-[10px] font-bold bg-white px-2 py-1 rounded shadow-sm text-slate-600 border border-slate-200">Scheduled</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

export default RecruitmentManagementFeature;
