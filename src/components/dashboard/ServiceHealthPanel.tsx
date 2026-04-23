import { Cpu, RadioTower, ShieldCheck } from 'lucide-react';
import type { RuntimeService } from '../../types/remorph';
import { Panel } from '../layout/Panel';
import { StatusPill } from './StatusPill';

export function ServiceHealthPanel({
  services,
}: {
  services: RuntimeService[];
}) {
  return (
    <Panel
      eyebrow="Runtime Mesh"
      title="Backend Integration Surfaces"
      action={<RadioTower className="h-4 w-4 text-accent-live" />}
      contentClassName="px-4 py-4"
    >
      <div className="grid gap-3 md:grid-cols-2">
        {services.map((service) => (
          <div key={service.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="rounded-full border border-white/8 bg-black/20 p-2">
                  {service.id === 'repair-brain' ? (
                    <Cpu className="h-4 w-4 text-accent-ai" />
                  ) : (
                    <ShieldCheck className="h-4 w-4 text-accent-live" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="break-words text-sm font-semibold text-white">{service.label}</div>
                  <div className="mt-1 break-words text-sm leading-6 text-text-muted">{service.detail}</div>
                </div>
              </div>
              <StatusPill
                tone={
                  service.status === 'healthy'
                    ? 'success'
                    : service.status === 'warning'
                      ? 'live'
                      : 'error'
                }
                label={service.status}
              />
            </div>

            <div className="mt-4 rounded-2xl border border-white/6 bg-black/20 px-3 py-3">
              <div className="text-[10px] uppercase tracking-[0.24em] text-text-muted">Latency</div>
              <div className="mt-2 text-sm text-white">
                {service.latency_ms === null ? 'n/a' : `${service.latency_ms}ms`}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
