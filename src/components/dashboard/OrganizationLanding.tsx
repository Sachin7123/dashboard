import { motion } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  ChevronRight,
  Clock3,
  Orbit,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type {
  DashboardSnapshot,
  ReMorphEvent,
  WorkflowEpisode,
} from "../../types/remorph";
import { StatusPill } from "./StatusPill";
import { SystemArchitectureBoard } from "./SystemArchitectureBoard";

const featureBullets = [
  "Live anomaly detection",
  "Payload auto-repair",
  "Retry intelligence",
  "Zero downtime recovery",
];

const workflowCards = [
  {
    title: "Detect",
    body: "Trap drift instantly.",
    icon: ShieldCheck,
    tone: "from-accent-error/18 via-accent-error/6 to-transparent",
  },
  {
    title: "Analyze",
    body: "Read the failure clearly.",
    icon: BrainCircuit,
    tone: "from-accent-ai/20 via-accent-ai/8 to-transparent",
  },
  {
    title: "Repair",
    body: "Rewrite payload, route, or auth.",
    icon: ChevronRight,
    tone: "from-accent-live/20 via-accent-live/8 to-transparent",
  },
  {
    title: "Recover",
    body: "Return healthy traffic fast.",
    icon: ShieldCheck,
    tone: "from-accent-success/18 via-accent-success/8 to-transparent",
  },
];

const valueProps = [
  "Reduce downtime.",
  "Recover incidents faster.",
  "Protect customer experience.",
];

const landingTabs = ["Overview", "Demo", "Metrics"] as const;

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function getHeroMetrics(
  snapshot: DashboardSnapshot | null,
  workflow: WorkflowEpisode | null,
) {
  const metrics = snapshot?.metrics;

  return [
    {
      label: "Requests healed",
      value: metrics?.healed_events ?? 1842,
      suffix: "+",
    },
    {
      label: "Avg recovery time",
      value: metrics?.average_latency_ms ?? workflow?.latency_ms ?? 420,
      suffix: "ms",
    },
    {
      label: "Success rate",
      value: metrics?.success_rate ?? 98,
      suffix: "%",
    },
    {
      label: "Active monitors",
      value: (snapshot?.services.length ?? 7) + 12,
      suffix: "",
    },
  ];
}

export function OrganizationLanding({
  snapshot,
  event,
  workflow,
  onEnterDashboard,
}: {
  snapshot: DashboardSnapshot | null;
  event: ReMorphEvent | null;
  workflow: WorkflowEpisode | null;
  onEnterDashboard: () => void;
}) {
  const heroMetrics = getHeroMetrics(snapshot, workflow);
  const recoveryConfidence = Math.round((event?.confidence ?? 0.94) * 100);

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-obsidian-bg text-text-primary">
      <div className="cinematic-bg" />
      <div className="landing-grid-pattern" />

      <div className="relative w-full px-4 pb-10 pt-4 sm:px-5 lg:px-7 lg:pb-14 lg:pt-5 2xl:px-10">
        <motion.header
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="landing-nav sticky top-3 z-40 flex items-center justify-between gap-4 rounded-[24px] border border-white/8 bg-black/25 px-4 py-3 backdrop-blur-2xl sm:px-5"
        >
          <button
            onClick={() => scrollToSection("hero")}
            className="flex items-center gap-3 text-left"
          >
            <div className="orb-badge h-10 w-10 rounded-xl">
              <Orbit className="h-4 w-4 text-accent-ai" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.34em] text-text-muted">
                ReMorph
              </div>
              <div className="text-sm font-semibold tracking-[0.14em] uppercase text-white">
                Self-Healing Platform
              </div>
            </div>
          </button>

          <nav className="hidden items-center gap-6 text-sm text-text-muted lg:flex">
            <button onClick={() => scrollToSection("features")} className="transition hover:text-white">
              Features
            </button>
            <button onClick={() => scrollToSection("architecture")} className="transition hover:text-white">
              Architecture
            </button>
            <button onClick={() => scrollToSection("metrics")} className="transition hover:text-white">
              Metrics
            </button>
            <button onClick={() => scrollToSection("docs")} className="transition hover:text-white">
              Docs
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <StatusPill
              tone={snapshot?.connection === "degraded" ? "live" : "success"}
              label={snapshot?.connection === "degraded" ? "Adaptive Runtime" : "Control Plane Ready"}
            />
            <button
              onClick={onEnterDashboard}
              className="rounded-2xl border border-accent-live/28 bg-accent-live/12 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-accent-live transition hover:border-accent-live/42 hover:bg-accent-live/18"
            >
              Dashboard
            </button>
          </div>
        </motion.header>

        <section
          id="hero"
          className="grid min-h-[calc(100dvh-6.5rem)] items-center gap-8 pb-10 pt-8 xl:grid-cols-[minmax(0,0.8fr)_minmax(760px,1.2fr)] xl:gap-10 2xl:grid-cols-[minmax(0,0.76fr)_minmax(860px,1.24fr)] lg:pb-14 lg:pt-12"
        >
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative z-10"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] uppercase tracking-[0.3em] text-text-muted">
              <Sparkles className="h-3.5 w-3.5 text-accent-ai" />
              Autonomous recovery for drifting APIs
            </div>

            <h1 className="mt-6 max-w-[10.5ch] text-5xl font-semibold leading-[0.95] text-white sm:text-6xl xl:text-[5.8rem] 2xl:text-[6.4rem]">
              Autonomous API Self-Healing Infrastructure
            </h1>

            <p className="mt-6 max-w-[42rem] text-base leading-8 text-text-muted sm:text-lg 2xl:max-w-[48rem]">
              Detect API failures, repair broken requests, and recover healthy traffic
              with a simple AI-native control surface.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {landingTabs.map((tab, index) => (
                <button
                  key={tab}
                  onClick={() =>
                    scrollToSection(index === 0 ? "hero" : index === 1 ? "architecture" : "metrics")
                  }
                  className={`rounded-full border px-3 py-2 text-[10px] uppercase tracking-[0.24em] transition ${
                    index === 1
                      ? "border-accent-live/24 bg-accent-live/10 text-accent-live"
                      : "border-white/8 bg-white/[0.03] text-text-muted hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {featureBullets.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * index, duration: 0.45 }}
                  className="glass-card flex items-center gap-3 px-4 py-3"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-accent-live/16 bg-accent-live/10">
                    <ChevronRight className="h-4 w-4 text-accent-live" />
                  </div>
                  <span className="text-sm text-white">{feature}</span>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={onEnterDashboard}
                className="inline-flex items-center gap-2 rounded-2xl border border-accent-success/25 bg-accent-success/12 px-5 py-3.5 text-sm font-semibold text-accent-success transition hover:border-accent-success/42 hover:bg-accent-success/16"
              >
                Launch Dashboard
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => scrollToSection("architecture")}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3.5 text-sm font-semibold text-white transition hover:border-white/16 hover:bg-white/[0.05]"
              >
                View Architecture
                <BrainCircuit className="h-4 w-4 text-accent-ai" />
              </button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="glass-panel px-4 py-4">
                <div className="text-[11px] uppercase tracking-[0.28em] text-text-muted">
                  Runtime signal
                </div>
                <div className="mt-3 text-xl font-semibold text-white">
                  {snapshot?.backend_label ?? "Adaptive mock lab"}
                </div>
                <div className="mt-2 text-sm leading-7 text-text-muted">
                  Demo-ready and dashboard-linked.
                </div>
              </div>
              <div className="glass-panel px-4 py-4">
                <div className="text-[11px] uppercase tracking-[0.28em] text-text-muted">
                  Recovery confidence
                </div>
                <div className="mt-3 text-xl font-semibold text-white">
                  {recoveryConfidence}%
                </div>
                <div className="mt-2 text-sm leading-7 text-text-muted">
                  Clear repair confidence.
                </div>
              </div>
              <div className="glass-panel px-4 py-4">
                <div className="text-[11px] uppercase tracking-[0.28em] text-text-muted">
                  Event posture
                </div>
                <div className="mt-3 text-xl font-semibold text-white">
                  {event?.type?.replace("_", " ") ?? "route drift"}
                </div>
                <div className="mt-2 text-sm leading-7 text-text-muted">
                  Built for live API change.
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.08 }}
            className="relative min-w-0"
          >
            <SystemArchitectureBoard
              snapshot={snapshot}
              event={event}
              workflow={workflow}
            />

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {heroMetrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.14 + index * 0.08, duration: 0.45 }}
                  className="glass-card px-4 py-4"
                >
                  <div className="text-[11px] uppercase tracking-[0.25em] text-text-muted">
                    {metric.label}
                  </div>
                  <div className="mt-3 text-2xl font-semibold text-white">
                    <CountUp value={metric.value} suffix={metric.suffix} />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        <section id="features" className="pt-4 lg:pt-10">
          <SectionHeading
            eyebrow="How ReMorph Works"
            title="One recovery loop, broken into four operator-grade stages."
            body="A simple recovery loop with a premium product feel."
          />

          <div className="mt-8 grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
            {workflowCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.article
                  key={card.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                  className="glass-panel group p-5"
                >
                  <div className={`rounded-[22px] border border-white/8 bg-gradient-to-br ${card.tone} p-4`}>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/25">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold text-white">{card.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-text-muted">{card.body}</p>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </section>

        <section
          id="architecture"
          className="mt-18 grid gap-6 xl:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)]"
        >
          <div className="glass-panel p-6 lg:p-7">
            <SectionHeading
              eyebrow="Architecture"
              title="See the product, not a wall of explanation."
              body="The demo panel shows the ReMorph loop clearly: failure in, repair, healthy response out."
            />

            <div className="mt-8 space-y-4">
              {[
                {
                  title: "Typed request demo",
                  body: "Like a live product surface, not a slide.",
                  icon: BrainCircuit,
                },
                {
                  title: "Visible repair states",
                  body: "Step through detect, repair, and recover.",
                  icon: BrainCircuit,
                },
                {
                  title: "Healthy output",
                  body: "Show the corrected endpoint and recovery metrics.",
                  icon: ShieldCheck,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="glass-card flex gap-4 px-4 py-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.04]">
                      <Icon className="h-5 w-5 text-accent-live" />
                    </div>
                    <div>
                      <div className="text-base font-semibold text-white">{item.title}</div>
                      <div className="mt-2 text-sm leading-7 text-text-muted">{item.body}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-panel p-6 lg:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.3em] text-text-muted">
                  Operational narrative
                </div>
                <div className="mt-2 text-2xl font-semibold text-white">
                  Product demo first
                </div>
              </div>
              <StatusPill
                tone={workflow?.success ? "success" : "live"}
                label={workflow?.success ? "Recovery verified" : "Adaptive loop active"}
              />
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {[
                ["Failure", event?.message ?? "Schema mismatch detected."],
                ["Repair", event?.healing_action ?? "payload rewrite"],
                ["Mode", workflow?.agent_type ?? "adaptive"],
                ["Route", workflow?.selected_endpoint_path ?? "/api/v2/finance/ledger"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
                  <div className="text-[11px] uppercase tracking-[0.25em] text-text-muted">{label}</div>
                  <div className="mt-3 text-sm leading-7 text-white break-words">{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[24px] border border-white/8 bg-black/25 p-5">
              <div className="text-[11px] uppercase tracking-[0.28em] text-text-muted">
                Flow
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white">
                {[
                  "Request",
                  "Detect",
                  "Repair",
                  "Retry",
                  "Healthy",
                ].map((stage, index) => (
                  <div key={stage} className="flex items-center gap-3">
                    <span className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-2">
                      {stage}
                    </span>
                    {index < 4 ? <ArrowRight className="h-4 w-4 text-accent-live" /> : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-18 grid gap-6 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
          <div className="glass-panel p-6 lg:p-7">
            <SectionHeading
              eyebrow="Why It Matters"
              title="Minimal copy. strong product value."
              body="Short, clean, and investor-friendly."
            />

            <div className="mt-8 space-y-3">
              {valueProps.map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.38, delay: index * 0.05 }}
                  className="glass-card flex items-start gap-3 px-4 py-4"
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-accent-success/20 bg-accent-success/10">
                    <ShieldCheck className="h-4 w-4 text-accent-success" />
                  </div>
                  <span className="text-sm leading-7 text-white">{item}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div id="docs" className="glass-panel p-6 lg:p-7">
            <SectionHeading
              eyebrow="Platform"
              title="A cleaner landing page with an interactive demo."
              body="Inspired by modern developer platforms: premium layout, lighter copy, stronger interaction."
            />

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="glass-card px-4 py-4">
                <div className="text-base font-semibold text-white">Animated API demo</div>
                <div className="mt-2 text-sm leading-7 text-text-muted">
                  Typed request, failure state, repaired response.
                </div>
              </div>
              <div className="glass-card px-4 py-4">
                <div className="text-base font-semibold text-white">Dashboard CTA</div>
                <div className="mt-2 text-sm leading-7 text-text-muted">
                  Clear path from landing to control center.
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[24px] border border-white/8 bg-gradient-to-br from-accent-ai/14 via-transparent to-accent-live/10 p-5">
              <div className="text-sm font-semibold text-white">
                ReMorph feels more like a product now.
              </div>
              <p className="mt-3 text-sm leading-7 text-text-muted">
                Better hero rhythm, simpler copy, and a stronger live-demo surface.
              </p>
            </div>
          </div>
        </section>

        <section id="metrics" className="mt-18">
          <SectionHeading
            eyebrow="Live Metrics Showcase"
            title="Simple metrics. clean presentation."
            body="Just enough signal to support the story."
          />

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {heroMetrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.42, delay: index * 0.07 }}
                className="glass-panel p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[11px] uppercase tracking-[0.28em] text-text-muted">
                    {metric.label}
                  </div>
                  <Clock3 className="h-4 w-4 text-accent-live" />
                </div>
                <div className="mt-5 text-4xl font-semibold text-white">
                  <CountUp value={metric.value} suffix={metric.suffix} />
                </div>
                <div className="mt-3 text-sm leading-7 text-text-muted">
                  {metric.label === "Success rate"
                    ? "Healing confidence reinforced by retry verification and workflow telemetry."
                    : metric.label === "Avg recovery time"
                      ? "Average time from trapped failure to healthy response."
                      : metric.label === "Requests healed"
                        ? "Recovered request volume across the visible telemetry window."
                        : "Monitors, telemetry surfaces, and environment checks currently represented."}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mt-18 pb-4">
          <div className="glass-panel overflow-hidden p-6 lg:p-8">
            <div className="landing-cta-glow" />
            <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div>
                <div className="text-[11px] uppercase tracking-[0.32em] text-text-muted">
                  Final CTA
                </div>
                <h2 className="mt-3 text-3xl font-semibold text-white lg:text-[2.7rem]">
                  Enter ReMorph Control Center
                </h2>
                <p className="mt-4 max-w-[42rem] text-base leading-8 text-text-muted">
                  Open the live dashboard to inspect recovery episodes, diff views,
                  reasoning traces, retry workflows, benchmark lift, and operator-ready telemetry.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={onEnterDashboard}
                  className="inline-flex items-center gap-2 rounded-2xl border border-accent-live/28 bg-accent-live/12 px-5 py-3.5 text-sm font-semibold text-accent-live transition hover:border-accent-live/42 hover:bg-accent-live/18"
                >
                  Launch Dashboard
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => scrollToSection("hero")}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3.5 text-sm font-semibold text-white transition hover:border-white/16 hover:bg-white/[0.05]"
                >
                  Back to top
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="max-w-[46rem]">
      <div className="text-[11px] uppercase tracking-[0.32em] text-text-muted">
        {eyebrow}
      </div>
      <h2 className="mt-3 text-3xl font-semibold leading-tight text-white lg:text-[2.65rem]">
        {title}
      </h2>
      <p className="mt-4 text-base leading-8 text-text-muted">{body}</p>
    </div>
  );
}

function CountUp({
  value,
  suffix,
}: {
  value: number;
  suffix: string;
}) {
  const roundedValue = Math.round(value);

  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.4 }}
    >
      {roundedValue.toLocaleString()}
      {suffix}
    </motion.span>
  );
}
