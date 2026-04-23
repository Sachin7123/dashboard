import * as React from "react";
import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  MeshDistortMaterial,
  Ring,
  Sphere,
  Sparkles,
  Stars,
} from "@react-three/drei";
import { CheckCircle2, Radar, Route } from "lucide-react";
import * as THREE from "three";
import { shortUrl } from "../../lib/dashboard";
import type { EngineState, RuntimeFlow } from "../../types/remorph";

const stateColorMap: Record<EngineState, string> = {
  idle: "#c084fc",
  thinking: "#fbbf24",
  healing: "#22d3ee",
  success: "#34d399",
};

function Orb({
  state,
  activeLoad,
}: {
  state: EngineState;
  activeLoad: number;
}) {
  const meshRef = React.useRef<THREE.Mesh>(null);
  const materialRef = React.useRef<any>(null);
  const outerRingRef = React.useRef<THREE.Mesh>(null);
  const signalRingRef = React.useRef<THREE.Mesh>(null);

  useFrame((clock) => {
    const t = clock.clock.elapsedTime;
    const loadBoost = 1 + activeLoad * 0.35;

    if (meshRef.current) {
      meshRef.current.rotation.x = t * 0.18 * loadBoost;
      meshRef.current.rotation.y = t * 0.3 * loadBoost;
      const pulse =
        state === "healing"
          ? 0.1 * Math.sin(t * 7)
          : state === "success"
            ? 0.13 * Math.sin(t * 8.5)
            : state === "thinking"
              ? 0.06 * Math.sin(t * 4.6)
              : 0.03 * Math.sin(t * 2.6);
      const scale = 1.02 + pulse;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.14);
    }

    if (materialRef.current) {
      const currentColor = new THREE.Color(stateColorMap[state]);
      materialRef.current.color.lerp(currentColor, 0.08);
      materialRef.current.emissive.lerp(currentColor, 0.08);
      materialRef.current.emissiveIntensity = 1.3 + activeLoad * 0.8;
      materialRef.current.distort = THREE.MathUtils.lerp(
        materialRef.current.distort ?? 0.4,
        state === "healing" ? 0.92 : 0.52,
        0.12,
      );
      materialRef.current.speed = THREE.MathUtils.lerp(
        materialRef.current.speed ?? 2.4,
        state === "success" ? 5.8 : state === "healing" ? 4.8 : 3.1,
        0.12,
      );
    }

    if (outerRingRef.current) {
      outerRingRef.current.rotation.z = t * 0.25;
      outerRingRef.current.scale.setScalar(1 + activeLoad * 0.06);
    }

    if (signalRingRef.current) {
      signalRingRef.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.8) * 0.22;
      signalRingRef.current.rotation.y = t * 0.18;
      signalRingRef.current.scale.setScalar(
        1.15 + Math.abs(Math.sin(t * 2.2)) * 0.08,
      );
    }
  });

  return (
    <group>
      <Float speed={1.8} rotationIntensity={0.45} floatIntensity={0.45}>
        <Sphere ref={meshRef} args={[1.48, 96, 96]}>
          <MeshDistortMaterial
            ref={materialRef}
            color={stateColorMap[state]}
            emissive={stateColorMap[state]}
            emissiveIntensity={1.35}
            roughness={0.18}
            metalness={0.84}
            distort={0.46}
            speed={2.1}
            wireframe
            transparent
            opacity={0.9}
          />
        </Sphere>

        <Ring
          ref={outerRingRef}
          args={[2.15, 2.22, 72]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshBasicMaterial
            color={stateColorMap[state]}
            transparent
            opacity={0.32}
            side={THREE.DoubleSide}
          />
        </Ring>

        <Ring
          ref={signalRingRef}
          args={[2.5, 2.56, 72]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.12}
            side={THREE.DoubleSide}
          />
        </Ring>
      </Float>

      <Sparkles
        count={state === "healing" ? 190 : state === "thinking" ? 130 : 90}
        scale={state === "healing" ? 6 : 5}
        size={state === "healing" ? 6 : 4}
        speed={state === "healing" ? 0.9 : 0.5}
        color={stateColorMap[state]}
      />
    </group>
  );
}

export function HeroFlow({
  flow,
  engineState,
  activeLoad,
}: {
  flow: RuntimeFlow | null;
  engineState: EngineState;
  activeLoad: number;
}) {
  return (
    <section className="glass-panel relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(192,132,252,0.18),transparent_35%),radial-gradient(circle_at_82%_22%,rgba(34,211,238,0.16),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_45%)]" />
      <div className="relative grid gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_280px] xl:p-5">
        <div className="relative overflow-hidden rounded-[28px] border border-white/8 bg-black/15">
          <div className="absolute inset-x-5 top-5 z-10 flex items-start justify-between gap-6 xl:inset-x-6 xl:top-6">
            <div className="max-w-xl">
              <p className="text-[11px] uppercase tracking-[0.35em] text-text-muted">
                System Flow
              </p>
              <h2 className="mt-2 text-xl font-semibold xl:text-2xl">
                From broken request to healed delivery
              </h2>
              <p className="mt-3 max-w-[40rem] text-sm leading-6 text-text-muted">
                ReMorph ingests a failing request, runs adaptive reasoning,
                patches the contract drift, and emits a validated output to the
                destination endpoint.
              </p>
            </div>
            <div className="hidden rounded-[24px] border border-white/8 bg-white/[0.04] p-4 backdrop-blur lg:block">
              <div className="text-[11px] uppercase tracking-[0.3em] text-text-muted">
                Confidence
              </div>
              <div className="mt-2 text-3xl font-semibold text-accent-ai">
                {flow?.confidence_score ?? 0}%
              </div>
            </div>
          </div>

          <div className="absolute inset-x-8 top-28 bottom-18 hidden xl:block">
            <div className="relative h-full">
              <div className="absolute left-[18%] right-[18%] top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-white/12 to-transparent" />
              <motion.div
                className="flow-packet request"
                initial={{ x: "-18vw", opacity: 0 }}
                animate={{ x: "0vw", opacity: 1 }}
                transition={{
                  repeat: Infinity,
                  duration: 4.8,
                  ease: "easeInOut",
                }}
                style={{ top: "calc(50% - 18px)", left: "18%" }}
              >
                ingress
              </motion.div>
              <motion.div
                className="flow-packet healed"
                initial={{ x: "-2vw", opacity: 0 }}
                animate={{ x: "12vw", opacity: 1 }}
                transition={{
                  repeat: Infinity,
                  duration: 4.8,
                  ease: "easeInOut",
                  delay: 1.9,
                }}
                style={{ top: "calc(50% + 16px)", left: "42%" }}
              >
                healed
              </motion.div>
            </div>
          </div>

          <div className="grid min-h-[22rem] grid-cols-1 xl:min-h-[25rem] xl:grid-cols-[180px_minmax(0,1fr)_180px] 2xl:min-h-[27rem] 2xl:grid-cols-[200px_minmax(0,1fr)_200px]">
            <div className="hidden p-5 xl:flex xl:flex-col xl:justify-center">
              <PacketCard
                label={flow?.request_packet.label ?? "Incoming request"}
                detail={
                  flow?.request_packet.detail ?? "Awaiting request stream"
                }
                tone="request"
              />
            </div>

            <div className="relative h-[20rem] md:h-[22rem] xl:h-full">
              <Canvas
                camera={{ position: [0, 0, 6.8], fov: 38 }}
                dpr={[1, 1.35]}
              >
                <ambientLight intensity={0.55} />
                <pointLight
                  position={[8, 8, 10]}
                  intensity={1.2}
                  color="#c084fc"
                />
                <pointLight
                  position={[-8, -4, -8]}
                  intensity={0.95}
                  color="#22d3ee"
                />
                <Orb state={engineState} activeLoad={activeLoad} />
                <Stars
                  radius={54}
                  depth={42}
                  count={1500}
                  factor={3.2}
                  saturation={0}
                  fade
                  speed={0.8}
                />
              </Canvas>
            </div>

            <div className="hidden p-5 xl:flex xl:flex-col xl:justify-center">
              <PacketCard
                label={flow?.destination_packet.label ?? "Destination"}
                detail={
                  flow?.destination_packet.detail ??
                  "Awaiting healed destination"
                }
                tone="healed"
              />
            </div>
          </div>

          <div className="absolute inset-x-4 bottom-4 xl:inset-x-5 xl:bottom-5">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {(flow?.stages ?? []).map((stage, index) => (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <StageChip
                    label={stage.label}
                    detail={stage.detail}
                    status={stage.status}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          <MetricPanel
            icon={<CheckCircle2 className="h-4 w-4" />}
            eyebrow="Completion"
            title={flow?.completion_badge ?? "Ready"}
            detail="Validated recovery badge"
            value={
              flow?.confidence_score
                ? `${flow.confidence_score}% confidence`
                : "Standing by"
            }
            tone="success"
          />
          <MetricPanel
            icon={<Radar className="h-4 w-4" />}
            eyebrow="Latency Profile"
            title={`${flow?.network.latency_ms ?? 0}ms`}
            detail={`Retries ${(flow?.network.retries ?? 0).toString()}`}
            value={`Timeout risk ${flow?.network.timeout_risk ?? "low"}`}
            tone="live"
          />
          <MetricPanel
            icon={<Route className="h-4 w-4" />}
            eyebrow="Destination"
            title={shortUrl(
              flow?.destination_packet.detail ?? "Awaiting endpoint",
            )}
            detail={flow?.healed_packet.label ?? "Recovered output"}
            value={
              flow?.network.next_retry_ms
                ? `Next retry ${flow.network.next_retry_ms}ms`
                : "Recovery complete"
            }
            tone="ai"
          />
        </div>
      </div>
    </section>
  );
}

function PacketCard({
  label,
  detail,
  tone,
}: {
  label: string;
  detail: string;
  tone: "request" | "healed";
}) {
  return (
    <div
      className={`rounded-[24px] border px-4 py-4 ${tone === "request" ? "border-accent-error/20 bg-accent-error/10" : "border-accent-success/20 bg-accent-success/10"}`}
    >
      <div className="text-[11px] uppercase tracking-[0.3em] text-text-muted">
        {label}
      </div>
      <div className="mt-3 break-words text-sm font-medium text-white">
        {detail}
      </div>
    </div>
  );
}

function StageChip({
  label,
  detail,
  status,
}: {
  label: string;
  detail: string;
  status: "waiting" | "active" | "complete" | "error";
}) {
  const styles =
    status === "complete"
      ? "border-accent-success/20 bg-accent-success/10"
      : status === "active"
        ? "border-accent-live/20 bg-accent-live/10 shadow-[0_0_24px_rgba(34,211,238,0.12)]"
        : status === "error"
          ? "border-accent-error/20 bg-accent-error/10"
          : "border-white/8 bg-white/[0.03]";

  return (
    <div className={`rounded-2xl border px-4 py-3 ${styles}`}>
      <div className="text-[11px] uppercase tracking-[0.3em] text-text-muted">
        {label}
      </div>
      <div className="mt-2 text-sm leading-5 text-white">{detail}</div>
    </div>
  );
}

function MetricPanel({
  eyebrow,
  title,
  detail,
  value,
  tone,
  icon,
}: {
  eyebrow: string;
  title: string;
  detail: string;
  value: string;
  tone: "success" | "live" | "ai";
  icon: React.ReactNode;
}) {
  return (
    <div className="glass-card rounded-[24px] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="text-[11px] uppercase tracking-[0.35em] text-text-muted">
          {eyebrow}
        </div>
        <div
          className={`rounded-2xl border border-white/8 bg-white/[0.04] p-2 ${tone === "success" ? "text-accent-success" : tone === "live" ? "text-accent-live" : "text-accent-ai"}`}
        >
          {icon}
        </div>
      </div>
      <div
        className={`mt-4 text-xl font-semibold ${tone === "success" ? "text-accent-success" : tone === "live" ? "text-accent-live" : "text-accent-ai"}`}
      >
        {title}
      </div>
      <div className="mt-2 text-sm text-text-muted">{detail}</div>
      <div className="mt-4 text-sm text-white">{value}</div>
    </div>
  );
}
