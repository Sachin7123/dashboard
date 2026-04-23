import { getMockAuthHeaders, getSeedEvents, mockLatencyProfiles, mockSessionState } from '../../mock/database';
import type { DashboardSnapshot, ReMorphEvent, TelemetryRequestOptions, TelemetryService } from '../../types/remorph';
import { buildFlowFromEvent, buildMetrics } from './normalizers';

export class MockTelemetryService implements TelemetryService {
  private readonly seedEvents = getSeedEvents();
  private cursor = 0;

  async getSnapshot(options?: TelemetryRequestOptions): Promise<DashboardSnapshot> {
    const profile = mockLatencyProfiles[this.cursor % mockLatencyProfiles.length];
    const delay = profile.base + Math.round(Math.random() * profile.jitter);

    await sleep(delay, options?.signal);

    const events = this.rollEvents(options?.limit ?? 80);
    const leadEvent = events[0] ?? null;

    return {
      events,
      flow: buildFlowFromEvent(leadEvent),
      metrics: buildMetrics(events),
      session: mockSessionState,
      source: 'mock',
      connection: 'connected',
      last_updated: new Date().toISOString(),
      backend_label: 'Mock Runtime Database',
      notices: [
        `Simulated latency ${delay}ms`,
        `Mock auth attached: ${Object.keys(getMockAuthHeaders()).join(', ')}`,
        profile.retries > 0 ? `Retry simulation count ${profile.retries}` : 'No retry needed',
      ],
    };
  }

  private rollEvents(limit: number): ReMorphEvent[] {
    const nextCursor = (this.cursor + 1) % Math.max(1, this.seedEvents.length);
    this.cursor = nextCursor;

    return this.seedEvents
      .slice(nextCursor)
      .concat(this.seedEvents.slice(0, nextCursor))
      .map((event, index) => {
        const freshnessMs = index * 1000 * 90;
        const timestamp = new Date(Date.now() - freshnessMs).toISOString();
        return {
          ...event,
          timestamp,
          processing_ms: Math.max(48, event.processing_ms + Math.round((Math.random() - 0.5) * 80)),
          confidence: Math.max(0.15, Math.min(0.99, event.confidence + (Math.random() - 0.5) * 0.08)),
        };
      })
      .slice(0, limit);
  }
}

function sleep(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      cleanup();
      resolve();
    }, ms);

    const onAbort = () => {
      cleanup();
      reject(new DOMException('Mock request aborted', 'AbortError'));
    };

    const cleanup = () => {
      window.clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    };

    signal?.addEventListener('abort', onAbort);
  });
}
