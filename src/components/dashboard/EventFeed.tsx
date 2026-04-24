import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { ReMorphEvent } from "../../types/remorph";
import { formatClock, labelForType, shortUrl } from "../../lib/dashboard";
import { Panel } from "../layout/Panel";
import { Pagination } from "../app/Pagination";

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
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"latest" | "confidence">("latest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filteredEvents = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const next = events.filter((event) =>
      !normalized
        ? true
        : `${event.target_url} ${event.message} ${event.method}`.toLowerCase().includes(normalized),
    );

    return next.sort((a, b) =>
      sort === "confidence"
        ? b.confidence - a.confidence
        : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }, [events, query, sort]);

  const pageCount = Math.max(1, Math.ceil(filteredEvents.length / pageSize));
  const pagedEvents = filteredEvents.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Panel
      eyebrow="Active Event Feed"
      title={title}
      sticky
      contentClassName="min-h-0 overflow-y-auto custom-scrollbar px-3 py-3 xl:max-h-[42rem]"
      action={
        <div className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-xs font-mono text-text-muted">
          {filteredEvents.length} visible
        </div>
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(event) => {
            setPage(1);
            setQuery(event.target.value);
          }}
          placeholder="Search events"
          className="min-w-[180px] flex-1 rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-white outline-none"
        />
        <select
          value={sort}
          onChange={(event) => {
            setPage(1);
            setSort(event.target.value as "latest" | "confidence");
          }}
          className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-white outline-none"
        >
          <option value="latest">Latest</option>
          <option value="confidence">Confidence</option>
        </select>
      </div>

      <AnimatePresence initial={false}>
        {!filteredEvents.length ? (
          <div className="flex min-h-[14rem] items-center justify-center rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] text-sm text-text-muted">
            No recovery episodes match the current filter.
          </div>
        ) : null}
        {pagedEvents.map((event, index) => (
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

      <div className="mt-4">
        <Pagination
          page={page}
          pageCount={pageCount}
          pageSize={pageSize}
          pageSizeOptions={[5, 10, 20]}
          onPageChange={setPage}
          onPageSizeChange={(nextSize) => {
            setPage(1);
            setPageSize(nextSize);
          }}
        />
      </div>
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
