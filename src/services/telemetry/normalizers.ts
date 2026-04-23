import type {
  DashboardMetrics,
  EventStatus,
  EventType,
  ReMorphDiagnostics,
  ReMorphEvent,
  RepairStrategy,
  RuntimeFlow,
  StageStatus,
} from '../../types/remorph';

export function normalizeEventList(payload: unknown): ReMorphEvent[] {
  const list = extractList(payload);
  return list
    .map(normalizeEvent)
    .filter((item): item is ReMorphEvent => item !== null)
    .sort((left, right) => Date.parse(right.timestamp) - Date.parse(left.timestamp));
}

export function buildMetrics(events: ReMorphEvent[]): DashboardMetrics {
  const total = events.length || 1;
  const healed = events.filter((event) => event.status === 'healed').length;
  const unresolved = events.filter((event) => event.status === 'failed' || event.status === 'unhandled').length;
  const averageLatency = events.reduce((sum, event) => sum + event.processing_ms, 0) / total;
  const averageConfidence = events.reduce((sum, event) => sum + event.confidence, 0) / total;

  return {
    success_rate: Math.round((healed / total) * 100),
    unresolved_count: unresolved,
    average_latency_ms: Math.round(averageLatency),
    average_confidence: Math.round(averageConfidence * 100),
    total_events: events.length,
    healed_events: healed,
  };
}

export function buildFlowFromEvent(event: ReMorphEvent | null): RuntimeFlow | null {
  if (!event) return null;

  const stages: StageStatus[] = [
    { id: 'intercept', label: 'Intercept', status: 'complete', detail: 'Request trapped from proxy' },
    { id: 'reasoning', label: 'Reasoning', status: 'complete', detail: event.strategy === 'none' ? 'Policy stalled' : `Strategy: ${event.strategy}` },
    {
      id: 'patching',
      label: 'Patching',
      status: event.status === 'healed' ? 'complete' : event.status === 'pending' ? 'active' : 'error',
      detail: event.healing_action || 'no_change',
    },
    {
      id: 'recovery',
      label: 'Recovery',
      status: event.status === 'healed' ? 'complete' : event.status === 'pending' ? 'active' : 'error',
      detail: event.status === 'healed' ? 'Recovered request emitted' : 'Still evaluating retry path',
    },
    {
      id: 'validation',
      label: 'Validation',
      status: event.status === 'healed' ? 'complete' : event.status === 'pending' ? 'waiting' : 'error',
      detail: event.status === 'healed' ? 'Destination acknowledged payload' : 'Destination rejected latest attempt',
    },
  ];

  return {
    request_packet: {
      id: `${event.id}-request`,
      label: `${event.method} request`,
      variant: 'request',
      detail: shortUrl(event.target_url),
    },
    healed_packet: {
      id: `${event.id}-healed`,
      label: event.status === 'healed' ? 'healed output' : 'degraded output',
      variant: 'healed',
      detail: event.fixed_url || event.target_url,
    },
    destination_packet: {
      id: `${event.id}-destination`,
      label: event.status === 'healed' ? 'destination endpoint' : 'review queue',
      variant: 'destination',
      detail: event.fixed_url || event.target_url,
    },
    stages,
    confidence_score: Math.round(event.confidence * 100),
    completion_badge: event.status === 'healed' ? 'Recovered' : event.status === 'pending' ? 'In Flight' : 'Needs Review',
    network: {
      latency_ms: event.processing_ms,
      retries: event.retry_count,
      timeout_risk: event.processing_ms > 650 ? 'high' : event.processing_ms > 350 ? 'medium' : 'low',
      next_retry_ms: event.status === 'pending' ? 1200 : null,
    },
  };
}

function extractList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;

  if (payload && typeof payload === 'object') {
    const objectPayload = payload as Record<string, unknown>;
    for (const key of ['events', 'records', 'items', 'data']) {
      if (Array.isArray(objectPayload[key])) {
        return objectPayload[key] as unknown[];
      }
    }
  }

  return [];
}

function normalizeEvent(entry: unknown): ReMorphEvent | null {
  if (!entry || typeof entry !== 'object') return null;

  const raw = entry as Record<string, unknown>;
  const targetUrl = stringValue(raw.target_url ?? raw.url);
  if (!targetUrl) return null;

  return {
    id: stringValue(raw.id) || `evt-${Math.random().toString(36).slice(2, 10)}`,
    type: pickType(raw.type ?? raw.scenario_type),
    status: pickStatus(raw.status),
    timestamp: stringValue(raw.timestamp) || new Date().toISOString(),
    target_url: targetUrl,
    method: String(raw.method ?? 'GET').toUpperCase(),
    error_code: numberValue(raw.error_code ?? raw.final_status_code),
    message: stringValue(raw.message ?? raw.error_message) || friendlyMessage(pickType(raw.type), pickStatus(raw.status)),
    raw_payload: raw.raw_payload ?? raw.failed_payload ?? raw.original_payload ?? null,
    fixed_payload: raw.fixed_payload ?? raw.healed_payload ?? raw.payload_after ?? null,
    fixed_url: nullableString(raw.fixed_url ?? raw.healed_url),
    fixed_headers: recordValue(raw.fixed_headers ?? raw.healed_headers),
    confidence: floatValue(raw.confidence ?? raw.route_match_confidence ?? raw.docs_confidence),
    processing_ms: numberValue(raw.processing_ms ?? raw.latency_ms),
    strategy: pickStrategy(raw.strategy ?? raw.repair_strategy),
    reasoning: stringValue(raw.reasoning) || 'No explicit reasoning trace was provided by the backend.',
    healing_action: stringValue(raw.healing_action) || 'no_change',
    source_component: stringValue(raw.source_component) || 'proxy',
    retry_count: numberValue(raw.retry_count ?? raw.retries_used),
    diagnostics: normalizeDiagnostics(raw.diagnostics),
  };
}

function normalizeDiagnostics(value: unknown): ReMorphDiagnostics {
  const raw = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    llm_attempted: Boolean(raw.llm_attempted ?? false),
    llm_succeeded: Boolean(raw.llm_succeeded ?? false),
    fallback_used: Boolean(raw.fallback_used ?? false),
    docs_source: stringValue(raw.docs_source) || 'runtime:unknown',
  };
}

function pickType(value: unknown): EventType {
  const normalized = String(value ?? '').toLowerCase();
  if (normalized.includes('route')) return 'route_drift';
  if (normalized.includes('auth')) return 'auth_drift';
  if (normalized.includes('server') || normalized.includes('fault')) return 'server_fault';
  return 'payload_drift';
}

function pickStatus(value: unknown): EventStatus {
  const normalized = String(value ?? '').toLowerCase();
  if (normalized === 'pending') return 'pending';
  if (normalized === 'failed') return 'failed';
  if (normalized === 'unhandled') return 'unhandled';
  return 'healed';
}

function pickStrategy(value: unknown): RepairStrategy {
  const normalized = String(value ?? '').toLowerCase();
  if (normalized === 'llm') return 'llm';
  if (normalized === 'merged') return 'merged';
  if (normalized === 'agentic_search') return 'agentic_search';
  if (normalized === 'heuristic') return 'heuristic';
  if (normalized === 'none') return 'none';
  return 'deterministic';
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function nullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function numberValue(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function floatValue(value: unknown): number {
  const normalized = numberValue(value);
  return normalized > 1 ? normalized / 100 : normalized;
}

function recordValue(value: unknown): Record<string, string> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, rawValue]) => [key, String(rawValue)]),
  );
}

function friendlyMessage(type: EventType, status: EventStatus): string {
  if (status !== 'healed') return 'Recovery requires operator review';

  switch (type) {
    case 'route_drift':
      return 'Endpoint migration resolved';
    case 'auth_drift':
      return 'Auth contract repaired';
    case 'server_fault':
      return 'Service health recovered';
    default:
      return 'Payload contract normalized';
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
