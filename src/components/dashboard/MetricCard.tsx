export function MetricCard({
  title,
  value,
  tone,
}: {
  title: string;
  value: string | number;
  tone: 'success' | 'live' | 'ai' | 'error';
}) {
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="text-[11px] uppercase tracking-[0.3em] text-text-muted">{title}</div>
      <div
        className={`mt-3 text-2xl font-semibold ${
          tone === 'success'
            ? 'text-accent-success'
            : tone === 'live'
              ? 'text-accent-live'
              : tone === 'ai'
                ? 'text-accent-ai'
                : 'text-accent-error'
        }`}
      >
        {value}
      </div>
    </div>
  );
}
