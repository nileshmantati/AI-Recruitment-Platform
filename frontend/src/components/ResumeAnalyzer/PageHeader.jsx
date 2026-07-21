import { T } from '../../Js/theme';
import { glass } from './resumeStyles';

/** Full-page header with icon badge, title, and subtitle */
export default function PageHeader() {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl" style={{ background: `${T.primary}22` }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.primary} strokeWidth="2.2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </span>
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: T.primary }}>AI Resume Analyzer</span>
      </div>
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight" style={{ color: T.onSurface }}>
        Analyze Your Resume
      </h1>
      <p className="text-sm sm:text-base" style={{ color: T.onSurfaceVariant }}>
        Upload your resume — our AI extracts skills, scores relevancy, and finds gaps in seconds.
      </p>
    </div>
  );
}

/** Inline error banner with "Try again" button */
export function ErrorBanner({ error, onReset }) {
  return (
    <div className="rounded-2xl px-4 py-4 flex items-start gap-3"
      style={{ background: `${T.error}12`, border: `1px solid ${T.error}44`, color: T.error }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm">Analysis Error</p>
        <p className="text-xs mt-0.5 opacity-80 wrap-break-word">{error}</p>
        <button className="mt-2 text-xs font-semibold underline" onClick={onReset}>Try again</button>
      </div>
    </div>
  );
}

/** Dual-ring spinner shown while AI is working */
export function AnalyzingSpinner({ fileName }) {
  return (
    <div className="flex flex-col items-center gap-6 py-20 rounded-3xl" style={glass}>
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full animate-spin"
          style={{ border: `3px solid ${T.outlineVariant}`, borderTopColor: T.primary }} />
        <div className="absolute inset-2 rounded-full animate-spin"
          style={{ border: `3px solid ${T.outlineVariant}`, borderTopColor: T.secondary, animationDirection: 'reverse', animationDuration: '1.4s' }} />
      </div>
      <div className="text-center space-y-1">
        <p className="text-lg font-bold" style={{ color: T.onSurface }}>AI is reading your resume…</p>
        <p className="text-sm" style={{ color: T.onSurfaceVariant }}>Extracting skills · scoring relevancy · finding gaps</p>
      </div>
      {fileName && (
        <span className="text-xs px-3 py-1.5 rounded-full font-medium" style={{ background: `${T.primary}14`, color: T.primary }}>
          {fileName}
        </span>
      )}
    </div>
  );
}
