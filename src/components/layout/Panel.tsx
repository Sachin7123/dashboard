import type { ReactNode } from "react";

export function Panel({
  eyebrow,
  title,
  action,
  children,
  sticky = false,
  className = "",
  contentClassName = "",
}: {
  eyebrow: string;
  title: string;
  action?: ReactNode;
  children: ReactNode;
  sticky?: boolean;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <section
      className={`glass-panel min-h-0 flex flex-col overflow-hidden ${className}`}
    >
      <header
        className={`border-b border-white/6 bg-[linear-gradient(180deg,rgba(18,20,26,0.92),rgba(18,20,26,0.72))] px-4 py-3.5 backdrop-blur ${sticky ? "sticky top-0 z-10" : ""}`}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-text-muted">
              {eyebrow}
            </p>
            <h3 className="mt-1 text-[15px] font-semibold leading-5">{title}</h3>
          </div>
          {action}
        </div>
      </header>
      <div className={`min-h-0 flex-1 ${contentClassName}`}>{children}</div>
    </section>
  );
}
