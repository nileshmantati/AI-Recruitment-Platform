import { useState, useRef, useCallback } from 'react';
import { T } from '../Js/theme';
import { glassStyle, aiBorderGlow, ScoreRing, InsightBar, SkillPill } from '../ui/ResumeAnalyzerExternal';
import PrimaryButton from '../components/PrimaryButton';



const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [done, setDone] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const prevent = useCallback((e) => { e.preventDefault(); e.stopPropagation(); }, []);

  const handleFile = (f) => {
    setFile(f);
    setAnalyzing(true);
    setDone(false);
    setTimeout(() => { setAnalyzing(false); setDone(true); }, 2400);
  };

  return (
    <section className="min-h-screen pb-32" style={{ background: `linear-gradient(135deg, ${T.surface} 0%, #eef2ff 50%, ${T.surface} 100%)`, color: T.onSurface, fontFamily: "'Hanken Grotesk', sans-serif" }}>

      {/* ── Floating atmosphere (from Stitch) ── */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px]" style={{ background: `${T.primary}1a` }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[100px]" style={{ background: `${T.secondary}1a` }} />
      </div>

      {/* ── Main content ── */}
      <main className="pt-8 px-4 space-y-6 max-w-5xl mx-auto">

        {/* Header */}
        <div className="space-y-1 px-2">
          <h1 className="text-3xl lg:text-4xl font-bold" style={{ color: T.onSurface, letterSpacing: '-0.01em' }}>
            Resume Analyzer
          </h1>
          <p className="text-sm" style={{ color: T.onSurfaceVariant }}>
            Analyze and optimize your profile for Senior Product roles.
          </p>
        </div>

        {/* ── Upload card (Stitch Bento) ── */}
        {!done && !analyzing && (
          <div
            className={`rounded-3xl p-8 text-center space-y-4 border-2 border-dashed! relative overflow-hidden group transition-transform ${dragOver ? 'scale-[1.02]' : ''}`}
            style={{ ...glassStyle, borderColor: dragOver ? T.primary : `${T.primary}66` }}
            onDragOver={(e) => { prevent(e); setDragOver(true); }}
            onDragEnter={(e) => { prevent(e); setDragOver(true); }}
            onDragLeave={(e) => { prevent(e); setDragOver(false); }}
            onDrop={(e) => { prevent(e); setDragOver(false); if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]); }}
            onClick={() => inputRef.current?.click()}
          >
            {/* hover gradient overlay */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: `linear-gradient(to bottom right, ${T.primary}1a, ${T.secondary}1a)` }} />

            <input ref={inputRef} type="file" accept=".pdf,.docx,.txt" className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

            <div className="relative z-10 space-y-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
                style={{ background: `${T.primary}33` }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={T.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold" style={{ color: T.onSurface }}>Upload Resume</h3>
                <p className="text-xs font-semibold" style={{ color: T.onSurfaceVariant }}>PDF, DOCX up to 10MB</p>
              </div>
              <PrimaryButton
                className="px-8! py-2.5! rounded-full! font-semibold! text-sm! text-white transition-all! hover:text-black! text-decoration-none"
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
              >
                Select File
              </PrimaryButton>
            </div>
          </div>
        )}

        {/* ── Analyzing spinner ── */}
        {analyzing && (
          <div className="flex flex-col items-center gap-5 py-16">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full animate-spin" style={{ border: `3px solid ${T.outlineVariant}`, borderTopColor: T.primary }} />
              <div className="absolute inset-2 rounded-full animate-spin" style={{ border: `3px solid ${T.outlineVariant}`, borderTopColor: T.secondary, animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </div>
            <p className="text-lg font-bold" style={{ color: T.onSurface }}>AI is analyzing your resume…</p>
            <p className="text-sm" style={{ color: T.onSurfaceVariant }}>Extracting skills, scoring relevancy, and identifying gaps</p>
          </div>
        )}

        {/* ══════════════════ RESULTS (Stitch Bento Grid) ══════════════════ */}
        {done && (
          <>
            {/* File badge */}
            <div className="flex items-center gap-2 px-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                {file?.name ?? 'resume.pdf'} — Analysis Complete
              </div>
            </div>

            {/* ── Score + Match (2-col) ── */}
            <div className="grid grid-cols-2 gap-4">
              {/* AI Score */}
              <div className="rounded-3xl p-6 flex flex-col items-center justify-center space-y-3"
                style={aiBorderGlow}>
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: T.onSurfaceVariant }}>
                  AI SCORE
                </span>
                <ScoreRing score={85} size={80} />
              </div>

              {/* Match % */}
              <div className="rounded-3xl p-6 flex flex-col items-center justify-center space-y-1"
                style={glassStyle}>
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: T.onSurfaceVariant }}>
                  MATCH %
                </span>
                <div className="text-4xl font-bold" style={{ color: T.secondary }}>92%</div>
                <span className="text-xs text-center" style={{ color: T.onSurfaceVariant }}>Senior PM Role</span>
              </div>
            </div>

            {/* ── AI Insights ── */}
            <div className="rounded-3xl overflow-hidden" style={glassStyle}>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={T.primary} stroke="none">
                    <path d="M12 2l2.09 6.26L20.18 9l-5 3.64L16.82 19 12 15.77 7.18 19l1.64-6.36-5-3.64 6.09-.74z" />
                  </svg>
                  <h3 className="text-xl font-bold" style={{ color: T.onSurface }}>AI Insights</h3>
                </div>

                <InsightBar label="Experience Relevancy" pct={90} tag="Excellent" />

                <div className="space-y-3">
                  {/* Strength */}
                  <div className="flex items-start gap-3 p-4 rounded-2xl"
                    style={{ background: `${T.secondary}1a`, border: `1px solid ${T.secondary}33` }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.secondary} strokeWidth="2" className="shrink-0 mt-0.5">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <p className="text-sm leading-tight" style={{ color: T.onSurfaceVariant }}>
                      Strong data-driven decision making evidence in past roles.
                    </p>
                  </div>
                  {/* Weakness */}
                  <div className="flex items-start gap-3 p-4 rounded-2xl"
                    style={{ background: `${T.error}1a`, border: `1px solid ${T.error}33` }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.error} strokeWidth="2" className="shrink-0 mt-0.5">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <p className="text-sm leading-tight" style={{ color: T.onSurfaceVariant }}>
                      Needs more emphasis on cross-functional leadership metrics.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Resume Preview ── */}
            <div className="rounded-3xl p-6 space-y-4" style={glassStyle}>
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold" style={{ color: T.onSurface }}>Resume Preview</h3>
                <button className="text-xs font-bold" style={{ color: T.primary }}>Expand</button>
              </div>
              <div className="aspect-[3/4] rounded-2xl relative overflow-hidden"
                style={{ background: T.surfaceContainer, border: '1px solid rgba(0,0,0,0.08)' }}>
                <div className="absolute inset-0 p-4 space-y-3 opacity-40">
                  <div className="h-4 w-1/2 rounded" style={{ background: 'rgba(0,0,0,0.12)' }} />
                  <div className="h-2 w-1/3 rounded" style={{ background: 'rgba(0,0,0,0.07)' }} />
                  <div className="h-2 w-full rounded" style={{ background: 'rgba(0,0,0,0.07)' }} />
                  <div className="h-2 w-full rounded" style={{ background: 'rgba(0,0,0,0.07)' }} />
                  <div className="h-2 w-3/4 rounded" style={{ background: 'rgba(0,0,0,0.07)' }} />
                  <div className="pt-4 space-y-2">
                    <div className="h-3 w-1/4 rounded" style={{ background: 'rgba(0,0,0,0.12)' }} />
                    <div className="h-2 w-full rounded" style={{ background: 'rgba(0,0,0,0.07)' }} />
                    <div className="h-2 w-full rounded" style={{ background: 'rgba(0,0,0,0.07)' }} />
                  </div>
                </div>
                <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${T.surfaceContainer}, transparent)` }} />
              </div>
            </div>

            {/* ── Skills Gap ── */}
            <div className="rounded-3xl p-6 space-y-4" style={glassStyle}>
              <h3 className="text-xl font-bold" style={{ color: T.onSurface }}>Skills Gap</h3>
              <div className="flex flex-wrap gap-2">
                <SkillPill name="Product Strategy" owned />
                <SkillPill name="A/B Testing" owned />
                <SkillPill name="User Research" owned />
                <SkillPill name="SQL" owned={false} />
                <SkillPill name="Python" owned={false} />
              </div>
              <p className="text-sm italic font-medium opacity-80" style={{ color: T.onSurfaceVariant }}>
                "Acquiring SQL certification could boost match score by 8%."
              </p>
            </div>

            {/* ── AI Strategy (Stitch highlight card) ── */}
            <div className="rounded-3xl p-8 space-y-4 text-white"
              style={{ background: T.primary, boxShadow: `0 20px 50px -12px ${T.primary}80` }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="white" stroke="none">
                    <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">AI Strategy</h3>
              </div>
              <p className="text-base" style={{ color: 'rgba(255,255,255,0.9)' }}>
                Rewrite your "Experience" section using the STAR method. Focus on the impact of your user growth initiatives at Acme Corp.
              </p>
              <button className="w-full py-4 rounded-2xl font-bold text-sm transition-transform hover:scale-[1.02] active:scale-95"
                style={{ background: '#fff', color: T.primary, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                Apply AI Suggestions
              </button>
            </div>
          </>
        )}
        {/* ── Fixed bottom actions (Stitch footer) ── */}
        {done && (
          <footer className="flex justify-between">
            <div className="flex gap-4 max-w-5xl me-auto">
              <PrimaryButton className="py-2 px-4 rounded-2xl! font-bold text-sm text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity hover:scale-[1.02] active:scale-95">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download Report
              </PrimaryButton>
            </div>
            <div className="flex gap-4">
              <button className="px-3 rounded-2xl! font-bold text-sm gap-2 hover:opacity-90 transition-opacity hover:bg-black! hover:text-white!"
                style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)', color: T.onSurfaceVariant }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </button>
              <button className="px-3 rounded-2xl! font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity hover:bg-black! hover:text-white!"
                style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)', color: T.onSurfaceVariant }}
                onClick={() => { setFile(null); setDone(false); setAnalyzing(false); }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
              </button>
            </div>
          </footer>
        )
        }
      </main >
    </section >
  );
};

export default ResumeAnalyzer;
