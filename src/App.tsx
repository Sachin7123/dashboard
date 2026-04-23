import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Ring, Sphere, Sparkles, Stars } from '@react-three/drei';
import * as THREE from 'three';
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  CircleDashed,
  CpuIcon,
  FlaskConical,
  Layers3,
  Lock,
  Orbit,
  Route,
  Siren,
  TerminalSquare,
  Waves,
  Wifi,
  WifiOff,
} from 'lucide-react';
import {
  type EngineState,
  getTelemetryConfig,
  loadLocalTelemetry,
  loadTelemetry,
  type ReMorphEvent,
  type TelemetrySnapshot,
} from './lib/telemetry';

type EventFilter = 'all' | ReMorphEvent['type'];

const MAX_EVENTS = 80;
const filterConfig: Array<{ id: EventFilter; label: string; icon: ReactNode }> = [
  { id: 'all', label: 'All Intercepts', icon: <Activity className="h-4 w-4" /> },
  { id: 'payload_drift', label: 'Payload Drift', icon: <Layers3 className="h-4 w-4" /> },
  { id: 'route_drift', label: 'Route Drift', icon: <Route className="h-4 w-4" /> },
  { id: 'auth_drift', label: 'Auth Drift', icon: <Lock className="h-4 w-4" /> },
  { id: 'server_fault', label: 'Server Faults', icon: <Siren className="h-4 w-4" /> },
];

const stateColorMap: Record<EngineState, string> = {
  idle: '#c084fc',
  thinking: '#fbbf24',
  healing: '#22d3ee',
  success: '#34d399',
};

function NeuralOrb({ state, activeLoad }: { state: EngineState; activeLoad: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);
  const signalRingRef = useRef<THREE.Mesh>(null);

  useFrame((clock) => {
    const t = clock.clock.elapsedTime;
    const loadBoost = 1 + activeLoad * 0.3;

    if (meshRef.current) {
      meshRef.current.rotation.x = t * 0.18 * loadBoost;
      meshRef.current.rotation.y = t * 0.28 * loadBoost;

      const pulse =
        state === 'idle'
          ? 0.02 * Math.sin(t * 1.8)
          : state === 'thinking'
            ? 0.06 * Math.sin(t * 4.5)
            : state === 'healing'
              ? 0.09 * Math.sin(t * 7)
              : 0.12 * Math.sin(t * 8.5);
      const scale = 1.04 + pulse;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.15);
    }

    if (materialRef.current) {
      const currentColor = new THREE.Color(stateColorMap[state]);
      materialRef.current.color.lerp(currentColor, 0.08);
      materialRef.current.emissive.lerp(currentColor, 0.08);
      materialRef.current.emissiveIntensity = 1.2 + activeLoad * 0.7;
      materialRef.current.distort = THREE.MathUtils.lerp(
        materialRef.current.distort ?? 0.35,
        state === 'healing' ? 0.9 : state === 'thinking' ? 0.65 : 0.45,
        0.12,
      );
      materialRef.current.speed = THREE.MathUtils.lerp(
        materialRef.current.speed ?? 2,
        state === 'success' ? 6 : state === 'healing' ? 5 : state === 'thinking' ? 4 : 2.5,
        0.12,
      );
    }

    if (outerRingRef.current) {
      outerRingRef.current.rotation.z = t * 0.28;
      outerRingRef.current.scale.setScalar(1 + activeLoad * 0.06);
    }

    if (signalRingRef.current) {
      signalRingRef.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.8) * 0.2;
      signalRingRef.current.rotation.y = t * 0.18;
      signalRingRef.current.scale.setScalar(1.15 + Math.abs(Math.sin(t * 2.4)) * 0.08);
    }
  });

  return (
    <group>
      <Float speed={1.8} rotationIntensity={0.45} floatIntensity={0.45}>
        <Sphere ref={meshRef} args={[1.55, 96, 96]}>
          <MeshDistortMaterial
            ref={materialRef}
            color={stateColorMap[state]}
            emissive={stateColorMap[state]}
            emissiveIntensity={1.4}
            roughness={0.16}
            metalness={0.82}
            distort={0.45}
            speed={2.2}
            wireframe
            transparent
            opacity={0.88}
          />
        </Sphere>

        <Ring ref={outerRingRef} args={[2.15, 2.22, 72]} rotation={[Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color={stateColorMap[state]} transparent opacity={0.3} side={THREE.DoubleSide} />
        </Ring>

        <Ring ref={signalRingRef} args={[2.55, 2.61, 72]} rotation={[Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color="#ffffff" transparent opacity={0.12} side={THREE.DoubleSide} />
        </Ring>
      </Float>

      <Sparkles
        count={state === 'healing' ? 180 : state === 'thinking' ? 120 : 70}
        scale={state === 'healing' ? 6 : 5}
        size={state === 'healing' ? 6 : 4}
        speed={state === 'healing' ? 0.8 : 0.45}
        color={stateColorMap[state]}
      />
    </group>
  );
}

export default function App() {
  const [snapshot, setSnapshot] = useState<TelemetrySnapshot>(() => loadLocalTelemetry(MAX_EVENTS));
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<EventFilter>('all');
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [engineState, setEngineState] = useState<EngineState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const previousHeadId = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const refresh = async () => {
      try {
        const nextSnapshot = await loadTelemetry(MAX_EVENTS);
        if (!mounted) return;

        setSnapshot(nextSnapshot);
        setErrorMessage(null);
        setSelectedEventId((current) => {
          if (current && nextSnapshot.events.some((event) => event.id === current)) {
            return current;
          }
          return nextSnapshot.events[0]?.id ?? null;
        });
      } catch (error) {
        if (!mounted) return;
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load telemetry');
      }
    };

    void refresh();
    const { pollMs } = getTelemetryConfig();
    const interval = window.setInterval(() => {
      if (isLiveMode) {
        void refresh();
      }
    }, pollMs);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [isLiveMode]);

  useEffect(() => {
    const headEvent = snapshot.events[0];
    if (!headEvent) {
      setEngineState('idle');
      return;
    }

    const nextHeadId = `${headEvent.id}:${headEvent.timestamp}`;
    if (previousHeadId.current === nextHeadId) {
      return;
    }

    previousHeadId.current = nextHeadId;
    setEngineState('thinking');

    const timers = [
      window.setTimeout(() => setEngineState('healing'), 700),
      window.setTimeout(() => setEngineState(headEvent.status === 'healed' ? 'success' : 'thinking'), 1500),
      window.setTimeout(() => setEngineState('idle'), 2800),
    ];

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [snapshot.events]);

  const filteredEvents = useMemo(() => {
    if (activeFilter === 'all') {
      return snapshot.events;
    }
    return snapshot.events.filter((event) => event.type === activeFilter);
  }, [activeFilter, snapshot.events]);

  const selectedEvent = useMemo(() => {
    const chosen = filteredEvents.find((event) => event.id === selectedEventId);
    return chosen ?? filteredEvents[0] ?? snapshot.events[0] ?? null;
  }, [filteredEvents, selectedEventId, snapshot.events]);

  useEffect(() => {
    if (selectedEvent && selectedEvent.id !== selectedEventId) {
      setSelectedEventId(selectedEvent.id);
    }
  }, [selectedEvent, selectedEventId]);

  const stats = useMemo(() => {
    const total = snapshot.events.length || 1;
    const healed = snapshot.events.filter((event) => event.status === 'healed').length;
    const failed = snapshot.events.filter((event) => event.status === 'failed' || event.status === 'unhandled').length;
    const avgLatency = snapshot.events.reduce((sum, event) => sum + event.processing_ms, 0) / total;
    const avgConfidence = snapshot.events.reduce((sum, event) => sum + event.confidence, 0) / total;

    return {
      successRate: Math.round((healed / total) * 100),
      unresolved: failed,
      avgLatency: Math.round(avgLatency),
      avgConfidence: Math.round(avgConfidence * 100),
      healed,
    };
  }, [snapshot.events]);

  const activeLoad = Math.min(1, filteredEvents.length / 24);
  const stageStatus = selectedEvent ? buildStageStatus(selectedEvent) : [];
  const traceSteps = selectedEvent ? parseReasoning(selectedEvent.reasoning) : [];

  return (
    <div className="h-screen overflow-hidden bg-obsidian-bg text-text-primary">
      <div className="cinematic-bg" />
      <div className="mx-auto flex h-full w-full max-w-[1800px] flex-col gap-4 p-4">
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="flex min-h-0 flex-col gap-4">
            <section className="glass-panel p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="orb-badge">
                    <Orbit className="h-5 w-5 text-accent-ai" />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.35em] text-text-muted">ReMorph</p>
                    <h1 className="text-lg font-semibold tracking-[0.18em] uppercase">Obsidian Control Plane</h1>
                  </div>
                </div>
                <StatusPill tone={snapshot.connected ? 'success' : 'muted'} label={snapshot.connected ? 'Backend Live' : 'Data File'} />
              </div>

              <div className="mt-5 grid gap-3">
                <SignalRow label="Telemetry Source" value={snapshot.backendLabel} valueClass="font-mono text-[11px]" />
                <SignalRow label="Last Sync" value={formatClock(snapshot.lastUpdated)} valueClass="font-mono text-[11px]" />
                <SignalRow label="Refresh Loop" value={isLiveMode ? 'ACTIVE' : 'PAUSED'} valueClass={isLiveMode ? 'text-accent-live' : 'text-text-muted'} />
                <SignalRow label="Local Dataset" value="src/data/synthetic_data.json" valueClass="font-mono text-[11px]" />
              </div>

              <button
                onClick={() => setIsLiveMode((current) => !current)}
                className={`mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.28em] transition-all ${
                  isLiveMode
                    ? 'border-accent-live/30 bg-accent-live/10 text-accent-live shadow-[0_0_24px_rgba(34,211,238,0.15)]'
                    : 'border-white/6 bg-white/[0.02] text-text-muted hover:border-white/10'
                }`}
              >
                {isLiveMode ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                {isLiveMode ? 'Live Ingestion On' : 'Live Ingestion Off'}
              </button>

              {errorMessage ? (
                <div className="mt-4 rounded-2xl border border-accent-error/20 bg-accent-error/10 p-3 text-xs text-accent-error">
                  {errorMessage}
                </div>
              ) : null}
            </section>

            <section className="glass-panel min-h-0 flex flex-1 flex-col p-3">
              <div className="px-3 py-3 text-[11px] uppercase tracking-[0.35em] text-text-muted">Telemetry Filters</div>
              <div className="flex flex-col gap-1">
                {filterConfig.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveFilter(item.id)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-all ${
                      item.id === activeFilter
                        ? 'border border-accent-ai/30 bg-white/[0.05] text-white shadow-[0_0_18px_rgba(192,132,252,0.12)]'
                        : 'border border-transparent text-text-muted hover:border-white/8 hover:bg-white/[0.03] hover:text-white'
                    }`}
                  >
                    <span className={item.id === activeFilter ? 'text-accent-ai' : ''}>{item.icon}</span>
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="ml-auto text-[11px] font-mono text-text-muted">
                      {item.id === 'all' ? snapshot.events.length : snapshot.events.filter((event) => event.type === item.id).length}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </aside>

          <main className="flex min-h-0 min-w-0 flex-col gap-4">
            <section className="glass-panel relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(192,132,252,0.15),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(34,211,238,0.12),transparent_35%)]" />
              <div className="relative grid grid-cols-1 gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_280px]">
                <div className="relative overflow-hidden rounded-[24px] border border-white/6 bg-black/10">
                  <div className="absolute left-6 top-6 z-10 max-w-xl">
                    <p className="text-[11px] uppercase tracking-[0.35em] text-text-muted">Neural Engine</p>
                    <h2 className="mt-2 text-2xl font-semibold">Adaptive Repair Core</h2>
                    <p className="mt-3 text-sm leading-6 text-text-muted">
                      The dashboard now uses the bundled `src/data` dataset for local viewing and automatically switches to backend telemetry when the endpoint is reachable.
                    </p>
                  </div>

                  <div className="h-[clamp(320px,48vh,560px)] w-full">
                    <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 1.6]}>
                      <ambientLight intensity={0.55} />
                      <pointLight position={[8, 8, 10]} intensity={1.4} color="#c084fc" />
                      <pointLight position={[-8, -4, -8]} intensity={1.1} color="#22d3ee" />
                      <NeuralOrb state={engineState} activeLoad={activeLoad} />
                      <Stars radius={60} depth={50} count={2200} factor={4} saturation={0} fade speed={1} />
                    </Canvas>
                  </div>

                  <div className="absolute bottom-5 left-5 right-5">
                    <div className="grid gap-3 md:grid-cols-4">
                      {stageStatus.map((stage) => (
                        <PipelineNode key={stage.label} {...stage} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <MetricDetailCard title="Recovered" subtitle="episodes healed" value={stats.healed} icon={<CheckCircle2 className="h-4 w-4" />} tone="success" />
                  <MetricDetailCard title="Engine State" subtitle="current orchestration mode" value={engineState} icon={<BrainCircuit className="h-4 w-4" />} tone={engineTone(engineState)} />
                  <MetricDetailCard title="Backend" subtitle="telemetry origin" value={snapshot.source === 'remote' ? 'remote' : 'local file'} icon={<Waves className="h-4 w-4" />} tone={snapshot.source === 'remote' ? 'live' : 'muted'} />
                </div>
              </div>
            </section>

            <section className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
              <div className="flex min-h-0 flex-col gap-4">
                <div className="glass-panel shrink-0 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.35em] text-text-muted">Telemetry Summary</p>
                      <h3 className="mt-1 text-lg font-semibold">Runtime overview</h3>
                    </div>
                    <div className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-xs font-mono text-text-muted">
                      {filteredEvents.length} visible
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <MetricCard title="Success Rate" value={`${stats.successRate}%`} tone="success" />
                    <MetricCard title="Avg Latency" value={`${stats.avgLatency}ms`} tone="live" />
                    <MetricCard title="Confidence" value={`${stats.avgConfidence}%`} tone="ai" />
                    <MetricCard title="Unresolved" value={stats.unresolved} tone="error" />
                  </div>
                </div>

                <div className="glass-panel flex min-h-[360px] flex-col overflow-hidden">
                  <div className="flex items-center justify-between border-b border-white/6 px-4 py-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.35em] text-text-muted">Cognitive Trace</p>
                      <h3 className="mt-1 text-base font-semibold">Structured reasoning stream</h3>
                    </div>
                    <TerminalSquare className="h-4 w-4 text-accent-ai" />
                  </div>

                  <div className="custom-scrollbar flex-1 overflow-y-auto bg-[#08090c]/70 px-4 py-4 font-mono text-sm">
                    {selectedEvent ? (
                      <div className="space-y-4">
                        <TraceRow label="EVENT" value={selectedEvent.id} tone="muted" />
                        <TraceRow label="TARGET" value={selectedEvent.target_url} tone="live" />
                        <TraceRow label="ACTION" value={selectedEvent.healing_action} tone="ai" />
                        <TraceRow label="STRATEGY" value={selectedEvent.strategy} tone="success" />
                        <TraceRow label="TRACE" value={`${traceSteps.length} structured steps`} tone="muted" />

                        <div className="mt-4 space-y-3 border-l border-accent-ai/20 pl-4">
                          {traceSteps.map((step, index) => (
                            <motion.div
                              key={`${step}-${index}`}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="rounded-xl border border-white/6 bg-white/[0.02] p-3"
                            >
                              <div className="text-[10px] uppercase tracking-[0.3em] text-accent-ai">Step {index + 1}</div>
                              <div className="mt-2 text-sm leading-6 text-text-muted">{step}</div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center text-text-muted">Awaiting telemetry selection...</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid min-h-0 min-w-0 grid-cols-1 gap-4">
                <div className="glass-panel flex min-h-[300px] flex-col overflow-hidden">
                  <div className="flex items-center justify-between border-b border-white/6 px-4 py-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.35em] text-text-muted">Transformation Logic</p>
                      <h3 className="mt-1 text-base font-semibold">Drift diff + recovery output</h3>
                    </div>
                    <FlaskConical className="h-4 w-4 text-accent-live" />
                  </div>
                  <div className="min-h-0 flex-1 p-4">
                    {selectedEvent ? <JsonDiffViewer event={selectedEvent} /> : <EmptyPanel label="Select an event to inspect the diff." />}
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
                  <div className="glass-panel p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.35em] text-text-muted">Operational Metadata</p>
                        <h3 className="mt-1 text-base font-semibold">Backend-aligned telemetry card</h3>
                      </div>
                      <CpuIcon className="h-4 w-4 text-accent-live" />
                    </div>

                    {selectedEvent ? (
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <SignalRow label="Docs Source" value={selectedEvent.diagnostics.docs_source} />
                        <SignalRow label="Source Component" value={selectedEvent.source_component} />
                        <SignalRow label="Retry Count" value={selectedEvent.retry_count} />
                        <SignalRow label="LLM Attempted" value={selectedEvent.diagnostics.llm_attempted ? 'yes' : 'no'} />
                        <SignalRow label="LLM Succeeded" value={selectedEvent.diagnostics.llm_succeeded ? 'yes' : 'no'} valueClass={selectedEvent.diagnostics.llm_succeeded ? 'text-accent-success' : 'text-accent-error'} />
                        <SignalRow label="Fallback Used" value={selectedEvent.diagnostics.fallback_used ? 'yes' : 'no'} valueClass={selectedEvent.diagnostics.fallback_used ? 'text-accent-pending' : 'text-text-muted'} />
                      </div>
                    ) : (
                      <EmptyPanel label="No metadata available." />
                    )}
                  </div>

                  <div className="glass-panel p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.35em] text-text-muted">Training Node</p>
                        <h3 className="mt-1 text-base font-semibold">Operator summary</h3>
                      </div>
                      <BrainCircuit className="h-4 w-4 text-accent-ai" />
                    </div>

                    {selectedEvent ? (
                      <div className="mt-4 space-y-3">
                        <InsightBadge label="Status" value={selectedEvent.status} tone={selectedEvent.status === 'healed' ? 'success' : 'error'} />
                        <InsightBadge label="Confidence" value={`${Math.round(selectedEvent.confidence * 100)}%`} tone="ai" />
                        <InsightBadge label="Latency" value={`${selectedEvent.processing_ms}ms`} tone="live" />
                        <InsightBadge label="Drift Type" value={labelForType(selectedEvent.type)} tone="muted" />
                      </div>
                    ) : (
                      <EmptyPanel label="Select an event to inspect insights." />
                    )}
                  </div>
                </div>

                <div className="glass-panel flex min-h-[320px] flex-col overflow-hidden">
                  <div className="flex items-center justify-between border-b border-white/6 px-4 py-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.35em] text-text-muted">Active Event Feed</p>
                      <h3 className="mt-1 text-base font-semibold">{activeFilter === 'all' ? 'All recovery episodes' : labelForType(activeFilter)}</h3>
                    </div>
                    <StatusPill tone={engineTone(engineState)} label={engineState.toUpperCase()} />
                  </div>

                  <div className="custom-scrollbar flex-1 overflow-y-auto px-3 py-3">
                    <AnimatePresence initial={false}>
                      {filteredEvents.map((event, index) => (
                        <motion.button
                          layout
                          initial={{ opacity: 0, y: -12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.28, delay: index * 0.015 }}
                          key={`${event.id}-${event.timestamp}`}
                          onClick={() => setSelectedEventId(event.id)}
                          className={`glass-card mb-3 w-full overflow-hidden p-4 text-left ${selectedEvent?.id === event.id ? 'glass-card-active' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <MethodBadge method={event.method} />
                                <StatusDot status={event.status} />
                                <span className="text-[11px] uppercase tracking-[0.25em] text-text-muted">{labelForType(event.type)}</span>
                              </div>
                              <p className="mt-3 truncate font-mono text-sm text-white">{shortUrl(event.target_url)}</p>
                              <p className="mt-1 text-sm text-text-muted">{event.message}</p>
                            </div>

                            <div className="text-right text-xs font-mono text-text-muted">
                              <div>{formatClock(event.timestamp)}</div>
                              <div className="mt-2 text-[11px] uppercase tracking-[0.25em] text-text-muted/70">{event.processing_ms}ms</div>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center gap-2">
                            <ScoreBar value={event.confidence} tone={event.status === 'healed' ? 'success' : 'error'} />
                            <span className="w-14 text-right text-xs font-mono text-text-muted">{Math.round(event.confidence * 100)}%</span>
                          </div>
                        </motion.button>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, tone }: { title: string; value: string | number; tone: 'success' | 'live' | 'ai' | 'error' }) {
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="text-[11px] uppercase tracking-[0.3em] text-text-muted">{title}</div>
      <div className={`mt-3 text-2xl font-semibold ${toneClass(tone)}`}>{value}</div>
    </div>
  );
}

function MetricDetailCard({
  title,
  subtitle,
  value,
  icon,
  tone,
}: {
  title: string;
  subtitle: string;
  value: string | number;
  icon: ReactNode;
  tone: 'success' | 'live' | 'ai' | 'error' | 'muted';
}) {
  return (
    <div className="glass-card flex-1 rounded-[24px] p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.28em] text-text-muted">{title}</div>
          <div className="mt-1 text-sm text-text-muted">{subtitle}</div>
        </div>
        <div className={`rounded-full border border-white/10 p-2 ${toneClass(tone)}`}>{icon}</div>
      </div>
      <div className={`mt-6 text-3xl font-semibold capitalize ${toneClass(tone)}`}>{value}</div>
    </div>
  );
}

function JsonDiffViewer({ event }: { event: ReMorphEvent }) {
  const leftTitle =
    event.type === 'payload_drift'
      ? 'Broken Payload'
      : event.type === 'route_drift'
        ? 'Broken Route'
        : event.type === 'auth_drift'
          ? 'Rejected Auth'
          : 'Fault State';
  const rightTitle =
    event.type === 'payload_drift'
      ? 'Healed Payload'
      : event.type === 'route_drift'
        ? 'Rewritten Route'
        : event.type === 'auth_drift'
          ? 'Injected Headers'
          : 'Recovered State';

  const leftData =
    event.type === 'payload_drift'
      ? event.raw_payload
      : event.type === 'route_drift'
        ? { url: event.target_url, error_code: event.error_code }
        : event.type === 'auth_drift'
          ? { error_code: event.error_code, headers: 'redacted' }
          : { error_code: event.error_code, message: event.message, status: event.status };

  const rightData =
    event.type === 'payload_drift'
      ? event.fixed_payload
      : event.type === 'route_drift'
        ? { url: event.fixed_url ?? 'unresolved', healing_action: event.healing_action }
        : event.type === 'auth_drift'
          ? event.fixed_headers
          : { status: event.status, action: event.healing_action, strategy: event.strategy };

  return (
    <div className="grid h-full min-h-[220px] grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_40px_minmax(0,1fr)]">
      <DiffCard title={leftTitle} tone="error" content={leftData} />
      <div className="hidden items-center justify-center lg:flex">
        <div className="rounded-full border border-white/8 bg-white/[0.04] p-2">
          <ArrowRight className="h-4 w-4 text-text-muted" />
        </div>
      </div>
      <DiffCard title={rightTitle} tone="success" content={rightData} />
    </div>
  );
}

function DiffCard({ title, tone, content }: { title: string; tone: 'success' | 'error'; content: unknown }) {
  return (
    <div className="relative flex min-h-[220px] flex-col overflow-hidden rounded-[24px] border border-white/8 bg-black/15">
      <div className="flex items-center justify-between border-b border-white/6 px-4 py-3">
        <span className={`text-[11px] uppercase tracking-[0.3em] ${toneClass(tone)}`}>{title}</span>
        <CircleDashed className={`h-4 w-4 ${toneClass(tone)}`} />
      </div>
      <div className="custom-scrollbar flex-1 overflow-auto px-4 py-4 font-mono text-sm leading-6 text-text-muted">
        <pre className="whitespace-pre-wrap break-all">{JSON.stringify(content ?? {}, null, 2)}</pre>
      </div>
    </div>
  );
}

function PipelineNode({ label, active, completed }: { label: string; active: boolean; completed: boolean }) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 backdrop-blur ${
        active
          ? 'border-accent-live/30 bg-accent-live/10 shadow-[0_0_24px_rgba(34,211,238,0.12)]'
          : completed
            ? 'border-accent-success/20 bg-accent-success/10'
            : 'border-white/6 bg-white/[0.03]'
      }`}
    >
      <div className="text-[11px] uppercase tracking-[0.3em] text-text-muted">{label}</div>
      <div className={`mt-2 text-sm font-medium ${active ? 'text-white' : 'text-text-muted'}`}>{active ? 'Active signal' : completed ? 'Complete' : 'Standby'}</div>
    </div>
  );
}

function ScoreBar({ value, tone }: { value: number; tone: 'success' | 'error' }) {
  const width = `${Math.max(8, Math.round(value * 100))}%`;
  return (
    <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
      <div className={`h-full rounded-full ${tone === 'success' ? 'bg-accent-success' : 'bg-accent-error'}`} style={{ width }} />
    </div>
  );
}

function InsightBadge({ label, value, tone }: { label: string; value: string; tone: 'success' | 'live' | 'ai' | 'error' | 'muted' }) {
  return (
    <div className="rounded-2xl border border-white/6 bg-white/[0.03] px-3 py-3">
      <div className="text-[11px] uppercase tracking-[0.28em] text-text-muted">{label}</div>
      <div className={`mt-2 text-sm font-medium ${toneClass(tone)}`}>{value}</div>
    </div>
  );
}

function SignalRow({ label, value, valueClass }: { label: string; value: string | number | null; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/6 py-2 last:border-b-0">
      <span className="text-[11px] uppercase tracking-[0.3em] text-text-muted">{label}</span>
      <span className={`truncate text-right text-sm text-text-primary ${valueClass ?? ''}`}>{value ?? '--'}</span>
    </div>
  );
}

function TraceRow({ label, value, tone }: { label: string; value: string; tone: 'success' | 'live' | 'ai' | 'error' | 'muted' }) {
  return (
    <div className="flex items-start gap-3">
      <span className={`mt-0.5 text-[10px] uppercase tracking-[0.3em] ${toneClass(tone)}`}>{label}</span>
      <span className="break-all text-text-muted">{value}</span>
    </div>
  );
}

function MethodBadge({ method }: { method: string }) {
  const palette =
    method === 'GET'
      ? 'bg-sky-500/12 text-sky-300'
      : method === 'POST'
        ? 'bg-emerald-500/12 text-emerald-300'
        : method === 'PATCH'
          ? 'bg-amber-500/12 text-amber-300'
          : 'bg-rose-500/12 text-rose-300';
  return <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${palette}`}>{method}</span>;
}

function StatusPill({ tone, label }: { tone: 'success' | 'live' | 'ai' | 'error' | 'muted'; label: string }) {
  return <span className={`rounded-full border border-white/8 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] ${toneClass(tone)}`}>{label}</span>;
}

function StatusDot({ status }: { status: ReMorphEvent['status'] }) {
  const className = status === 'healed' ? 'bg-accent-success' : status === 'pending' ? 'bg-accent-pending' : 'bg-accent-error';
  return <span className={`h-2.5 w-2.5 rounded-full ${className}`} />;
}

function EmptyPanel({ label }: { label: string }) {
  return <div className="flex h-full min-h-[140px] items-center justify-center text-sm text-text-muted">{label}</div>;
}

function labelForType(type: EventFilter) {
  switch (type) {
    case 'payload_drift':
      return 'Payload Drift';
    case 'route_drift':
      return 'Route Drift';
    case 'auth_drift':
      return 'Auth Drift';
    case 'server_fault':
      return 'Server Fault';
    default:
      return 'All Intercepts';
  }
}

function shortUrl(url: string) {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}${parsed.pathname}`;
  } catch {
    return url;
  }
}

function formatClock(value: string | null) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

function toneClass(tone: 'success' | 'live' | 'ai' | 'error' | 'muted') {
  switch (tone) {
    case 'success':
      return 'text-accent-success';
    case 'live':
      return 'text-accent-live';
    case 'ai':
      return 'text-accent-ai';
    case 'error':
      return 'text-accent-error';
    default:
      return 'text-text-muted';
  }
}

function engineTone(state: EngineState): 'success' | 'live' | 'ai' | 'error' | 'muted' {
  switch (state) {
    case 'thinking':
      return 'ai';
    case 'healing':
      return 'live';
    case 'success':
      return 'success';
    default:
      return 'muted';
  }
}

function buildStageStatus(event: ReMorphEvent) {
  return [
    { label: 'Intercept', active: true, completed: true },
    { label: 'Reasoning', active: event.status !== 'pending', completed: true },
    { label: 'Patching', active: event.status === 'healed', completed: event.status === 'healed' },
    { label: 'Recovery', active: event.status === 'healed', completed: event.status === 'healed' },
  ];
}

function parseReasoning(reasoning: string) {
  const thoughtMatch = reasoning.match(/<think>([\s\S]*?)<\/think>/i);
  const thoughtBlock = thoughtMatch?.[1] ?? reasoning;
  const lines = thoughtBlock
    .split('\n')
    .map((line) => line.replace(/^\s*[-*>]?\s*/, '').trim())
    .filter(Boolean);

  if (lines.length > 0) return lines;
  return ['The backend did not provide a structured reasoning trace for this event.'];
}
