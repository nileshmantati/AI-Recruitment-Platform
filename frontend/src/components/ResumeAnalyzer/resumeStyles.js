/* ─── Shared style tokens for the ResumeAnalyzer feature ─── */

export const glass = {
  background: 'rgba(255,255,255,0.72)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.6)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
};

export const glowBorder = (primary, secondary) => ({
  border: '1.5px solid transparent',
  backgroundImage: `linear-gradient(white,white),linear-gradient(135deg,${primary},${secondary})`,
  backgroundOrigin: 'border-box',
  backgroundClip: 'padding-box,border-box',
  boxShadow: `0 4px 24px ${primary}22`,
});
