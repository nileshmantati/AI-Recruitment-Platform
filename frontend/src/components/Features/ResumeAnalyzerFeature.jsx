import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, FileText, Check } from 'lucide-react';
import { T } from '../../Js/theme';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const ResumeAnalyzerFeature = () => {
    return (
        <section id="features" className="py-16 sm:py-24 bg-slate-50 relative overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    className="rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Left Content */}
                        <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
                            <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold mb-6 w-max"
                                style={{ background: `${T.primary}15`, color: T.primary }}
                            >
                                <Sparkles size={16} />
                                ✦ AI POWERED
                            </div>

                            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
                                AI Resume Analyzer
                            </h2>
                            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                Automatically analyze resumes and extract the information recruiters need to make faster hiring decisions.
                            </p>

                            <ul className="space-y-4">
                                {[
                                    'Intelligent resume parsing',
                                    'Skills extraction',
                                    'Experience analysis',
                                    'Education detection',
                                    'Job compatibility'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shrink-0">
                                            <CheckCircle2 size={16} />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Right Mock UI */}
                        <div className="bg-slate-50 p-8 sm:p-12 lg:p-16 flex items-center justify-center border-t lg:border-t-0 lg:border-l border-slate-200">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                viewport={{ once: true }}
                                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100"
                            >
                                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">Resume Analysis</h3>
                                        <p className="text-sm font-medium text-slate-500">John Doe • Python Developer</p>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-sm font-semibold text-slate-700">AI Match Score</span>
                                        <span className="text-2xl font-black" style={{ color: T.primary }}>92%</span>
                                    </div>
                                    <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: "92%" }}
                                            transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                                            viewport={{ once: true }}
                                            className="h-full rounded-full"
                                            style={{ background: `linear-gradient(90deg, ${T.primary}, ${T.accent})` }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-semibold text-slate-900 mb-3">Extracted Skills</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {['Python', 'Django', 'REST API', 'React', 'MySQL'].map((skill, i) => (
                                            <span
                                                key={i}
                                                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100"
                                            >
                                                {skill} <Check size={12} />
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center">
                                    <span className="text-sm font-medium text-slate-500">Experience Detected</span>
                                    <span className="text-sm font-bold text-slate-900">2.5 Years</span>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default ResumeAnalyzerFeature;
