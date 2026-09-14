import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import PrimaryButton from '../PrimaryButton';
import { T } from '../../Js/theme';
import { useNavigate } from 'react-router-dom';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const FeaturesCTA = () => {
    const navigate = useNavigate();

    return (
        <section className="py-20 sm:py-32 relative overflow-hidden">
            {/* Subtle Gradient Background */}
            <div className="absolute inset-0 bg-slate-50" />
            <div
                className="absolute inset-0 opacity-10"
                style={{
                    background: `radial-gradient(ellipse at center, ${T.primary} 0%, transparent 70%)`
                }}
            />

            <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center z-10">
                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
                        Ready to Hire Smarter?
                    </h2>
                    <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
                        Let AI help you find and evaluate better candidates faster. Start streamlining your recruitment workflow today.
                    </p>

                    <PrimaryButton
                        onClick={() => navigate('/register')}
                        className="rounded-full px-8 py-4 text-lg font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all inline-flex items-center gap-2"
                    >
                        Get Started <ArrowRight size={20} />
                    </PrimaryButton>
                </motion.div>
            </div>
        </section>
    );
};

export default FeaturesCTA;
