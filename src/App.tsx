import { startTransition, useDeferredValue, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  CpuIcon,
  Layers3,
  Lock,
  Orbit,
  Route,
  Siren,
  Waves,
  Wifi,
  WifiOff,
} from "lucide-react";
import { HeroFlow } from "./components/dashboard/HeroFlow";
import { MetricCard } from "./components/dashboard/MetricCard";
import { Panel } from "./components/layout/Panel";
import { EventFeed } from "./components/dashboard/EventFeed";
import { TracePanel } from "./components/dashboard/TracePanel";
import { DiffViewer } from "./components/dashboard/DiffViewer";
import { StatusPill } from "./components/dashboard/StatusPill";
import { SignalRow } from "./components/dashboard/SignalRow";
import { PipelineMap } from "./components/dashboard/PipelineMap";
import { WorkflowTimeline } from "./components/dashboard/WorkflowTimeline";
import { BenchmarkPanel } from "./components/dashboard/BenchmarkPanel";
import { ServiceHealthPanel } from "./components/dashboard/ServiceHealthPanel";
import { TrainingPanel } from "./components/dashboard/TrainingPanel";
import { OrganizationLanding } from "./components/dashboard/OrganizationLanding";
import { useDashboardRuntime } from "./hooks/useDashboardRuntime";
import { countEventsByType, engineTone, formatClock, labelForType } from "./lib/dashboard";
import { buildFlowFromEvent } from "./services/telemetry/normalizers";
import type { EventType, ReMorphEvent } from "./types/remorph";

type EventFilter = "all" | EventType;

const filterConfig: Array<{
  id: EventFilter;
  label: string;
  icon: typeof Activity;
}> = [
  { id: "all", label: "All Intercepts", icon: Activity },
  { id: "payload_drift", label: "Payload Drift", icon: Layers3 },
  { id: "route_drift", label: "Route Drift", icon: Route },
  { id: "auth_drift", label: "Auth Drift", icon: Lock },
  { id: "server_fault", label: "Server Faults", icon: Siren },
];

export default function App() {
  const {
    snapshot,
    selectedEvent,
    selectedEventId,
    setSelectedEventId,
    isLoading,
    errorMessage,
    engineState,
    isLiveMode,
    setIsLiveMode,
  } = useDashboardRuntime();
  const [activeFilter, setActiveFilter] = useState<EventFilter>("all");
  const [activePage, setActivePage] = useState<"landing" | "dashboard">("landing");

  const deferredEvents = useDeferredValue(snapshot?.events ?? []);

  const filteredEvents = useMemo(() => {
    if (activeFilter === "all") return deferredEvents;
    return deferredEvents.filter((event) => event.type === activeFilter);
  }, [activeFilter, deferredEvents]);

  const activeEvent = useMemo(() => {
    if (!filteredEvents.length) return selectedEvent;
    return (
      filteredEvents.find((event) => event.id === selectedEventId) ??
      filteredEvents[0] ??
      selectedEvent
    );
  }, [filteredEvents, selectedEvent, selectedEventId]);

  const activeFlow = useMemo(
    () => buildFlowFromEvent(activeEvent ?? null) ?? snapshot?.flow ?? null,
    [activeEvent, snapshot?.flow],
  );
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
  const stats = snapshot?.metrics;

  if (activePage === "landing") {
    return (
      <OrganizationLanding
        snapshot={snapshot}
        event={activeEvent ?? null}
        workflow={activeWorkflow}
        onEnterDashboard={() => setActivePage("dashboard")}
      />
    );
  }

  return (
    <div className="min-h-dvh w-screen overflow-x-hidden overflow-y-auto bg-obsidian-bg text-text-primary">
      <div className="cinematic-bg" />
      <div className="min-h-dvh w-full px-3 py-3 sm:px-4 sm:py-4 lg:px-5 lg:py-5 2xl:px-6">
        <div className="control-grid gap-4">
          <aside className="min-h-0 xl:sticky xl:top-5 xl:self-start">
            <div className="grid min-h-0 gap-4 xl:max-h-[calc(100dvh-2.5rem)] xl:grid-rows-[auto_minmax(14rem,0.9fr)_minmax(12rem,0.7fr)]">
              <section className="glass-panel p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="orb-badge">
                      <Orbit className="h-5 w-5 text-accent-ai" />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.35em] text-text-muted">
                        ReMorph
                      </p>
                      <h1 className="text-lg font-semibold tracking-[0.16em] uppercase">
                        Obsidian Control Plane
                      </h1>
                    </div>
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
                    valueClass={
                      isLiveMode ? "text-accent-live" : "text-text-muted"
                    }
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
                      ? "border-accent-live/30 bg-accent-live/10 text-accent-live shadow-[0_0_24px_rgba(73,215,255,0.15)]"
                      : "border-white/8 bg-white/[0.03] text-text-muted hover:border-white/12"
                  }`}
                >
                  {isLiveMode ? (
                    <Wifi className="h-4 w-4" />
                  ) : (
                    <WifiOff className="h-4 w-4" />
                  )}
                  {isLiveMode ? "Live Ingestion On" : "Live Ingestion Off"}
                </button>

                <button
                  onClick={() => setActivePage("landing")}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-text-muted transition-all hover:border-white/12 hover:text-white"
                >
                  Back To Overview
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
                    const count = countEventsByType(
                      snapshot?.events ?? [],
                      item.id,
                    );

                    return (
                      <button
                        key={item.id}
                        onClick={() =>
                          startTransition(() => setActiveFilter(item.id))
                        }
                        className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all ${
                          item.id === activeFilter
                            ? "border-accent-ai/28 bg-white/[0.06] text-white shadow-[0_0_20px_rgba(179,140,255,0.12)]"
                            : "border-transparent bg-transparent text-text-muted hover:border-white/10 hover:bg-white/[0.03] hover:text-white"
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 ${item.id === activeFilter ? "text-accent-ai" : ""}`}
                        />
                        <span className="text-sm font-medium">
                          {item.label}
                        </span>
                        <span className="ml-auto text-[11px] font-mono text-text-muted">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Panel>

              <Panel
                eyebrow="Mock Backend Readiness"
                title="Signals + Notices"
                sticky
                action={<Waves className="h-4 w-4 text-accent-live" />}
                contentClassName="min-h-0 overflow-y-auto custom-scrollbar px-4 py-4 xl:max-h-[20rem]"
              >
                <div className="space-y-3">
                  {(
                    snapshot?.notices ?? [
                      "Initializing runtime surfaces.",
                      "Mock gateway is preparing telemetry.",
                    ]
                  ).map((notice, index) => (
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

          <main className="min-h-0">
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
                    <MetricCard
                      title="Success Rate"
                      value={`${stats?.success_rate ?? 0}%`}
                      tone="success"
                      hint="Recovered episodes across the current telemetry window"
                    />
                    <MetricCard
                      title="Avg Latency"
                      value={`${stats?.average_latency_ms ?? 0}ms`}
                      tone="live"
                      hint="Adaptive retry and patching cost per event"
                    />
                    <MetricCard
                      title="Confidence"
                      value={`${stats?.average_confidence ?? 0}%`}
                      tone="ai"
                      hint="Mean confidence from the reasoning and repair pipeline"
                    />
                    <MetricCard
                      title="Unresolved"
                      value={stats?.unresolved_count ?? 0}
                      tone="error"
                      hint="Events still needing operator review"
                    />
                  </div>

                  <EventFeed
                    events={filteredEvents}
                    selectedEventId={activeEvent?.id ?? selectedEventId}
                    onSelect={(id) =>
                      startTransition(() => setSelectedEventId(id))
                    }
                    title={
                      activeFilter === "all"
                        ? "All Recovery Episodes"
                        : labelForType(activeFilter)
                    }
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
                          <SignalRow
                            label="Docs Source"
                            value={activeEvent.diagnostics.docs_source}
                          />
                          <SignalRow
                            label="Spec Version"
                            value={activeEvent.diagnostics.spec_version ?? "v-current"}
                          />
                          <SignalRow
                            label="Selected Route"
                            value={activeWorkflow?.selected_endpoint_path ?? "Awaiting match"}
                          />
                          <SignalRow
                            label="Source Component"
                            value={activeEvent.source_component}
                          />
                          <SignalRow
                            label="Retry Count"
                            value={activeEvent.retry_count}
                          />
                          <SignalRow
                            label="Target Method"
                            value={activeEvent.method}
                          />
                          <SignalRow
                            label="LLM Attempted"
                            value={
                              activeEvent.diagnostics.llm_attempted
                                ? "yes"
                                : "no"
                            }
                          />
                          <SignalRow
                            label="LLM Succeeded"
                            value={
                              activeEvent.diagnostics.llm_succeeded
                                ? "yes"
                                : "no"
                            }
                            valueClass={
                              activeEvent.diagnostics.llm_succeeded
                                ? "text-accent-success"
                                : "text-accent-error"
                            }
                          />
                          <SignalRow
                            label="Fallback Used"
                            value={
                              activeEvent.diagnostics.fallback_used
                                ? "yes"
                                : "no"
                            }
                            valueClass={
                              activeEvent.diagnostics.fallback_used
                                ? "text-accent-pending"
                                : "text-text-muted"
                            }
                          />
                          <SignalRow
                            label="Error Code"
                            value={activeEvent.error_code}
                          />
                        </div>
                      ) : (
                        <EmptyState label="No event is selected yet." />
                      )}
                    </Panel>

                    <Panel
                      eyebrow="Operator Summary"
                      title="Control Plane Posture"
                      sticky
                      action={
                        <BrainCircuit className="h-4 w-4 text-accent-ai" />
                      }
                      contentClassName="min-h-0 overflow-y-auto custom-scrollbar px-4 py-4 xl:max-h-[22rem]"
                    >
                      <div className="space-y-3">
                        <InsightBadge
                          label="Engine State"
                          value={engineState}
                          tone={engineTone(engineState)}
                        />
                        <InsightBadge
                          label="Session"
                          value={snapshot?.session.auth_state ?? "initializing"}
                          tone={
                            snapshot?.session.auth_state === "authenticated"
                              ? "success"
                              : "error"
                          }
                        />
                        <InsightBadge
                          label="Environment"
                          value={snapshot?.session.environment ?? "mock-lab"}
                          tone="muted"
                        />
                        <InsightBadge
                          label="Selected Drift"
                          value={
                            activeEvent
                              ? labelForType(activeEvent.type)
                              : "None"
                          }
                          tone="live"
                        />
                        <InsightBadge
                          label="Workflow Mode"
                          value={activeWorkflow?.agent_type ?? "adaptive"}
                          tone={activeWorkflow?.agent_type === "adaptive" ? "ai" : "muted"}
                        />
                        <InsightBadge
                          label="Event Status"
                          value={activeEvent?.status ?? "idle"}
                          tone={activeEvent ? eventTone(activeEvent) : "muted"}
                        />
                        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3 text-sm text-text-muted">
                          The dashboard now mirrors the full ReMorph narrative:
                          trapped failure, repair reasoning, retry recovery,
                          benchmark lift, and training readiness in one surface.
                        </div>
                      </div>
                    </Panel>
                  </div>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>

      {isLoading && !snapshot ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="glass-card rounded-[28px] px-6 py-5 text-center">
            <div className="text-[11px] uppercase tracking-[0.35em] text-text-muted">
              Initializing
            </div>
            <div className="mt-3 text-lg font-semibold text-white">
              Booting mock control plane
            </div>
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
      <span className="min-w-0 flex-1 text-[11px] uppercase tracking-[0.28em] text-text-muted">
        {label}
      </span>
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

function eventTone(
  event: ReMorphEvent,
): "success" | "live" | "ai" | "error" | "muted" {
  if (event.status === "healed") return "success";
  if (event.status === "pending") return "live";
  return "error";
}
