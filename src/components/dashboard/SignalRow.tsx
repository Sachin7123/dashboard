export function SignalRow({
  label,
  value,
  valueClass = '',
}: {
  label: string;
  value: string | number | null;
  valueClass?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/6 py-2.5 last:border-b-0">
      <span className="min-w-0 flex-1 text-[11px] uppercase tracking-[0.32em] text-text-muted">
        {label}
      </span>
      <span className={`min-w-0 max-w-[60%] break-words text-right text-sm text-white ${valueClass}`}>
        {value ?? 'n/a'}
      </span>
    </div>
  );
}
