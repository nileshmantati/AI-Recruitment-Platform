import { motion } from 'framer-motion';
import { LockKeyhole, Users, ShieldCheck } from 'lucide-react';

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

const SecurityReliabilityFeature = () => {
    return (
        <section className="py-16 bg-white relative">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    className="text-center mb-12"
                >
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                        Built for Secure Recruitment
                    </h2>
                </motion.div>

                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
                >
                    {[
                        { icon: LockKeyhole, title: "Secure Authentication", desc: "JWT-based authentication for protected access to sensitive data." },
                        { icon: Users, title: "Role-Based Access", desc: "Separate, secure experiences tailored for recruiters and candidates." },
                        { icon: ShieldCheck, title: "Protected Data", desc: "Keep all your recruitment records and personal information secure and organized." }
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            variants={fadeUp}
                            className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col items-center text-center hover:bg-slate-100 transition-colors"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm text-slate-700 mb-4">
                                <feature.icon size={20} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                            <p className="text-sm text-slate-600">{feature.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default SecurityReliabilityFeature;
