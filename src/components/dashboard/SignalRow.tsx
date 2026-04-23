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
    <div className="flex items-center justify-between gap-4 border-b border-white/6 py-2.5 last:border-b-0">
      <span className="text-[11px] uppercase tracking-[0.32em] text-text-muted">{label}</span>
      <span className={`text-right text-sm text-white ${valueClass}`}>{value ?? 'n/a'}</span>
    </div>
  );
}
