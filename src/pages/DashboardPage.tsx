import { startTransition, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  CpuIcon,
  Layers3,
  Lock,
  Route,
  Siren,
  Waves,
  Wifi,
  WifiOff,
} from "lucide-react";
import { HeroFlow } from "../components/dashboard/HeroFlow";
import { MetricCard } from "../components/dashboard/MetricCard";
import { Panel } from "../components/layout/Panel";
import { EventFeed } from "../components/dashboard/EventFeed";
import { TracePanel } from "../components/dashboard/TracePanel";
import { DiffViewer } from "../components/dashboard/DiffViewer";
import { StatusPill } from "../components/dashboard/StatusPill";
import { SignalRow } from "../components/dashboard/SignalRow";
import { PipelineMap } from "../components/dashboard/PipelineMap";
import { WorkflowTimeline } from "../components/dashboard/WorkflowTimeline";
import { BenchmarkPanel } from "../components/dashboard/BenchmarkPanel";
import { ServiceHealthPanel } from "../components/dashboard/ServiceHealthPanel";
import { TrainingPanel } from "../components/dashboard/TrainingPanel";
import { Pagination } from "../components/app/Pagination";
import { countEventsByType, engineTone, formatClock, labelForType } from "../lib/dashboard";
import { buildFlowFromEvent } from "../services/telemetry/normalizers";
import type { DashboardSnapshot, EngineState, EventType, ReMorphEvent } from "../types/remorph";

type EventFilter = "all" | EventType;

const filterConfig: Array<{ id: EventFilter; label: string; icon: typeof Activity }> = [
  { id: "all", label: "All Intercepts", icon: Activity },
  { id: "payload_drift", label: "Payload Drift", icon: Layers3 },
  { id: "route_drift", label: "Route Drift", icon: Route },
  { id: "auth_drift", label: "Auth Drift", icon: Lock },
  { id: "server_fault", label: "Server Faults", icon: Siren },
];

const logFilters = ["all", "healed", "pending", "failed"] as const;

export function DashboardPage({
  snapshot,
  selectedEvent,
  selectedEventId,
  setSelectedEventId,
  isLoading,
  errorMessage,
  engineState,
  isLiveMode,
  setIsLiveMode,
}: {
  snapshot: DashboardSnapshot | null;
  selectedEvent: ReMorphEvent | null;
  selectedEventId: string | null;
  setSelectedEventId: (id: string) => void;
  isLoading: boolean;
  errorMessage: string | null;
  engineState: EngineState;
  isLiveMode: boolean;
  setIsLiveMode: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [activeFilter, setActiveFilter] = useState<EventFilter>("all");
  const [logQuery, setLogQuery] = useState("");
  const [logFilter, setLogFilter] = useState<(typeof logFilters)[number]>("all");
  const [logPage, setLogPage] = useState(1);
  const [logPageSize, setLogPageSize] = useState(5);

  const filteredEvents = useMemo(() => {
    const events = snapshot?.events ?? [];
    return activeFilter === "all"
      ? events
      : events.filter((event) => event.type === activeFilter);
  }, [activeFilter, snapshot?.events]);

  const activeEvent = useMemo(() => {
    if (!filteredEvents.length) return selectedEvent;
    return (
      filteredEvents.find((event) => event.id === selectedEventId) ??
      filteredEvents[0] ??
      selectedEvent
    );
  }, [filteredEvents, selectedEvent, selectedEventId]);

  const workflows = snapshot?.workflows ?? [];
  const activeWorkflow = !workflows.length
    ? null
    : !activeEvent
      ? workflows[0] ?? null
      : (
          workflows.find(
            (workflow) =>
              workflow.scenario_type === activeEvent.type &&
              workflow.agent_type === "adaptive",
          ) ??
          workflows.find((workflow) => workflow.scenario_type === activeEvent.type) ??
          workflows[0] ??
          null
        );

  const activeFlow = useMemo(
    () => buildFlowFromEvent(activeEvent ?? null) ?? snapshot?.flow ?? null,
    [activeEvent, snapshot?.flow],
  );

  const stats = snapshot?.metrics;
  const visibleLogs = useMemo(() => {
    const normalized = logQuery.trim().toLowerCase();
    return (snapshot?.events ?? [])
      .filter((event) => (logFilter === "all" ? true : event.status === logFilter))
      .filter((event) =>
        !normalized
          ? true
          : `${event.message} ${event.target_url} ${event.method}`.toLowerCase().includes(normalized),
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [logFilter, logQuery, snapshot?.events]);

  const pageCount = Math.max(1, Math.ceil(visibleLogs.length / logPageSize));
  const pagedLogs = visibleLogs.slice((logPage - 1) * logPageSize, logPage * logPageSize);

  return (
    <div className="relative min-h-[calc(100dvh-6.5rem)] w-full overflow-hidden px-4 pb-8 pt-4 sm:px-5 lg:px-7 2xl:px-10">
      <div className="control-grid gap-4">
        <aside className="min-h-0 xl:sticky xl:top-24 xl:self-start">
          <div className="grid min-h-0 gap-4 xl:max-h-[calc(100dvh-8rem)] xl:grid-rows-[auto_minmax(14rem,0.9fr)_minmax(12rem,0.7fr)]">
            <section className="glass-panel p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.35em] text-text-muted">ReMorph</p>
                  <h1 className="text-lg font-semibold tracking-[0.16em] uppercase">
                    Obsidian Control Plane
                  </h1>
                </div>
                <StatusPill
                  tone={
                    snapshot?.connection === "connected"
                      ? "success"
                      : snapshot?.connection === "degraded"
                        ? "live"
                        : "muted"
                  }
                  label={
                    snapshot?.connection === "connected"
                      ? "Backend Live"
                      : snapshot?.connection === "degraded"
                        ? "Degraded Link"
                        : "Awaiting Sync"
                  }
                />
              </div>

              <div className="mt-5">
                <SignalRow
                  label="Telemetry Source"
                  value={snapshot?.backend_label ?? "Bootstrapping"}
                  valueClass="font-mono text-[11px]"
                />
                <SignalRow
                  label="Last Sync"
                  value={formatClock(snapshot?.last_updated ?? null)}
                  valueClass="font-mono text-[11px]"
                />
                <SignalRow
                  label="Refresh Loop"
                  value={isLiveMode ? "ACTIVE" : "PAUSED"}
                  valueClass={isLiveMode ? "text-accent-live" : "text-text-muted"}
                />
                <SignalRow
                  label="Operator"
                  value={snapshot?.session.operator_name ?? "Initializing"}
                />
              </div>

              <button
                onClick={() => setIsLiveMode((current) => !current)}
                className={`mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.28em] transition-all ${
                  isLiveMode
                    ? "border-accent-live/30 bg-accent-live/10 text-accent-live"
                    : "border-white/8 bg-white/[0.03] text-text-muted hover:border-white/12"
                }`}
              >
                {isLiveMode ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                {isLiveMode ? "Live Ingestion On" : "Live Ingestion Off"}
              </button>

              {errorMessage ? (
                <div className="mt-4 rounded-2xl border border-accent-error/20 bg-accent-error/10 p-3 text-xs text-accent-error">
                  {errorMessage}
                </div>
              ) : null}
            </section>

            <Panel
              eyebrow="Telemetry Filters"
              title="Event Categories"
              sticky
              contentClassName="min-h-0 overflow-y-auto custom-scrollbar px-3 py-3 xl:max-h-[24rem]"
            >
              <div className="space-y-2">
                {filterConfig.map((item) => {
                  const Icon = item.icon;
                  const count = countEventsByType(snapshot?.events ?? [], item.id);

                  return (
                    <button
                      key={item.id}
                      onClick={() => startTransition(() => setActiveFilter(item.id))}
                      className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all ${
                        item.id === activeFilter
                          ? "border-accent-ai/28 bg-white/[0.06] text-white"
                          : "border-transparent bg-transparent text-text-muted hover:border-white/10 hover:bg-white/[0.03] hover:text-white"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${item.id === activeFilter ? "text-accent-ai" : ""}`} />
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="ml-auto text-[11px] font-mono text-text-muted">{count}</span>
                    </button>
                  );
                })}
              </div>
            </Panel>

            <Panel
              eyebrow="Workspace"
              title="Notifications + Notices"
              sticky
              action={<Waves className="h-4 w-4 text-accent-live" />}
              contentClassName="min-h-0 overflow-y-auto custom-scrollbar px-4 py-4 xl:max-h-[20rem]"
            >
              <div className="space-y-3">
                {(snapshot?.notices ?? [
                  "Operator digest generated for platform review.",
                  "Adaptive retry runner is within SLA.",
                ]).map((notice, index) => (
                  <div
                    key={`${notice}-${index}`}
                    className="rounded-2xl border border-white/8 bg-white/[0.03] p-3 text-sm text-text-muted"
                  >
                    {notice}
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </aside>

        <main className="min-h-0 overflow-hidden">
          <div className="grid min-h-0 gap-4">
            <HeroFlow
              flow={activeFlow}
              engineState={engineState}
              activeLoad={Math.min(1, filteredEvents.length / 16)}
            />

            <PipelineMap flow={activeFlow} workflow={activeWorkflow} />

            <section className="grid min-h-0 gap-5 2xl:grid-cols-[minmax(0,1.18fr)_minmax(420px,0.82fr)]">
              <div className="grid min-h-0 gap-4">
                <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
                  <MetricCard title="Success Rate" value={`${stats?.success_rate ?? 0}%`} tone="success" hint="Recovered episodes across the current telemetry window" />
                  <MetricCard title="Avg Latency" value={`${stats?.average_latency_ms ?? 0}ms`} tone="live" hint="Adaptive retry and patching cost per event" />
                  <MetricCard title="Confidence" value={`${stats?.average_confidence ?? 0}%`} tone="ai" hint="Mean confidence from the reasoning and repair pipeline" />
                  <MetricCard title="Unresolved" value={stats?.unresolved_count ?? 0} tone="error" hint="Events still needing operator review" />
                </div>

                <EventFeed
                  events={filteredEvents}
                  selectedEventId={activeEvent?.id ?? selectedEventId}
                  onSelect={(id) => startTransition(() => setSelectedEventId(id))}
                  title={activeFilter === "all" ? "All Recovery Episodes" : labelForType(activeFilter)}
                />
              </div>

              <div className="grid min-h-0 gap-4">
                <BenchmarkPanel benchmark={snapshot?.benchmark ?? null} />
                <TrainingPanel training={snapshot?.training ?? null} />
              </div>
            </section>

            <section className="grid min-h-0 gap-5 2xl:grid-cols-[minmax(0,1.08fr)_minmax(420px,0.92fr)]">
              <div className="grid min-h-0 gap-4">
                <DiffViewer event={activeEvent ?? null} />
                <TracePanel event={activeEvent ?? null} />
              </div>

              <div className="grid min-h-0 gap-4">
                <WorkflowTimeline workflows={workflows} />
                <ServiceHealthPanel services={snapshot?.services ?? []} />

                <div className="grid min-h-0 gap-4 2xl:grid-cols-2">
                  <Panel
                    eyebrow="Operational Metadata"
                    title="Backend-Aligned Event Card"
                    sticky
                    action={<CpuIcon className="h-4 w-4 text-accent-live" />}
                    contentClassName="min-h-0 overflow-y-auto custom-scrollbar px-4 py-4 xl:max-h-[22rem]"
                  >
                    {activeEvent ? (
                      <div className="grid gap-x-4 gap-y-1 md:grid-cols-2">
                        <SignalRow label="Docs Source" value={activeEvent.diagnostics.docs_source} />
                        <SignalRow label="Spec Version" value={activeEvent.diagnostics.spec_version ?? "v-current"} />
                        <SignalRow label="Selected Route" value={activeWorkflow?.selected_endpoint_path ?? "Awaiting match"} />
                        <SignalRow label="Source Component" value={activeEvent.source_component} />
                        <SignalRow label="Retry Count" value={activeEvent.retry_count} />
                        <SignalRow label="Target Method" value={activeEvent.method} />
                        <SignalRow label="LLM Attempted" value={activeEvent.diagnostics.llm_attempted ? "yes" : "no"} />
                        <SignalRow label="LLM Succeeded" value={activeEvent.diagnostics.llm_succeeded ? "yes" : "no"} valueClass={activeEvent.diagnostics.llm_succeeded ? "text-accent-success" : "text-accent-error"} />
                        <SignalRow label="Fallback Used" value={activeEvent.diagnostics.fallback_used ? "yes" : "no"} valueClass={activeEvent.diagnostics.fallback_used ? "text-accent-pending" : "text-text-muted"} />
                        <SignalRow label="Error Code" value={activeEvent.error_code} />
                      </div>
                    ) : (
                      <EmptyState label="No event is selected yet." />
                    )}
                  </Panel>

                  <Panel
                    eyebrow="Operator Summary"
                    title="Control Plane Posture"
                    sticky
                    action={<BrainCircuit className="h-4 w-4 text-accent-ai" />}
                    contentClassName="min-h-0 overflow-y-auto custom-scrollbar px-4 py-4 xl:max-h-[22rem]"
                  >
                    <div className="space-y-3">
                      <InsightBadge label="Engine State" value={engineState} tone={engineTone(engineState)} />
                      <InsightBadge label="Session" value={snapshot?.session.auth_state ?? "initializing"} tone={snapshot?.session.auth_state === "authenticated" ? "success" : "error"} />
                      <InsightBadge label="Environment" value={snapshot?.session.environment ?? "mock-lab"} tone="muted" />
                      <InsightBadge label="Selected Drift" value={activeEvent ? labelForType(activeEvent.type) : "None"} tone="live" />
                      <InsightBadge label="Workflow Mode" value={activeWorkflow?.agent_type ?? "adaptive"} tone={activeWorkflow?.agent_type === "adaptive" ? "ai" : "muted"} />
                      <InsightBadge label="Event Status" value={activeEvent?.status ?? "idle"} tone={activeEvent ? eventTone(activeEvent) : "muted"} />
                    </div>
                  </Panel>
                </div>
              </div>
            </section>

            <Panel eyebrow="Operations" title="Logs + Requests" contentClassName="px-4 py-4">
              <div className="flex flex-wrap items-center gap-3">
                <input
                  value={logQuery}
                  onChange={(event) => {
                    setLogPage(1);
                    setLogQuery(event.target.value);
                  }}
                  placeholder="Search logs, requests, and alerts"
                  className="min-w-[220px] flex-1 rounded-2xl border border-white/8 bg-black/22 px-4 py-3 text-sm text-white outline-none"
                />
                <select
                  value={logFilter}
                  onChange={(event) => {
                    setLogPage(1);
                    setLogFilter(event.target.value as (typeof logFilters)[number]);
                  }}
                  className="rounded-2xl border border-white/8 bg-black/22 px-4 py-3 text-sm text-white outline-none"
                >
                  {logFilters.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 overflow-hidden rounded-[24px] border border-white/8">
                <table className="w-full border-collapse text-left">
                  <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.24em] text-text-muted">
                    <tr>
                      <th className="px-4 py-4">Request</th>
                      <th className="px-4 py-4">Type</th>
                      <th className="px-4 py-4">Status</th>
                      <th className="px-4 py-4">Latency</th>
                      <th className="px-4 py-4">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedLogs.map((event) => (
                      <tr key={event.id} className="border-t border-white/8 bg-black/18">
                        <td className="px-4 py-4 text-sm text-white">{event.target_url}</td>
                        <td className="px-4 py-4 text-sm text-text-muted">{labelForType(event.type)}</td>
                        <td className="px-4 py-4 text-sm text-white">{event.status}</td>
                        <td className="px-4 py-4 text-sm text-text-muted">{event.processing_ms}ms</td>
                        <td className="px-4 py-4 text-sm text-text-muted">{formatClock(event.timestamp)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4">
                <Pagination
                  page={logPage}
                  pageCount={pageCount}
                  pageSize={logPageSize}
                  pageSizeOptions={[5, 10, 20]}
                  onPageChange={setLogPage}
                  onPageSizeChange={(nextSize) => {
                    setLogPage(1);
                    setLogPageSize(nextSize);
                  }}
                />
              </div>
            </Panel>
          </div>
        </main>
      </div>

      {isLoading && !snapshot ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="glass-card rounded-[28px] px-6 py-5 text-center">
            <div className="text-[11px] uppercase tracking-[0.35em] text-text-muted">Initializing</div>
            <div className="mt-3 text-lg font-semibold text-white">Booting mock control plane</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function InsightBadge({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "success" | "live" | "ai" | "error" | "muted";
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3">
      <span className="min-w-0 flex-1 text-[11px] uppercase tracking-[0.28em] text-text-muted">{label}</span>
      <div className="min-w-0 max-w-[60%]">
        <StatusPill tone={tone} label={value} />
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] text-sm text-text-muted">
      <AlertTriangle className="mr-2 h-4 w-4" />
      {label}
    </div>
  );
}

function eventTone(event: ReMorphEvent): "success" | "live" | "ai" | "error" | "muted" {
  if (event.status === "healed") return "success";
  if (event.status === "pending") return "live";
  return "error";
}
