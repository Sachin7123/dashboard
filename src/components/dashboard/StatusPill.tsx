import { toneClass } from '../../lib/dashboard';

export function StatusPill({
  tone,
  label,
}: {
  tone: 'success' | 'live' | 'ai' | 'error' | 'muted';
  label: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.28em] ${toneClass(tone)}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${tone === 'success' ? 'bg-accent-success' : tone === 'live' ? 'bg-accent-live' : tone === 'ai' ? 'bg-accent-ai' : tone === 'error' ? 'bg-accent-error' : 'bg-white/30'}`} />
      {label}
    </span>
  );
}
