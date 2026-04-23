import type { ReactNode } from "react";
import { toneClass } from "../../lib/dashboard";

export function MetricCard({
  title,
  value,
  tone,
  hint,
  icon,
}: {
  title: string;
  value: string | number;
  tone: "success" | "live" | "ai" | "error";
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="glass-card rounded-[20px] px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-text-muted">
            {title}
          </div>
          <div className={`mt-3 text-2xl font-semibold ${toneClass(tone)}`}>
            {value}
          </div>
        </div>
        {icon ? (
          <div
            className={`rounded-2xl border border-white/8 bg-white/[0.04] p-2 ${toneClass(tone)}`}
          >
            {icon}
          </div>
        ) : null}
      </div>
      {hint ? <div className="mt-3 text-sm text-text-muted">{hint}</div> : null}
    </div>
  );
}
