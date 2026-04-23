import type { DashboardSnapshot, TelemetryRequestOptions, TelemetryService } from '../../types/remorph';
import {
  buildFlowFromEvent,
  buildMetrics,
  normalizeBenchmarkSummary,
  normalizeEventList,
  normalizeRuntimeServices,
  normalizeTrainingReadiness,
  normalizeWorkflowEpisodes,
} from './normalizers';

const RETRY_DELAYS_MS = [0, 300, 900];

export class RealTelemetryService implements TelemetryService {
  private readonly url: string;

  constructor(url: string) {
    this.url = url;
  }

  async getSnapshot(options?: TelemetryRequestOptions): Promise<DashboardSnapshot> {
    const startedAt = performance.now();
    const response = await fetchWithRetry(this.url, options?.signal);

    if (!response.ok) {
      throw new Error(`Telemetry request failed with ${response.status}`);
    }

    const payload = await response.json();
    const events = normalizeEventList(payload).slice(0, options?.limit ?? 80);
    const workflows = normalizeWorkflowEpisodes(payload);
    const benchmark = normalizeBenchmarkSummary(payload);
    const training = normalizeTrainingReadiness(payload);
    const services = normalizeRuntimeServices(payload);
    const latencyMs = Math.round(performance.now() - startedAt);

    return {
      events,
      workflows,
      flow: buildFlowFromEvent(events[0] ?? null),
      metrics: buildMetrics(events),
      benchmark,
      training,
      services,
      session: {
        operator_name: 'Dashboard User',
        role: 'Observability',
        auth_state: 'authenticated',
        environment: 'staging',
      },
      source: 'real',
      connection: latencyMs > 650 ? 'degraded' : 'connected',
      last_updated: new Date().toISOString(),
      backend_label: this.url,
      notices: [
        `Live backend latency ${latencyMs}ms`,
        latencyMs > 650 ? 'Telemetry degraded, retry envelope activated' : 'Live telemetry streaming normally',
      ],
    };
  }
}

async function fetchWithRetry(url: string, signal?: AbortSignal): Promise<Response> {
  let lastError: unknown = null;

  for (let attempt = 0; attempt < RETRY_DELAYS_MS.length; attempt += 1) {
    const delay = RETRY_DELAYS_MS[attempt];
    if (delay > 0) {
      await sleep(delay, signal);
    }

    try {
      return await fetch(url, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
        signal,
      });
    } catch (error) {
      lastError = error;
      if (signal?.aborted) {
        throw error;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Telemetry backend is unreachable');
}

function sleep(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      cleanup();
      resolve();
    }, ms);

    const onAbort = () => {
      cleanup();
      reject(new DOMException('Telemetry request aborted', 'AbortError'));
    };

    const cleanup = () => {
      window.clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    };

    signal?.addEventListener('abort', onAbort);
  });
}
