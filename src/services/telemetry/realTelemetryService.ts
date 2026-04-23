import type { DashboardSnapshot, TelemetryRequestOptions, TelemetryService } from '../../types/remorph';
import { buildFlowFromEvent, buildMetrics, normalizeEventList } from './normalizers';

export class RealTelemetryService implements TelemetryService {
  constructor(private readonly url: string) {}

  async getSnapshot(options?: TelemetryRequestOptions): Promise<DashboardSnapshot> {
    const startedAt = performance.now();
    const response = await fetch(this.url, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: options?.signal,
    });

    if (!response.ok) {
      throw new Error(`Telemetry request failed with ${response.status}`);
    }

    const payload = await response.json();
    const events = normalizeEventList(payload).slice(0, options?.limit ?? 80);
    const latencyMs = Math.round(performance.now() - startedAt);

    return {
      events,
      flow: buildFlowFromEvent(events[0] ?? null),
      metrics: buildMetrics(events),
      session: {
        operator_name: 'Dashboard User',
        role: 'Observability',
        auth_state: 'authenticated',
        environment: 'staging',
      },
      source: 'real',
      connection: 'connected',
      last_updated: new Date().toISOString(),
      backend_label: this.url,
      notices: [`Live backend latency ${latencyMs}ms`],
    };
  }
}
