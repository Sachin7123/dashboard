import {
  getMockAuthHeaders,
  mockBenchmarkSummary,
  getSeedEvents,
  mockBackendNotices,
  mockLatencyProfiles,
  mockRuntimeServices,
  mockSessionVariants,
  mockTrainingReadiness,
  mockWorkflowEpisodes,
} from '../../mock/database';
import type {
  ConnectionStatus,
  DashboardSnapshot,
  ReMorphEvent,
  SessionState,
  TelemetryRequestOptions,
} from '../../types/remorph';
import { buildFlowFromEvent, buildMetrics } from './normalizers';

type MockNetworkProfile = (typeof mockLatencyProfiles)[number];

interface MockBackendEnvelope {
  events: ReMorphEvent[];
  session: SessionState;
  connection: ConnectionStatus;
  backend_label: string;
  notices: string[];
  last_updated: string;
  workflows: DashboardSnapshot['workflows'];
  benchmark: DashboardSnapshot['benchmark'];
  training: DashboardSnapshot['training'];
  services: DashboardSnapshot['services'];
}

export class MockBackend {
  private readonly seedEvents = getSeedEvents();
  private cursor = 0;

  async fetchTelemetry(options?: TelemetryRequestOptions): Promise<DashboardSnapshot> {
    const profile = mockLatencyProfiles[this.cursor % mockLatencyProfiles.length];
    const delay = profile.base + Math.round(Math.random() * profile.jitter);

    await sleep(delay, options?.signal);

    const envelope = this.buildEnvelope(profile, options?.limit ?? 80);
    const leadEvent = envelope.events[0] ?? null;

    return {
      events: envelope.events,
      flow: buildFlowFromEvent(leadEvent),
      metrics: buildMetrics(envelope.events),
      workflows: envelope.workflows,
      benchmark: envelope.benchmark,
      training: envelope.training,
      services: envelope.services,
      session: envelope.session,
      source: 'mock',
      connection: envelope.connection,
      last_updated: envelope.last_updated,
      backend_label: envelope.backend_label,
      notices: envelope.notices,
    };
  }

  private buildEnvelope(profile: MockNetworkProfile, limit: number): MockBackendEnvelope {
    const events = this.rollEvents(limit, profile);
    const leadEvent = events[0] ?? null;
    const session = this.resolveSession(profile, leadEvent);
    const authHeaders = getMockAuthHeaders();
    const lastUpdated = new Date().toISOString();
    const connection = this.resolveConnection(profile, leadEvent);
    const workflows = this.resolveWorkflows();
    const services = this.resolveServices(profile);

    return {
      events,
      session,
      connection,
      backend_label: `Mock Runtime Gateway / ${profile.label}`,
      notices: [
        `Simulated latency ${events[0]?.processing_ms ?? profile.base}ms`,
        profile.retries > 0 ? `Retry handler engaged ${profile.retries}x` : 'Direct pass-through without retry',
        `Mock auth attached: ${Object.keys(authHeaders).join(', ')}`,
        session.auth_state === 'reauth_required' ? 'Session refresh required before next live action' : 'Session token healthy',
        mockBackendNotices[this.cursor % mockBackendNotices.length],
      ],
      last_updated: lastUpdated,
      workflows,
      benchmark: mockBenchmarkSummary,
      training: {
        ...mockTrainingReadiness,
        latest_run_label: profile.id === 'timeout-edge'
          ? 'Dataset generation delayed by retry storm / synthetic replay'
          : mockTrainingReadiness.latest_run_label,
      },
      services,
    };
  }

  private rollEvents(limit: number, profile: MockNetworkProfile): ReMorphEvent[] {
    const nextCursor = (this.cursor + 1) % Math.max(1, this.seedEvents.length);
    this.cursor = nextCursor;

    return this.seedEvents
      .slice(nextCursor)
      .concat(this.seedEvents.slice(0, nextCursor))
      .map((event, index) => {
        const freshnessMs = index * 1000 * 75;
        const timestamp = new Date(Date.now() - freshnessMs).toISOString();
        const latencyDrift = Math.round((Math.random() - 0.5) * (profile.jitter * 0.7));
        const retryBoost = profile.retries > 0 && index === 0 ? profile.retries : event.retry_count;
        const liveStatus = index === 0 && profile.retries > 1 && event.status === 'healed'
          ? 'pending'
          : event.status;

        return {
          ...event,
          timestamp,
          status: liveStatus,
          retry_count: retryBoost,
          processing_ms: Math.max(64, event.processing_ms + latencyDrift + profile.retries * 40),
          confidence: Math.max(0.12, Math.min(0.99, event.confidence + (Math.random() - 0.5) * 0.06)),
          diagnostics: {
            ...event.diagnostics,
            fallback_used: profile.retries > 1 ? true : event.diagnostics.fallback_used,
          },
        };
      })
      .slice(0, limit);
  }

  private resolveSession(profile: MockNetworkProfile, leadEvent: ReMorphEvent | null): SessionState {
    if (leadEvent?.type === 'auth_drift' || profile.id === 'timeout-edge') {
      return mockSessionVariants[2];
    }
    if (leadEvent?.source_component === 'gateway') {
      return mockSessionVariants[1];
    }
    return mockSessionVariants[0];
  }

  private resolveConnection(profile: MockNetworkProfile, leadEvent: ReMorphEvent | null): ConnectionStatus {
    if (leadEvent?.status === 'failed' || leadEvent?.status === 'unhandled') {
      return 'degraded';
    }
    return profile.connection;
  }

  private resolveWorkflows(): DashboardSnapshot['workflows'] {
    const rotation = this.cursor % mockWorkflowEpisodes.length;
    return mockWorkflowEpisodes
      .slice(rotation)
      .concat(mockWorkflowEpisodes.slice(0, rotation));
  }

  private resolveServices(profile: MockNetworkProfile): DashboardSnapshot['services'] {
    return mockRuntimeServices.map((service) => {
      if (profile.id === 'timeout-edge' && service.id === 'openenv') {
        return {
          ...service,
          status: 'critical',
          detail: 'OpenEnv handshake exceeded latency budget during synthetic replay',
          latency_ms: 740,
        };
      }

      if (profile.id === 'retrying' && service.id === 'training-node') {
        return {
          ...service,
          status: 'healthy',
          detail: 'Train/eval manifests regenerated from latest adaptive episodes',
          latency_ms: 164,
        };
      }

      return service;
    });
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
