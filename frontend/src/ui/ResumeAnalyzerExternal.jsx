/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect } from 'react';
import { T } from '../Js/theme';

/* ─── Light glass-card CSS ─── */
export const glassStyle = {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.06)',
};

/* ─── Light ai-border-glow CSS ─── */
export const aiBorderGlow = {
    border: '1px solid transparent',
    backgroundImage: `linear-gradient(#ffffff, #ffffff), linear-gradient(to right, ${T.primary}, ${T.secondary})`,
    backgroundOrigin: 'border-box',
    backgroundClip: 'padding-box, border-box',
    boxShadow: '0 4px 20px rgba(79, 70, 229, 0.12)',
};

/* ─── Animated circular score (matches Stitch SVG) ─── */
export const ScoreRing = ({ score, size = 80 }) => {
    const [val, setVal] = useState(0);
    const r = 34, circ = 2 * Math.PI * r;

    useEffect(() => {
        let raf;
        const t0 = performance.now();
        const animate = (now) => {
            const p = Math.min((now - t0) / 1200, 1);
            setVal(Math.round(p * score));
            if (p < 1) raf = requestAnimationFrame(animate);
        };
        raf = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(raf);
    }, [score]);

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r={r} fill="transparent" stroke="rgba(0,0,0,0.08)" strokeWidth={6} />
                <circle cx="40" cy="40" r={r} fill="transparent" stroke={T.primary} strokeWidth={6}
                    strokeLinecap="round" strokeDasharray={circ}
                    strokeDashoffset={circ - (val / 100) * circ}
                    style={{ transition: 'stroke-dashoffset 0.08s linear' }} />
            </svg>
            <span className="absolute text-2xl font-bold" style={{ color: T.onSurface, fontFamily: "'Hanken Grotesk', sans-serif" }}>
                {val}
            </span>
        </div>
    );
};

/* ─── Progress bar with gradient fill ─── */
export const InsightBar = ({ label, pct, tag }) => (
    <div className="space-y-2">
        <div className="flex justify-between items-center">
            <span className="text-sm font-semibold" style={{ color: T.onSurface }}>{label}</span>
            <span className="text-xs" style={{ color: T.secondary }}>{tag}</span>
        </div>
        <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(to right, ${T.primary}, ${T.secondary})` }} />
        </div>
    </div>
);

/* ─── Skill pill (matches Stitch) ─── */
export const SkillPill = ({ name, owned = true }) => (
    <span
        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold"
        style={owned
            ? { background: `${T.primary}33`, color: T.onPrimaryContainer, border: `1px solid ${T.primary}4d` }
            : { background: 'rgba(0,0,0,0.04)', color: T.onSurfaceVariant, border: '1px solid rgba(0,0,0,0.08)' }
        }
    >
        {name}
        {!owned && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
        )}
    </span>
);