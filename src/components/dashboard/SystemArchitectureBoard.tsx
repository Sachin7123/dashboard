import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Code2,
  Repeat2,
  Sparkles,
} from "lucide-react";
import type {
  DashboardSnapshot,
  ReMorphEvent,
  WorkflowEpisode,
} from "../../types/remorph";

const stageBlueprint = [
  {
    id: "request",
    label: "Incoming Request",
    short: "request",
    icon: Activity,
  },
  {
    id: "detect",
    label: "Failure Detection",
    short: "detect",
    icon: AlertTriangle,
  },
  {
    id: "repair",
    label: "Repair Core",
    short: "repair",
    icon: BrainCircuit,
  },
  {
    id: "retry",
    label: "Heal / Retry",
    short: "retry",
    icon: Repeat2,
  },
  {
    id: "healthy",
    label: "Healthy Response",
    short: "healthy",
    icon: CheckCircle2,
  },
] as const;

const demoPhases = ["request", "detect", "repair", "healthy"] as const;
type DemoPhase = (typeof demoPhases)[number];

export function SystemArchitectureBoard({
  snapshot,
  event,
  workflow,
}: {
  snapshot: DashboardSnapshot | null;
  event: ReMorphEvent | null;
  workflow: WorkflowEpisode | null;
}) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const phase = demoPhases[phaseIndex] satisfies DemoPhase;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPhaseIndex((current) => (current + 1) % demoPhases.length);
    }, 2200);

    return () => window.clearInterval(timer);
  }, []);

  const stageStatus = useMemo(() => {
    const activeIndex = demoPhases.indexOf(phase);

    return stageBlueprint.map((stage, index) => {
      let status: "idle" | "active" | "healthy" | "warning" = "idle";

      if (index < activeIndex) status = "healthy";
      if (index === activeIndex) {
        status = stage.id === "detect" ? "warning" : "active";
      }
      if (phase === "healthy" && stage.id === "healthy") status = "healthy";

      return { ...stage, status };
    });
  }, [phase]);

  const brokenUrl =
    event?.target_url ?? "https://api.lumen.infra/v1/orders/fulfillment/bulk";
  const healedUrl =
    event?.fixed_url ?? workflow?.selected_endpoint_path ?? "/api/v2/finance/ledger";
  const issueMessage = event?.message ?? "Endpoint migration detected";
  const method = event?.method ?? "POST";
  const confidence = `${Math.round((event?.confidence ?? 0.94) * 100)}%`;
  const latency = `${workflow?.latency_ms ?? event?.processing_ms ?? 420}ms`;
  const statusCode = String(workflow?.final_status_code ?? 200);
  const runtimeLabel =
    snapshot?.connection === "degraded" ? "Adaptive runtime" : "Production-style demo";

  return (
    <section className="glass-panel relative overflow-hidden p-5 sm:p-6 2xl:p-7">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(73,215,255,0.08),transparent_20%),radial-gradient(circle_at_50%_12%,rgba(179,140,255,0.14),transparent_24%),radial-gradient(circle_at_84%_20%,rgba(57,217,138,0.08),transparent_18%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_34%)]" />

      <div className="relative">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-[36rem]">
            <div className="text-[11px] uppercase tracking-[0.32em] text-text-muted">
              ReMorph Live Demo
            </div>
            <h2 className="mt-2 text-[2rem] font-semibold leading-tight text-white 2xl:text-[2.3rem]">
              API failure in. healed traffic out.
            </h2>
            <p className="mt-3 text-sm leading-7 text-text-muted">
              A cleaner product demo surface inspired by modern AI builders:
              typed API traffic, visible repair logic, and a clear healthy result.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-text-muted">
            <Sparkles className="h-3.5 w-3.5 text-accent-live" />
            {runtimeLabel}
          </div>
        </div>

        <div className="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {stageStatus.map((stage, index) => (
            <StagePill key={stage.id} stage={stage} delay={index * 0.05} />
          ))}
        </div>

        <div className="mt-6 rounded-[30px] border border-white/8 bg-black/26 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-2 text-[10px] uppercase tracking-[0.26em] text-text-muted">
              <Code2 className="h-3.5 w-3.5 text-accent-ai" />
              Request simulation
            </div>

            <div className="flex flex-wrap gap-2">
              {demoPhases.map((item) => (
                <button
                  key={item}
                  onClick={() => setPhaseIndex(demoPhases.indexOf(item))}
                  className={`rounded-full border px-3 py-2 text-[10px] uppercase tracking-[0.24em] transition ${
                    item === phase
                      ? "border-accent-live/24 bg-accent-live/10 text-accent-live"
                      : "border-white/8 bg-white/[0.03] text-text-muted hover:text-white"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.06fr)_220px_minmax(0,0.94fr)]">
            <CodeWindow
              title="Broken request"
              subtitle={`${method} / trapped API traffic`}
              tone="error"
            >
              <AnimatedCode
                lines={[
                  `${method} ${brokenUrl}`,
                  "content-type: application/json",
                  "authorization: Bearer live-token",
                  "",
                  "{",
                  '  "orderId": "ord_991",',
                  '  "destination": "stripe",',
                  '  "payload": { "items": 4 }',
                  "}",
                ]}
                phase={phase}
                accent="error"
              />
            </CodeWindow>

            <div className="flex min-h-full flex-col justify-center gap-3">
              <PipelineState phase={phase} issueMessage={issueMessage} />
            </div>

            <CodeWindow
              title="Recovered response"
              subtitle="Healed request output"
              tone="success"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={phase}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.28 }}
                  className="space-y-3"
                >
                  <div className="rounded-[18px] border border-accent-success/18 bg-accent-success/[0.08] px-4 py-3 text-xs leading-6 text-accent-success break-words">
                    {phase === "healthy" || phase === "repair"
                      ? `${method} ${healedUrl}`
                      : "Waiting for repaired request..."}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <MetricChip label="Confidence" value={confidence} tone="success" />
                    <MetricChip label="Latency" value={latency} tone="live" />
                    <MetricChip
                      label="Strategy"
                      value={event?.strategy ?? workflow?.repair_strategy ?? "deterministic"}
                      tone="ai"
                    />
                    <MetricChip
                      label="Status"
                      value={phase === "healthy" ? statusCode : "pending"}
                      tone={phase === "healthy" ? "success" : "error"}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </CodeWindow>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <BottomNote
            label="Detect"
            value="API drift and failure signatures are trapped instantly."
          />
          <BottomNote
            label="Repair"
            value="ReMorph rewrites route, payload, or auth using safe repair logic."
          />
          <BottomNote
            label="Recover"
            value="Healthy traffic returns with telemetry, confidence, and latency."
          />
        </div>
      </div>
    </section>
  );
}

function StagePill({
  stage,
  delay,
}: {
  stage: {
    id: string;
    label: string;
    short: string;
    status: "idle" | "active" | "healthy" | "warning";
    icon: typeof Activity;
  };
  delay: number;
}) {
  const Icon = stage.icon;
  const toneClass =
    stage.status === "healthy"
      ? "border-accent-success/18 bg-accent-success/[0.08]"
      : stage.status === "warning"
        ? "border-accent-error/18 bg-accent-error/[0.08]"
        : stage.status === "active"
          ? "border-accent-ai/18 bg-accent-ai/[0.08]"
          : "border-white/8 bg-white/[0.03]";

  const dotClass =
    stage.status === "healthy"
      ? "bg-accent-success shadow-[0_0_16px_rgba(57,217,138,0.48)]"
      : stage.status === "warning"
        ? "bg-accent-error shadow-[0_0_16px_rgba(255,90,118,0.48)]"
        : stage.status === "active"
          ? "bg-accent-ai shadow-[0_0_16px_rgba(179,140,255,0.48)]"
          : "bg-white/20";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className={`rounded-[24px] border p-4 ${toneClass}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/8 bg-black/25">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">{stage.label}</span>
            <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.24em] text-text-muted">
            {stage.short}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CodeWindow({
  title,
  subtitle,
  tone,
  children,
}: {
  title: string;
  subtitle: string;
  tone: "error" | "success";
  children: ReactNode;
}) {
  const toneClass =
    tone === "error"
      ? "from-accent-error/8 to-transparent"
      : "from-accent-success/8 to-transparent";

  return (
    <div className={`rounded-[26px] border border-white/8 bg-gradient-to-b ${toneClass} p-4`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.26em] text-text-muted">
            {title}
          </div>
          <div className="mt-2 text-sm font-semibold text-white">{subtitle}</div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-accent-error/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-accent-pending/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-accent-success/70" />
        </div>
      </div>

      <div className="mt-4 rounded-[20px] border border-white/8 bg-[#08090d] px-4 py-4 font-mono text-[12px] leading-7 text-white/92">
        {children}
      </div>
    </div>
  );
}

function AnimatedCode({
  lines,
  phase,
  accent,
}: {
  lines: string[];
  phase: DemoPhase;
  accent: "error" | "success";
}) {
  const visibleCount =
    phase === "request" ? 4 : phase === "detect" ? 7 : phase === "repair" ? 9 : 9;

  return (
    <div className="space-y-0.5">
      {lines.slice(0, visibleCount).map((line, index) => (
        <motion.div
          key={`${index}-${line}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: index * 0.04 }}
          className={index === 0 ? (accent === "error" ? "text-accent-live" : "text-accent-success") : ""}
        >
          {line || <span>&nbsp;</span>}
        </motion.div>
      ))}
      <motion.span
        className={`inline-block h-4 w-2 rounded-sm ${
          accent === "error" ? "bg-accent-error/70" : "bg-accent-success/70"
        }`}
        animate={{ opacity: [1, 0.2, 1] }}
        transition={{ duration: 0.9, repeat: Number.POSITIVE_INFINITY }}
      />
    </div>
  );
}

function PipelineState({
  phase,
  issueMessage,
}: {
  phase: DemoPhase;
  issueMessage: string;
}) {
  const items = [
    {
      id: "request",
      label: "Request received",
      detail: "Traffic enters the gateway",
      tone: "live",
    },
    {
      id: "detect",
      label: "Failure detected",
      detail: issueMessage,
      tone: "error",
    },
    {
      id: "repair",
      label: "Repair generated",
      detail: "Route and payload updated",
      tone: "ai",
    },
    {
      id: "healthy",
      label: "Healthy response",
      detail: "Request verified and recovered",
      tone: "success",
    },
  ] as const;

  const activeIndex = items.findIndex((item) => item.id === phase);

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const state =
          index < activeIndex
            ? "done"
            : index === activeIndex
              ? "active"
              : "idle";

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.28, delay: index * 0.05 }}
            className={`rounded-[22px] border px-4 py-4 ${
              state === "done"
                ? "border-accent-success/18 bg-accent-success/[0.08]"
                : state === "active"
                  ? item.tone === "error"
                    ? "border-accent-error/18 bg-accent-error/[0.08]"
                    : item.tone === "ai"
                      ? "border-accent-ai/18 bg-accent-ai/[0.08]"
                      : "border-accent-live/18 bg-accent-live/[0.08]"
                  : "border-white/8 bg-white/[0.03]"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-white">{item.label}</div>
              <ArrowRight
                className={`h-4 w-4 ${
                  state === "idle" ? "text-text-muted/40" : "text-white"
                }`}
              />
            </div>
            <div className="mt-2 text-xs leading-6 text-text-muted">{item.detail}</div>
          </motion.div>
        );
      })}
    </div>
  );
}

function MetricChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "error" | "ai" | "success" | "live";
}) {
  const toneClass =
    tone === "error"
      ? "border-accent-error/18 bg-accent-error/8 text-accent-error"
      : tone === "ai"
        ? "border-accent-ai/18 bg-accent-ai/8 text-accent-ai"
        : tone === "success"
          ? "border-accent-success/18 bg-accent-success/8 text-accent-success"
          : "border-accent-live/18 bg-accent-live/8 text-accent-live";

  return (
    <div className={`rounded-[18px] border px-4 py-4 ${toneClass}`}>
      <div className="text-[10px] uppercase tracking-[0.22em]">{label}</div>
      <div className="mt-3 text-sm font-semibold text-white break-words">{value}</div>
    </div>
  );
}

function BottomNote({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
      <div className="text-[10px] uppercase tracking-[0.24em] text-text-muted">
        {label}
      </div>
      <div className="mt-3 text-sm leading-7 text-white">{value}</div>
    </div>
  );
}
