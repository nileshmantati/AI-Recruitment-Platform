import { useState } from 'react';
import { T } from '../Js/theme';
import { ScoreRing, InsightBar, SkillPill } from '../ui/ResumeAnalyzerExternal';
import PrimaryButton from '../components/PrimaryButton';
import { analyzeResume } from '../services/api';
import UploadZone from '../components/ResumeAnalyzer/UploadZone';
import PageHeader, { AnalyzingSpinner } from '../components/ResumeAnalyzer/PageHeader';
import { glass, glowBorder } from '../components/ResumeAnalyzer/resumeStyles';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

/* ── sessionStorage key ── */
const SS_KEY = 'ra_last_result';

export default function ResumeAnalyzer() {
  // Seed from sessionStorage so a page refresh restores the last result
  const _saved = (() => { try { return JSON.parse(sessionStorage.getItem(SS_KEY) ?? 'null'); } catch { return null; } })();

  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [done, setDone] = useState(!!_saved);
  const [result, setResult] = useState(_saved?.result ?? null);
  const [savedFileName, setSavedFileName] = useState(_saved?.fileName ?? null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [txtContent, setTxtContent] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});



  const handleFile = async f => {
    setFile(f); setAnalyzing(true); setDone(false); setResult(null);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
    if (f.name.toLowerCase().endsWith('.txt')) {
      const r = new FileReader();
      r.onload = e => setTxtContent(e.target.result);
      r.readAsText(f);
    } else { setTxtContent(null); }
    try {
      const data = await analyzeResume(f);
      setResult(data); setDone(true);
      setSavedFileName(f.name);
      // persist so page refresh restores the results panel
      sessionStorage.setItem(SS_KEY, JSON.stringify({ result: data, fileName: f.name }));
    } catch (err) {
      toast.error(err?.error || err?.detail || (typeof err === 'string' ? err : 'Analysis failed. Please try again.'));
    } finally { setAnalyzing(false); }
  };

  const handleReset = () => {
    setFile(null); setDone(false); setAnalyzing(false);
    setResult(null); setSavedFileName(null); setPreviewUrl(null); setTxtContent(null);
    sessionStorage.removeItem(SS_KEY); // clear persisted result
  };

  const isPdf = file?.name?.toLowerCase().endsWith('.pdf');
  const relevTag = r => r >= 80 ? 'Excellent' : r >= 60 ? 'Good' : 'Needs Work';

  const handleDownloadReport = () => {
    if (!result) return;

    const owned = (result.owned_skills ?? []).map(s => `<li>${s}</li>`).join('');
    const missing = (result.missing_skills ?? []).map(s => `<li style="color:#ef4444">${s}</li>`).join('');
    const strengths = (result.strengths ?? []).map(s => `<li>✅ ${s}</li>`).join('');
    const weaknesses = (result.weaknesses ?? []).map(s => `<li>⚠️ ${s}</li>`).join('');
    const date = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>AI Resume Report — ${file?.name ?? 'Resume'}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',sans-serif;color:#1e1b4b;background:#fff;padding:40px 48px;max-width:860px;margin:auto}
    header{display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #e0e7ff;padding-bottom:20px;margin-bottom:28px}
    .logo{font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#6366f1}
    h1{font-size:26px;font-weight:900;color:#1e1b4b}
    .meta{font-size:12px;color:#6b7280;margin-top:4px}
    .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:28px}
    .card{background:#f5f3ff;border-radius:14px;padding:16px;text-align:center}
    .card .val{font-size:32px;font-weight:900;color:#6366f1}
    .card .lbl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#6b7280;margin-bottom:6px}
    .card .sub{font-size:11px;color:#6b7280;margin-top:4px}
    section{margin-bottom:24px}
    h2{font-size:15px;font-weight:700;color:#1e1b4b;margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid #e0e7ff}
    ul{padding-left:18px;line-height:2}
    li{font-size:13px;color:#374151}
    .bar-wrap{background:#e0e7ff;border-radius:99px;height:8px;margin:8px 0 16px;overflow:hidden}
    .bar{height:100%;border-radius:99px;background:linear-gradient(90deg,#6366f1,#8b5cf6)}
    .strategy{background:#6366f1;color:#fff;border-radius:14px;padding:20px 24px}
    .strategy p{font-size:13px;line-height:1.7;color:rgba(255,255,255,.9)}
    footer{margin-top:32px;text-align:center;font-size:11px;color:#9ca3af;border-top:1px solid #e0e7ff;padding-top:16px}
    @media print{body{padding:24px 32px}}
  </style>
</head>
<body>
  <header>
    <div>
      <div class="logo">AI Recruitment Platform</div>
      <h1>Resume Analysis Report</h1>
      <p class="meta">File: ${file?.name ?? 'N/A'} &nbsp;·&nbsp; Generated: ${date}</p>
    </div>
  </header>

  <div class="grid">
    <div class="card"><div class="lbl">AI Score</div><div class="val">${result.ai_score}</div><div class="sub">/100</div></div>
    <div class="card"><div class="lbl">Match %</div><div class="val">${result.match_percentage}%</div><div class="sub">${result.job_role ?? ''}</div></div>
    <div class="card"><div class="lbl">Experience</div><div class="val">${result.experience_relevancy}%</div><div class="sub">${relevTag(result.experience_relevancy)}</div></div>
    <div class="card"><div class="lbl">Skills Found</div><div class="val">${result.owned_skills?.length ?? 0}</div><div class="sub">${result.missing_skills?.length ?? 0} gaps</div></div>
  </div>

  <section>
    <h2>Experience Relevancy</h2>
    <div class="bar-wrap"><div class="bar" style="width:${result.experience_relevancy}%"></div></div>
  </section>

  <section>
    <h2>Strengths &amp; Weaknesses</h2>
    <ul>${strengths}${weaknesses}</ul>
  </section>

  <section>
    <h2>Skills Gap Analysis</h2>
    <p style="font-size:12px;color:#6b7280;margin-bottom:8px">✅ Owned &nbsp; 🔴 Missing</p>
    <ul>${owned}${missing}</ul>
  </section>

  <section>
    <h2>AI Strategy</h2>
    <div class="strategy"><p>${result.ai_strategy ?? ''}</p></div>
  </section>

  <footer>Generated by AI Recruitment Platform · ${date}</footer>
  <script>window.onload=()=>{window.print();}</script>
</body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    // revoke after the window has loaded so print can use the blob
    if (win) win.addEventListener('afterprint', () => URL.revokeObjectURL(url), { once: true });
  };

  return (
    <section
      className="min-h-screen"
      style={{ background: `linear-gradient(135deg, ${T.surface} 0%, #eef2ff 60%, ${T.surface} 100%)`, fontFamily: "'Hanken Grotesk',sans-serif", color: T.onSurface }}
    >
      {/* ambient blobs */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-[420px] h-[420px] rounded-full blur-[110px]" style={{ background: `${T.primary}18` }} />
        <div className="absolute -bottom-20 -left-20 w-[340px] h-[340px] rounded-full blur-[90px]" style={{ background: `${T.secondary}18` }} />
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── Page header ── */}
        <PageHeader />

        <AnimatePresence mode="wait">
          {/* ── Upload zone ── */}
          {!done && !analyzing && (
            <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4 }}>
              <UploadZone onFile={handleFile} />
            </motion.div>
          )}

          {/* ── Analyzing state ── */}
          {analyzing && (
            <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <AnalyzingSpinner fileName={file?.name ?? ''} />
            </motion.div>
          )}

          {/* ══════════ RESULTS ══════════ */}
          {done && result && (
            <motion.div key="results" className="space-y-5" initial={{ opacity: 0, scale: 0.98, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}>

              {/* success badge */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(16,185,129,0.14)', color: '#10B981', border: '1px solid rgba(16,185,129,0.28)' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  {(file?.name ?? savedFileName ?? 'resume.pdf')} — Analysis Complete
                </span>
                <button onClick={handleReset}
                  className="flex-1 sm:flex-none py-2 px-6 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-all duration-400"
                  style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0)', color: T.onSurfaceVariant }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  </svg>
                  New Analysis
                </button>
              </div>

              {/* ── TOP ROW: 4 stat cards ── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* AI Score */}
                <div className="rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center gap-2 hover:scale-105 transition-all duration-200" style={glowBorder(T.primary, T.secondary)}>
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T.onSurfaceVariant }}>AI Score</span>
                  <ScoreRing score={result.ai_score} size={72} />
                </div>
                {/* Match % */}
                <div className="rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center gap-1 hover:scale-105 transition-all duration-200" style={glass}>
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T.onSurfaceVariant }}>Match %</span>
                  <span className="text-3xl sm:text-4xl font-bold" style={{ color: T.secondary }}>{result.match_percentage}%</span>
                  <span className="text-[10px] text-center leading-tight" style={{ color: T.onSurfaceVariant }}>{result.job_role}</span>
                </div>
                {/* Experience */}
                <div className="rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center gap-1 hover:scale-105 transition-all duration-200" style={glass}>
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T.onSurfaceVariant }}>Experience</span>
                  <span className="text-3xl sm:text-4xl font-bold" style={{ color: T.primary }}>{result.experience_relevancy}%</span>
                  <span className="text-[10px]" style={{ color: T.onSurfaceVariant }}>{relevTag(result.experience_relevancy)}</span>
                </div>
                {/* Skills owned */}
                <div className="rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center gap-1 hover:scale-105 transition-all duration-200" style={glass}>
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T.onSurfaceVariant }}>Skills Found</span>
                  <span className="text-3xl sm:text-4xl font-bold" style={{ color: T.onSurface }}>{result.owned_skills?.length ?? 0}</span>
                  <span className="text-[10px]" style={{ color: T.onSurfaceVariant }}>{result.missing_skills?.length ?? 0} gaps</span>
                </div>
              </div>

              {/* ── MAIN 2-col layout (stack on mobile) ── */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                {/* LEFT column — 3/5 */}
                <div className="lg:col-span-3 space-y-5">

                  {/* AI Insights */}
                  <div className="rounded-2xl p-5 sm:p-6 space-y-4" style={glass}>
                    <div className="flex items-center gap-2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill={T.primary} stroke="none">
                        <path d="M12 2l2.09 6.26L20.18 9l-5 3.64L16.82 19 12 15.77 7.18 19l1.64-6.36-5-3.64 6.09-.74z" />
                      </svg>
                      <h2 className="text-base sm:text-lg font-bold" style={{ color: T.onSurface }}>AI Insights</h2>
                    </div>
                    <InsightBar label="Experience Relevancy" pct={result.experience_relevancy} tag={relevTag(result.experience_relevancy)} />

                    {/* Strengths */}
                    {result.strengths?.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: T.secondary }}>Strengths</p>
                        {result.strengths.slice(0, 2).map((s, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: `${T.secondary}14`, border: `1px solid ${T.secondary}2a` }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.secondary} strokeWidth="2" className="shrink-0 mt-0.5">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                            <p className="text-sm leading-snug" style={{ color: T.onSurfaceVariant }}>{s}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Weaknesses */}
                    {result.weaknesses?.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: T.error }}>Areas to Improve</p>
                        {result.weaknesses.slice(0, 2).map((w, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: `${T.error}0e`, border: `1px solid ${T.error}2a` }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.error} strokeWidth="2" className="shrink-0 mt-0.5">
                              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                            <p className="text-sm leading-snug" style={{ color: T.onSurfaceVariant }}>{w}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Skills Gap */}
                  <div className="rounded-2xl p-5 sm:p-6 space-y-4" style={glass}>
                    <h2 className="text-base sm:text-lg font-bold" style={{ color: T.onSurface }}>Skills Gap</h2>
                    <div className="flex flex-wrap gap-2">
                      {result.owned_skills?.map(s => <SkillPill key={s} name={s} owned />)}
                      {result.missing_skills?.map(s => <SkillPill key={s} name={s} owned={false} />)}
                    </div>
                    {result.missing_skills?.length > 0 && (
                      <p className="text-xs italic" style={{ color: T.onSurfaceVariant }}>
                        💡 Acquiring <strong>{result.missing_skills[0]}</strong> could significantly boost your score.
                      </p>
                    )}
                  </div>

                  {/* AI Strategy */}
                  <div className="rounded-2xl p-5 sm:p-6 space-y-4" style={{ background: T.primary, boxShadow: `0 16px 48px -8px ${T.primary}66` }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="white" stroke="none">
                          <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" />
                        </svg>
                      </div>
                      <h2 className="text-base sm:text-lg font-bold text-white">AI Strategy</h2>
                    </div>
                    <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.88)' }}>{result.ai_strategy}</p>
                    <button
                      onClick={() => { setCheckedItems({}); setShowSuggestions(true); }}
                      className="w-full py-3 sm:py-3.5 rounded-xl font-bold text-sm transition-transform hover:scale-[1.02] active:scale-95"
                      style={{ background: '#fff', color: T.primary, boxShadow: '0 8px 24px rgba(0,0,0,0.18)' }}
                    >
                      Apply AI Suggestions
                    </button>
                  </div>
                </div>

                {/* RIGHT column — 2/5 */}
                <div className="lg:col-span-2 space-y-5">

                  {/* Resume Preview */}
                  <div className="rounded-2xl p-5 space-y-3" style={glass}>
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-bold" style={{ color: T.onSurface }}>Resume Preview</h2>
                      {previewUrl && (
                        <a href={previewUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs font-semibold hover:opacity-70 transition-opacity" style={{ color: T.primary }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                          Open full
                        </a>
                      )}
                    </div>

                    {/* PDF iframe */}
                    {previewUrl && isPdf && (
                      <div className="rounded-xl overflow-hidden" style={{ height: '420px', border: '1px solid rgba(0,0,0,0.07)' }}>
                        <iframe src={previewUrl} title="Resume PDF Preview" className="w-full h-full" style={{ border: 'none', background: '#fff' }} />
                      </div>
                    )}

                    {/* TXT text */}
                    {txtContent && (
                      <div className="rounded-xl p-3 overflow-y-auto text-xs font-mono leading-relaxed whitespace-pre-wrap"
                        style={{ height: '420px', background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.07)', color: T.onSurfaceVariant }}>
                        {txtContent}
                      </div>
                    )}

                    {/* DOCX fallback */}
                    {previewUrl && !isPdf && !txtContent && (
                      <div className="rounded-xl flex flex-col items-center justify-center gap-4 py-12"
                        style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.07)' }}>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${T.primary}1a` }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={T.primary} strokeWidth="1.8">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                          </svg>
                        </div>
                        <div className="text-center px-3 space-y-1">
                          <p className="text-sm font-semibold break-all" style={{ color: T.onSurface }}>{file?.name}</p>
                          <p className="text-xs" style={{ color: T.onSurfaceVariant }}>DOCX can't be previewed in the browser.</p>
                        </div>
                        <a href={previewUrl} download={file?.name}
                          className="px-4 py-2 rounded-full text-xs font-bold transition-opacity hover:opacity-80"
                          style={{ background: `${T.primary}1a`, color: T.primary, border: `1px solid ${T.primary}33` }}>
                          Download to view
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <PrimaryButton
                      onClick={handleDownloadReport}
                      className="flex-1 py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Download Report
                    </PrimaryButton>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      {/* ══ AI Suggestions Modal ══ */}
      {showSuggestions && result && (() => {
        // Build action items from real AI data
        const actions = [
          // AI strategy as first item
          result.ai_strategy ? { id: 'strategy', label: result.ai_strategy, category: 'strategy' } : null,
          // One action per weakness
          ...(result.weaknesses ?? []).map((w, i) => ({ id: `w${i}`, label: `Fix: ${w}`, category: 'weakness' })),
          // One action per missing skill
          ...(result.missing_skills ?? []).map((s, i) => ({ id: `s${i}`, label: `Acquire skill: ${s}`, category: 'skill' })),
        ].filter(Boolean);

        const total = actions.length;
        const checked = Object.values(checkedItems).filter(Boolean).length;
        const pct = total ? Math.round((checked / total) * 100) : 0;

        const toggle = id => setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));

        const catColor = cat => cat === 'strategy' ? T.primary : cat === 'weakness' ? T.error : T.secondary;
        const catIcon = cat => {
          if (cat === 'strategy') return (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" />
            </svg>
          );
          if (cat === 'weakness') return (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          );
          return (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          );
        };

        return (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowSuggestions(false)}
          >
            <div
              className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden"
              style={{ background: '#fff', boxShadow: '0 24px 80px rgba(0,0,0,0.22)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${T.primary}1a` }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={T.primary} stroke="none">
                      <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold" style={{ color: T.onSurface }}>AI Action Plan</h3>
                    <p className="text-xs" style={{ color: T.onSurfaceVariant }}>{checked}/{total} tasks completed</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSuggestions(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-70 transition-opacity"
                  style={{ background: 'rgba(0,0,0,0.06)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.onSurfaceVariant} strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Progress bar */}
              <div className="px-6 py-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-semibold" style={{ color: T.onSurfaceVariant }}>Progress</span>
                  <span className="text-xs font-bold" style={{ color: T.primary }}>{pct}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.07)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${T.primary}, ${T.secondary})` }}
                  />
                </div>
              </div>

              {/* Action list */}
              <div className="overflow-y-auto flex-1 px-6 py-4 space-y-2.5">
                {actions.map(item => (
                  <button
                    key={item.id}
                    onClick={() => toggle(item.id)}
                    className="w-full flex items-start gap-3 p-3.5 rounded-2xl text-left transition-all duration-200"
                    style={{
                      background: checkedItems[item.id] ? `${catColor(item.category)}10` : 'rgba(0,0,0,0.025)',
                      border: `1.5px solid ${checkedItems[item.id] ? catColor(item.category) + '40' : 'rgba(0,0,0,0.07)'}`,
                    }}
                  >
                    {/* Checkbox */}
                    <div
                      className="shrink-0 w-5 h-5 rounded-md flex items-center justify-center mt-0.5 transition-all duration-200"
                      style={{
                        background: checkedItems[item.id] ? catColor(item.category) : 'transparent',
                        border: `2px solid ${checkedItems[item.id] ? catColor(item.category) : 'rgba(0,0,0,0.2)'}`,
                      }}
                    >
                      {checkedItems[item.id] && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>

                    {/* Category badge + text */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span style={{ color: catColor(item.category) }}>{catIcon(item.category)}</span>
                        <span
                          className="text-[10px] font-bold uppercase tracking-wider"
                          style={{ color: catColor(item.category) }}
                        >
                          {item.category === 'strategy' ? 'Strategy' : item.category === 'weakness' ? 'Improvement' : 'Skill Gap'}
                        </span>
                      </div>
                      <p
                        className="text-sm leading-snug"
                        style={{
                          color: checkedItems[item.id] ? T.onSurfaceVariant : T.onSurface,
                          textDecoration: checkedItems[item.id] ? 'line-through' : 'none',
                          opacity: checkedItems[item.id] ? 0.6 : 1,
                        }}
                      >
                        {item.label}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 flex gap-3" style={{ borderTop: '1px solid rgba(0,0,0,0.07)' }}>
                {pct === 100 ? (
                  /* ── Celebration overlay ── */
                  <div className="flex-1 relative rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-3 py-5"
                    style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.12),rgba(99,102,241,0.1))' }}>

                    {/* CSS confetti pieces */}
                    <style>{`
                      @keyframes confetti-fall {
                        0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1; }
                        100% { transform: translateY(90px)  rotate(720deg);  opacity: 0; }
                      }
                      .conf { position:absolute; width:8px; height:8px; border-radius:2px; animation: confetti-fall 1.4s ease-in forwards; }
                    `}</style>
                    {[['#6366f1', '10%', '0s'], ['#10B981', '25%', '.15s'], ['#f59e0b', '45%', '.05s'], ['#ef4444', '65%', '.25s'], ['#8b5cf6', '80%', '.1s'], ['#06b6d4', '55%', '.3s']].map(([c, l, d], i) => (
                      <div key={i} className="conf" style={{ background: c, left: l, animationDelay: d }} />
                    ))}

                    {/* Animated checkmark circle */}
                    <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.18)', border: '2px solid rgba(16,185,129,0.4)' }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>

                    <div className="text-center space-y-0.5">
                      <p className="text-sm font-bold" style={{ color: '#10B981' }}>🎉 All suggestions applied!</p>
                      <p className="text-xs" style={{ color: '#6b7280' }}>Closing automatically…</p>
                    </div>

                    {/* Countdown ring */}
                    <svg width="28" height="28" viewBox="0 0 28 28">
                      <circle cx="14" cy="14" r="12" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="2" />
                      <circle cx="14" cy="14" r="12" fill="none" stroke="#10B981" strokeWidth="2"
                        strokeDasharray="75.4" strokeDashoffset="0"
                        strokeLinecap="round" transform="rotate(-90 14 14)"
                        style={{ animation: 'stroke-drain 2.5s linear forwards' }} />
                      <style>{`
                        @keyframes stroke-drain {
                          from { stroke-dashoffset: 0; }
                          to   { stroke-dashoffset: 75.4; }
                        }
                      `}</style>
                    </svg>
                  </div>
                ) : (
                  <>
                    <button onClick={() => {
                      const all = {};
                      actions.forEach(a => { all[a.id] = true; });
                      setCheckedItems(all);
                      setTimeout(() => setShowSuggestions(false), 2600);
                    }}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90 hover:cursor-pointer "
                      style={{ background: `${T.primary}14`, color: T.primary }}
                    >
                      Mark all done
                    </button>
                    <button onClick={() => setCheckedItems({})}
                      className="flex-1 sm:flex-none py-2.5 px-6 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-all duration-400"
                      style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0)', color: T.onSurfaceVariant }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                      </svg>
                      Reset
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </section>
  );
}
