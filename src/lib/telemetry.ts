import { type DashboardSnapshot, type EngineState, type ReMorphEvent } from '../types/remorph';
import { getTelemetryConfig, getTelemetrySnapshot } from '../services/telemetry';
import syntheticData from '../data/synthetic_data.json';
import { buildFlowFromEvent, buildMetrics, normalizeEventList } from '../services/telemetry/normalizers';

export type { EngineState, ReMorphEvent };
export type TelemetrySnapshot = DashboardSnapshot;

export { getTelemetryConfig };

export function loadLocalTelemetry(limit: number): TelemetrySnapshot {
  const events = normalizeEventList(syntheticData).slice(0, limit);
  const leadEvent = events[0] ?? null;
  
  return {
    events,
    flow: buildFlowFromEvent(leadEvent),
    metrics: buildMetrics(events),
    session: {
      operator_name: 'Operator',
      role: 'Engineering',
      auth_state: 'authenticated',
      environment: 'mock-lab',
    },
    source: 'mock',
    connection: 'connected',
    last_updated: new Date().toISOString(),
    backend_label: 'Local Dataset',
    notices: ['Viewing local telemetry snapshot'],
  };
}

export async function loadTelemetry(limit: number): Promise<TelemetrySnapshot> {
  return getTelemetrySnapshot({ limit });
}
