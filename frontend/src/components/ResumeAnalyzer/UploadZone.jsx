import { useRef, useCallback, useState } from 'react';
import { T } from '../../Js/theme';
import { glass } from './resumeStyles';
import PrimaryButton from '../PrimaryButton';

export default function UploadZone({ onFile }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const prevent = useCallback(e => { e.preventDefault(); e.stopPropagation(); }, []);

  const handleDrop = e => {
    prevent(e);
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onFile(f);
  };

  return (
    <div
      className={`rounded-3xl p-5 sm:p-12 text-center border-2 border-dashed relative overflow-hidden cursor-pointer transition-all duration-200 ${dragOver ? 'scale-[1.01]' : ''}`}
      style={{ ...glass, borderColor: dragOver ? T.primary : `${T.primary}55` }}
      onDragOver={e => { prevent(e); setDragOver(true); }}
      onDragEnter={e => { prevent(e); setDragOver(true); }}
      onDragLeave={e => { prevent(e); setDragOver(false); }}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      {/* hover gradient */}
      <div className={`absolute inset-0 transition-opacity duration-300 ${dragOver ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: `linear-gradient(135deg,${T.primary}0d,${T.secondary}0d)` }} />

      <input ref={inputRef} type="file" accept=".pdf,.docx,.txt" className="hidden"
        onChange={e => e.target.files?.[0] && onFile(e.target.files[0])} />

      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: `${T.primary}22` }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={T.primary} strokeWidth="1.8" strokeLinecap="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <div className="space-y-1.5">
          <h3 className="text-xl sm:text-2xl font-bold" style={{ color: T.onSurface }}>Drop your resume here</h3>
          <p className="text-sm" style={{ color: T.onSurfaceVariant }}>or click to browse — PDF, DOCX, TXT · up to 10 MB</p>
        </div>
        <PrimaryButton
          onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}
          className="px-8 py-3 rounded-full font-semibold text-sm text-white transition-all"
        >
          Select File
        </PrimaryButton>
      </div>
    </div>
  );
}
