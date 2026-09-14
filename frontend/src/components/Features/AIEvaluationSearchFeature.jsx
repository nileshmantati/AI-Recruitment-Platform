import { motion } from 'framer-motion';
import { Brain, Search, Check, AlertCircle } from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const AIEvaluationSearchFeature = () => {
    return (
        <section className="py-16 sm:py-24 bg-slate-50 relative overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Left Card - AI Evaluation */}
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-100px" }}
                        className="bg-white rounded-3xl p-8 sm:p-10 shadow-lg border border-slate-200 flex flex-col h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-6">
                            <Brain size={28} />
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4 tracking-tight">
                            Understand Every Candidate
                        </h3>
                        <p className="text-base text-slate-600 mb-8 leading-relaxed">
                            Get concise AI-generated insights into candidate strengths, weaknesses, and overall job suitability before you even schedule an interview.
                        </p>

                        <div className="mt-auto bg-slate-50 rounded-2xl p-6 border border-slate-100">
                            <h4 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Candidate Evaluation</h4>

                            <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-200">
                                <span className="text-slate-600 font-medium">Overall Match</span>
                                <span className="text-2xl font-black text-indigo-600">91%</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <span className="block text-xs text-slate-500 mb-1">Skills</span>
                                    <span className="block text-sm font-bold text-slate-900">Excellent</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-slate-500 mb-1">Experience</span>
                                    <span className="block text-sm font-bold text-slate-900">Strong</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-slate-500 mb-1">Education</span>
                                    <span className="block text-sm font-bold text-slate-900">Good</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                                <div>
                                    <h5 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5"><Check size={14} className="text-emerald-500" /> Strengths</h5>
                                    <ul className="text-sm text-slate-600 space-y-2">
                                        <li>✓ Django</li>
                                        <li>✓ Python</li>
                                        <li>✓ REST APIs</li>
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5"><AlertCircle size={14} className="text-amber-500" /> Areas to Improve</h5>
                                    <ul className="text-sm text-slate-600 space-y-2">
                                        <li>• Limited React experience</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Card - Smart Search */}
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-100px" }}
                        className="bg-white rounded-3xl p-8 sm:p-10 shadow-lg border border-slate-200 flex flex-col h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-6">
                            <Search size={28} />
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4 tracking-tight">
                            Find Candidates Instantly
                        </h3>
                        <p className="text-base text-slate-600 mb-8 leading-relaxed">
                            Search your entire talent pool using natural language, specific skills, or AI scores. Stop losing great candidates in your ATS.
                        </p>

                        <div className="mt-auto bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col gap-4 relative overflow-hidden">
                            {/* Mock UI Search Bar */}
                            <div className="relative">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    readOnly
                                    value="Search candidates..."
                                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-500 shadow-sm outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-2">
                                <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                                    <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Skill</span>
                                    <span className="block text-sm font-semibold text-slate-900">Python</span>
                                </div>
                                <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                                    <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Experience</span>
                                    <span className="block text-sm font-semibold text-slate-900">2+ Years</span>
                                </div>
                                <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                                    <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">AI Score</span>
                                    <span className="block text-sm font-semibold text-slate-900">80%+</span>
                                </div>
                                <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                                    <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Status</span>
                                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-600">Shortlisted</span>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-center pt-4 border-t border-slate-200 border-dashed">
                                <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full">24 candidates found</span>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

export default AIEvaluationSearchFeature;
