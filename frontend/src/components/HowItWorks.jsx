import React from 'react'
import Badge from '../ui/Badge.jsx'
import { T } from '../Js/theme.js'

const StepCard = ({ s }) => {
    const cardRef = React.useRef(null);
    const [style, setStyle] = React.useState({});

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -12;
        const rotateY = ((x - centerX) / centerX) * 12;

        setStyle({
            transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
            transition: 'transform 0.1s ease-out'
        });
    };

    const handleMouseLeave = () => {
        setStyle({
            transform: `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
            transition: 'transform 0.5s ease-out'
        });
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={style}
            className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-gradient-to-br from-indigo-50/60 via-white to-cyan-50/60 p-6 sm:p-7 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] hover:shadow-[0_8px_30px_rgba(6,81,237,0.12)] hover:border-indigo-200/60 transition-all duration-300 flex flex-col items-start justify-start"
        >
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-indigo-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative z-10 mb-4 sm:mb-6 text-3xl sm:text-4xl font-extrabold transition-transform duration-300 group-hover:scale-110 group-hover:translate-x-1" style={{ color: `${T.primary}30` }}>{s.n}</div>
            <h3 className="relative z-10 mb-2 text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{s.title}</h3>
            <p className="relative z-10 text-sm text-start text-slate-600">{s.desc}</p>
        </div>
    );
};

const HowItWorks = () => {
    const steps = [
        { n: "01", title: "Post your job", desc: "Publish a role with AI-suggested requirements and salary bands." },
        { n: "02", title: "AI screens candidates", desc: "Resumes are parsed, scored, and ranked automatically." },
        { n: "03", title: "Interview top matches", desc: "Auto-schedule interviews with AI-generated question sets." },
        { n: "04", title: "Hire with confidence", desc: "Track offers and onboarding from one dashboard." },
    ];
    return (
        <section className="py-12 sm:py-16 md:py-20 lg:py-28" style={{ background: T.bg }}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="mx-auto mb-10 sm:mb-16 max-w-2xl text-center">
                    <Badge color={T.secondary}>How it works</Badge>
                    <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">Hire in four simple steps</h2>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
                    {steps.map((s) => (
                        <StepCard key={s.n} s={s} />
                    ))}
                </div>
            </div>
        </section>
    )
}

export default HowItWorks