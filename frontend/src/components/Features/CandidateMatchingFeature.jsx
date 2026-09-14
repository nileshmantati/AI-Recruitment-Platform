import { motion } from 'framer-motion';
import { Target, TrendingUp } from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15
        }
    }
};

const candidateItem = {
    hidden: { opacity: 0, x: 20 },
    show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const CandidateMatchingFeature = () => {
    const candidates = [
        { id: '01', name: 'John Doe', skills: 'Python • Django • REST', score: 94, top: true },
        { id: '02', name: 'Jane Smith', skills: 'Python • React • SQL', score: 89, top: false },
        { id: '03', name: 'Alex Patel', skills: 'Django • MySQL', score: 84, top: false },
    ];

    return (
        <section className="py-16 sm:py-24 bg-white relative overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

                    {/* Left Content */}
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-100px" }}
                        className="max-w-xl"
                    >
                        <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 mb-6">
                            <Target size={24} />
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
                            Find the Right Candidate Faster
                        </h2>
                        <p className="text-lg text-slate-600 leading-relaxed mb-8">
                            AI compares candidate profiles with job requirements and ranks candidates based on their overall job fit. Stop guessing and start interviewing the best matches immediately.
                        </p>
                    </motion.div>

                    {/* Right Mock UI */}
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-100px" }}
                        className="relative"
                    >
                        {/* Decorative background element */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-slate-50 to-indigo-50/30 rounded-3xl transform rotate-3 scale-105 -z-10 border border-slate-100" />

                        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 flex flex-col gap-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Candidate Ranking</h3>
                                <TrendingUp size={16} className="text-slate-400" />
                            </div>

                            {candidates.map((c) => (
                                <motion.div
                                    key={c.id}
                                    variants={candidateItem}
                                    className={`relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 hover:-translate-y-1 ${c.top ? 'bg-slate-50 shadow-sm border border-slate-200' : 'bg-white border border-slate-100 hover:border-slate-200 hover:shadow-sm'}`}
                                >
                                    {c.top && (
                                        <div className="absolute -top-3 -right-2 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                                            <span>⭐ Top Match</span>
                                        </div>
                                    )}

                                    <div className={`font-mono text-lg font-bold ${c.top ? 'text-indigo-600' : 'text-slate-400'}`}>
                                        {c.id}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-base font-bold text-slate-900 truncate">{c.name}</h4>
                                        <p className="text-xs sm:text-sm text-slate-500 truncate">{c.skills}</p>
                                    </div>

                                    <div className="text-right">
                                        <div className={`text-xl sm:text-2xl font-black ${c.top ? 'text-indigo-600' : 'text-slate-700'}`}>
                                            {c.score}%
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

export default CandidateMatchingFeature;
