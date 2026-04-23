import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Ring, Sphere, Sparkles, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { CheckCircle2 } from 'lucide-react';
import type { EngineState, RuntimeFlow } from '../../types/remorph';

const stateColorMap: Record<EngineState, string> = {
  idle: '#c084fc',
  thinking: '#fbbf24',
  healing: '#22d3ee',
  success: '#34d399',
};

function Orb({ state, activeLoad }: { state: EngineState; activeLoad: number }) {
  const meshRef = React.useRef<THREE.Mesh>(null);
  const materialRef = React.useRef<any>(null);
  const outerRingRef = React.useRef<THREE.Mesh>(null);
  const signalRingRef = React.useRef<THREE.Mesh>(null);

  useFrame((clock) => {
    const t = clock.clock.elapsedTime;
    const loadBoost = 1 + activeLoad * 0.35;

    if (meshRef.current) {
      meshRef.current.rotation.x = t * 0.16 * loadBoost;
      meshRef.current.rotation.y = t * 0.24 * loadBoost;
      const pulse = state === 'healing' ? 0.08 * Math.sin(t * 7) : state === 'success' ? 0.12 * Math.sin(t * 8.5) : 0.04 * Math.sin(t * 3.2);
      const scale = 1.02 + pulse;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.15);
    }

    if (materialRef.current) {
      const currentColor = new THREE.Color(stateColorMap[state]);
      materialRef.current.color.lerp(currentColor, 0.08);
      materialRef.current.emissive.lerp(currentColor, 0.08);
      materialRef.current.emissiveIntensity = 1.2 + activeLoad * 0.7;
      materialRef.current.distort = THREE.MathUtils.lerp(materialRef.current.distort ?? 0.35, state === 'healing' ? 0.88 : 0.48, 0.12);
      materialRef.current.speed = THREE.MathUtils.lerp(materialRef.current.speed ?? 2.2, state === 'success' ? 5.6 : 3.5, 0.12);
    }

    if (outerRingRef.current) {
      outerRingRef.current.rotation.z = t * 0.25;
      outerRingRef.current.scale.setScalar(1 + activeLoad * 0.05);
    }

    if (signalRingRef.current) {
      signalRingRef.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.9) * 0.24;
      signalRingRef.current.rotation.y = t * 0.22;
    }
  });

  return (
    <group>
      <Float speed={1.8} rotationIntensity={0.45} floatIntensity={0.45}>
        <Sphere ref={meshRef} args={[1.45, 96, 96]}>
          <MeshDistortMaterial
            ref={materialRef}
            color={stateColorMap[state]}
            emissive={stateColorMap[state]}
            emissiveIntensity={1.4}
            roughness={0.18}
            metalness={0.82}
            distort={0.45}
            speed={2.2}
            wireframe
            transparent
            opacity={0.9}
          />
        </Sphere>
        <Ring ref={outerRingRef} args={[2.1, 2.16, 72]} rotation={[Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color={stateColorMap[state]} transparent opacity={0.34} side={THREE.DoubleSide} />
        </Ring>
        <Ring ref={signalRingRef} args={[2.5, 2.56, 72]} rotation={[Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color="#ffffff" transparent opacity={0.12} side={THREE.DoubleSide} />
        </Ring>
      </Float>
      <Sparkles count={state === 'healing' ? 180 : 120} scale={5.6} size={5} speed={0.7} color={stateColorMap[state]} />
    </group>
  );
}

import React from 'react';

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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(192,132,252,0.16),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(34,211,238,0.12),transparent_35%)]" />
      <div className="relative grid grid-cols-1 gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="relative overflow-hidden rounded-[24px] border border-white/6 bg-black/10">
          <div className="absolute left-6 top-6 z-10 max-w-xl">
            <p className="text-[11px] uppercase tracking-[0.35em] text-text-muted">System Flow</p>
            <h2 className="mt-2 text-2xl font-semibold">From broken request to healed delivery</h2>
            <p className="mt-3 text-sm leading-6 text-text-muted">
              Requests enter from the left lane, traverse the core engine, and exit as validated healed output with confidence scoring and retry awareness.
            </p>
          </div>

          <div className="pointer-events-none absolute inset-x-6 top-28 bottom-24 hidden lg:block">
            <div className="relative h-full">
              <div className="absolute left-[12%] right-[12%] top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <motion.div
                className="flow-packet request"
                initial={{ x: '-28vw', opacity: 0 }}
                animate={{ x: '0vw', opacity: 1 }}
                transition={{ repeat: Infinity, duration: 4.6, ease: 'easeInOut' }}
                style={{ top: 'calc(50% - 18px)', left: '16%' }}
              >
                request
              </motion.div>
              <motion.div
                className="flow-packet healed"
                initial={{ x: '0vw', opacity: 0 }}
                animate={{ x: '28vw', opacity: 1 }}
                transition={{ repeat: Infinity, duration: 4.6, ease: 'easeInOut', delay: 2.2 }}
                style={{ top: 'calc(50% + 10px)', left: '50%' }}
              >
                healed
              </motion.div>
            </div>
          </div>

          <div className="grid h-[clamp(320px,44vh,540px)] grid-cols-1 lg:grid-cols-[210px_minmax(0,1fr)_210px]">
            <div className="hidden p-6 lg:flex lg:flex-col lg:justify-center">
              <PacketCard label={flow?.request_packet.label ?? 'Incoming request'} detail={flow?.request_packet.detail ?? 'Waiting for request packet'} tone="request" />
            </div>

            <div className="relative h-full">
              <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 1.6]}>
                <ambientLight intensity={0.55} />
                <pointLight position={[8, 8, 10]} intensity={1.4} color="#c084fc" />
                <pointLight position={[-8, -4, -8]} intensity={1.1} color="#22d3ee" />
                <Orb state={engineState} activeLoad={activeLoad} />
                <Stars radius={60} depth={50} count={2200} factor={4} saturation={0} fade speed={1} />
              </Canvas>
            </div>

            <div className="hidden p-6 lg:flex lg:flex-col lg:justify-center">
              <PacketCard label={flow?.healed_packet.label ?? 'Validated output'} detail={flow?.healed_packet.detail ?? 'Awaiting healed result'} tone="healed" />
            </div>
          </div>

          <div className="absolute inset-x-5 bottom-5">
            <div className="grid gap-3 md:grid-cols-5">
              {(flow?.stages ?? []).map((stage) => (
                <StageChip key={stage.id} label={stage.label} detail={stage.detail} status={stage.status} />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="glass-card rounded-[24px] p-5">
            <div className="text-[11px] uppercase tracking-[0.35em] text-text-muted">Completion</div>
            <div className="mt-4 flex items-center gap-3">
              <div className="rounded-full border border-accent-success/25 bg-accent-success/10 p-2 text-accent-success">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xl font-semibold text-accent-success">{flow?.completion_badge ?? 'Ready'}</div>
                <div className="text-sm text-text-muted">Validated recovery state</div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-[24px] p-5">
            <div className="text-[11px] uppercase tracking-[0.35em] text-text-muted">Confidence Score</div>
            <div className="mt-4 text-4xl font-semibold text-accent-ai">{flow?.confidence_score ?? 0}%</div>
            <div className="mt-3 h-2 rounded-full bg-white/[0.06]">
              <div className="h-full rounded-full bg-gradient-to-r from-accent-ai via-accent-live to-accent-success" style={{ width: `${flow?.confidence_score ?? 0}%` }} />
            </div>
          </div>

          <div className="glass-card rounded-[24px] p-5">
            <div className="text-[11px] uppercase tracking-[0.35em] text-text-muted">Network Profile</div>
            <div className="mt-4 grid gap-3">
              <Signal label="Latency" value={`${flow?.network.latency_ms ?? 0}ms`} />
              <Signal label="Retries" value={flow?.network.retries ?? 0} />
              <Signal label="Timeout Risk" value={flow?.network.timeout_risk ?? 'low'} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PacketCard({ label, detail, tone }: { label: string; detail: string; tone: 'request' | 'healed' }) {
  return (
    <div className={`rounded-[24px] border px-4 py-4 ${tone === 'request' ? 'border-accent-error/20 bg-accent-error/10' : 'border-accent-success/20 bg-accent-success/10'}`}>
      <div className="text-[11px] uppercase tracking-[0.3em] text-text-muted">{label}</div>
      <div className="mt-3 text-sm font-medium text-white">{detail}</div>
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
  status: 'waiting' | 'active' | 'complete' | 'error';
}) {
  const styles =
    status === 'complete'
      ? 'border-accent-success/20 bg-accent-success/10'
      : status === 'active'
        ? 'border-accent-live/20 bg-accent-live/10 shadow-[0_0_24px_rgba(34,211,238,0.12)]'
        : status === 'error'
          ? 'border-accent-error/20 bg-accent-error/10'
          : 'border-white/8 bg-white/[0.03]';

  return (
    <div className={`rounded-2xl border px-4 py-3 ${styles}`}>
      <div className="text-[11px] uppercase tracking-[0.3em] text-text-muted">{label}</div>
      <div className="mt-2 text-sm text-white">{detail}</div>
    </div>
  );
}

function Signal({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between border-b border-white/6 py-2 last:border-b-0">
      <span className="text-[11px] uppercase tracking-[0.3em] text-text-muted">{label}</span>
      <span className="text-sm text-white">{value}</span>
    </div>
  );
}
