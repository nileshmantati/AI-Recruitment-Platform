import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Badge from '../../ui/Badge';
import PrimaryButton from '../PrimaryButton';
import { T } from '../../Js/theme';

const FeaturesHero = () => {
    return (
        <section className="relative overflow-hidden bg-slate-50 pt-24 pb-16 sm:pt-32 sm:pb-24 lg:pb-32">
            {/* Background subtle glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                    className="w-[800px] h-[600px] rounded-full opacity-20 blur-[100px]"
                    style={{
                        background: `radial-gradient(circle, ${T.primary} 0%, transparent 70%)`
                    }}
                />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="flex flex-col items-center"
                >
                    <Badge>✦ POWERFUL AI RECRUITMENT</Badge>

                    <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-[72px] leading-tight max-w-4xl">
                        Powerful Features.<br />
                        <span
                            className="text-transparent bg-clip-text"
                            style={{ backgroundImage: `linear-gradient(135deg, ${T.primary}, ${T.accent})` }}
                        >
                            Smarter Hiring.
                        </span>
                    </h1>

                    <p className="mt-6 max-w-2xl text-lg text-slate-600 sm:text-xl leading-relaxed">
                        Everything you need to discover, evaluate, and manage the right candidates — powered by intelligent AI.
                    </p>

                    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <PrimaryButton
                            className="w-full sm:w-auto rounded-full px-8 py-3.5 text-base font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                        >
                            Get Started
                        </PrimaryButton>
                        <a
                            href="#features"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-base font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                        >
                            Explore Features <ArrowRight size={18} />
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default FeaturesHero;
