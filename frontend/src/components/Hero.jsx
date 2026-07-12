import PrimaryButton from './PrimaryButton'
import { ArrowRight, Sparkles, BrainCircuit, FileText, CheckCircle, Zap } from 'lucide-react';
import { T } from '../Js/theme.js';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
    const navigate = useNavigate();

    return (
        <section className="relative overflow-hidden py-25" style={{ background: `radial-gradient(1200px 600px at 50% -10%, ${T.primary}14, transparent), radial-gradient(800px 500px at 90% 10%, ${T.secondary}14, transparent)` }}>
            <div className="absolute top-20 left-[15%] hidden md:flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-xl animate-float border border-slate-100" style={{ color: T.primary }}>
                <FileText size={32} />
            </div>
            <div className="absolute top-40 right-[15%] hidden md:flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg animate-float-delayed border border-slate-100" style={{ color: T.accent }}>
                <BrainCircuit size={28} />
            </div>
            <div className="absolute bottom-20 left-[20%] hidden md:flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-md animate-float-delayed border border-slate-100" style={{ color: T.success }}>
                <CheckCircle size={24} />
            </div>
            <div className="absolute bottom-32 right-[20%] hidden md:flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-xl animate-float border border-slate-100" style={{ color: T.warning }}>
                <Zap size={32} />
            </div>

            <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3 py-2 text-sm font-medium shadow-sm" style={{ color: T.primary }}>
                    <Sparkles size={14} /> AI-Powered Recruitment
                </div>
                <h1 className="text-5xl font-extrabold! tracking-tight text-slate-900 sm:text-6xl! lg:text-7xl!">
                    Find the Perfect<br />
                    <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${T.primary}, ${T.accent}, ${T.secondary})` }}>
                        Candidate with AI
                    </span>
                </h1>
                <p className="mx-auto mt-8! max-w-3xl text-lg! sm:text-2xl leading-relaxed text-slate-600">
                    AI-powered recruitment platform that helps recruiters hire faster using resume intelligence, candidate ranking, and smart interview automation.
                </p>
                <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
                    <PrimaryButton className="px-5! py-3! text-base! rounded-xl!" onClick={() => navigate("/login")}>
                        Find Jobs <ArrowRight size={18} />
                    </PrimaryButton>
                </div>
            </div>
        </section>
    )
}

export default Hero