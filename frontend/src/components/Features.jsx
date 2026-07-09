import React from 'react'
import { T } from '../Js/theme.js'
import { Sparkles, Target, Calendar, BarChart3, Users, Zap } from 'lucide-react'
import Badge from '../ui/Badge.jsx'

const FeatureCard = ({ f }) => {
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
            className={`group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-indigo-50/30 p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] hover:shadow-[0_8px_30px_rgba(6,81,237,0.12)] hover:border-indigo-200/60 transition-all duration-300 ${f.big ? "sm:col-span-2 lg:col-span-1" : ""}`}
        >
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-indigo-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative z-10 mb-4 flex h-14 w-14 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg" style={{ background: `linear-gradient(135deg, ${T.primary}22, ${T.accent}22)`, color: T.primary }}>
                <f.icon size={26} />
            </div>
            <div className="relative z-10 flex flex-col items-start justify-start">
                <h3 className="mb-2 text-xl! font-bold! text-slate-900 group-hover:text-indigo-600 transition-colors">{f.title}</h3>
                <p className="text-sm! text-start text-slate-600 leading-relaxed">{f.desc}</p>
            </div>
        </div>
    );
};

const Features = () => {
    const items = [
        { icon: Sparkles, title: "AI Resume Intelligence", desc: "Parse and score resumes instantly against role requirements.", big: true },
        { icon: Target, title: "Candidate Ranking", desc: "Auto-rank applicants by fit, skills, and experience." },
        { icon: Calendar, title: "Interview Automation", desc: "Schedule, generate AI questions, and summarize calls." },
        { icon: BarChart3, title: "Hiring Analytics", desc: "Funnel, velocity, and department insights in real time." },
        { icon: Users, title: "Collaborative Pipelines", desc: "Kanban tracking from applied to offer, together." },
        { icon: Zap, title: "Smart Matching", desc: "Match rate scoring powered by role-specific embeddings." },
    ];
    return (
        <section className="mx-auto max-w-7xl px-6 py-5!">
            <div className="mx-auto mb-16 max-w-2xl text-center">
                <Badge>Features</Badge>
                <h2 className="mt-4 text-4xl! font-extrabold! text-slate-900">Everything a modern hiring team needs</h2>
                <p className="mt-4 text-slate-600">One workspace for sourcing, screening, and closing—powered by AI at every step.</p>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((f) => (
                    <FeatureCard key={f.title} f={f} />
                ))}
            </div>
        </section>
    )
}

export default Features