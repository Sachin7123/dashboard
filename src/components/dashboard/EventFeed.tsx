import { AnimatePresence, motion } from "framer-motion";
import type { ReMorphEvent } from "../../types/remorph";
import { formatClock, labelForType, shortUrl } from "../../lib/dashboard";
import { Panel } from "../layout/Panel";

export function EventFeed({
  events,
  selectedEventId,
  onSelect,
  title,
}: {
  events: ReMorphEvent[];
  selectedEventId: string | null;
  onSelect: (id: string) => void;
  title: string;
}) {
  return (
    <Panel
      eyebrow="Active Event Feed"
      title={title}
      sticky
      contentClassName="min-h-0 overflow-y-auto custom-scrollbar px-3 py-3 xl:max-h-[36rem]"
      action={
        <div className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-xs font-mono text-text-muted">
          {events.length} visible
        </div>
      }
    >
      <AnimatePresence initial={false}>
        {!events.length ? (
          <div className="flex min-h-[14rem] items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] text-sm text-text-muted">
            No recovery episodes match the current filter.
          </div>
        ) : null}
        {events.map((event, index) => (
          <motion.button
            key={`${event.id}-${event.timestamp}`}
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, delay: index * 0.012 }}
            onClick={() => onSelect(event.id)}
            className={`glass-card mb-3 w-full p-4 text-left ${selectedEventId === event.id ? "glass-card-active" : ""}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <MethodBadge method={event.method} />
                  <StatusDot status={event.status} />
                  <span className="text-[11px] uppercase tracking-[0.25em] text-text-muted">
                    {labelForType(event.type)}
                  </span>
                </div>
                <p className="mt-3 truncate font-mono text-sm text-white">
                  {shortUrl(event.target_url)}
                </p>
                <p className="mt-1 text-sm text-text-muted">{event.message}</p>
              </div>

              <div className="text-right text-xs font-mono text-text-muted">
                <div>{formatClock(event.timestamp)}</div>
                <div className="mt-2 text-[11px] uppercase tracking-[0.25em] text-text-muted/70">
                  {event.processing_ms}ms
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <ScoreBar
                value={event.confidence}
                tone={event.status === "healed" ? "success" : "error"}
              />
              <span className="w-14 text-right text-xs font-mono text-text-muted">
                {Math.round(event.confidence * 100)}%
              </span>
            </div>
          </motion.button>
        ))}
      </AnimatePresence>
    </Panel>
  );
}

function MethodBadge({ method }: { method: string }) {
  const palette =
    method === "GET"
      ? "bg-accent-live/10 text-accent-live border-accent-live/20"
      : method === "POST"
        ? "bg-accent-success/10 text-accent-success border-accent-success/20"
        : method === "PATCH" || method === "PUT"
          ? "bg-accent-ai/10 text-accent-ai border-accent-ai/20"
          : "bg-accent-error/10 text-accent-error border-accent-error/20";

  return (
    <span
      className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.25em] ${palette}`}
    >
      {method}
    </span>
  );
}

function ScoreBar({
  value,
  tone,
}: {
  value: number;
  tone: "success" | "error";
}) {
  return (
    <div className="h-2 flex-1 rounded-full bg-white/[0.06]">
      <div
        className={`h-full rounded-full ${tone === "success" ? "bg-gradient-to-r from-accent-live to-accent-success" : "bg-gradient-to-r from-accent-pending to-accent-error"}`}
        style={{ width: `${Math.max(8, Math.round(value * 100))}%` }}
      />
    </div>
  );
}

function StatusDot({ status }: { status: ReMorphEvent["status"] }) {
  const className =
    status === "healed"
      ? "bg-accent-success"
      : status === "pending"
        ? "bg-accent-pending"
        : "bg-accent-error";
  return <span className={`h-2.5 w-2.5 rounded-full ${className}`} />;
}
