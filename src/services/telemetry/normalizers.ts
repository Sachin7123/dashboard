import type {
  BenchmarkAggregate,
  BenchmarkSummary,
  DashboardMetrics,
  EventStatus,
  EventType,
  ReMorphDiagnostics,
  ReMorphEvent,
  RepairStrategy,
  RuntimeService,
  RuntimeFlow,
  StageStatus,
  TrainingReadiness,
  WorkflowEpisode,
  WorkflowRequestShape,
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

export function normalizeWorkflowEpisodes(payload: unknown): WorkflowEpisode[] {
  const list = extractNamedList(payload, ['workflows', 'episodes', 'records']);
  return list
    .map(normalizeWorkflowEpisode)
    .filter((item): item is WorkflowEpisode => item !== null);
}

export function normalizeBenchmarkSummary(payload: unknown): BenchmarkSummary | null {
  if (!payload || typeof payload !== 'object') return null;

  const root = payload as Record<string, unknown>;
  const benchmark = (root.benchmark && typeof root.benchmark === 'object'
    ? root.benchmark
    : root) as Record<string, unknown>;

  if (!benchmark.baseline || !benchmark.adaptive || !benchmark.deltas) {
    return null;
  }

  return {
    baseline: normalizeBenchmarkAggregate(benchmark.baseline),
    adaptive: normalizeBenchmarkAggregate(benchmark.adaptive),
    deltas: {
      success_rate_delta: numberValue((benchmark.deltas as Record<string, unknown>).success_rate_delta),
      avg_retries_delta: numberValue((benchmark.deltas as Record<string, unknown>).avg_retries_delta),
      avg_latency_delta_ms: numberValue((benchmark.deltas as Record<string, unknown>).avg_latency_delta_ms),
      reward_average_delta: numberValue((benchmark.deltas as Record<string, unknown>).reward_average_delta),
    },
  };
}

export function normalizeTrainingReadiness(payload: unknown): TrainingReadiness | null {
  if (!payload || typeof payload !== 'object') return null;

  const root = payload as Record<string, unknown>;
  const training = (root.training && typeof root.training === 'object'
    ? root.training
    : root) as Record<string, unknown>;

  if (!training.sample_count && !training.train_sample_count && !training.eval_sample_count) {
    return null;
  }

  return {
    agent_type: String(training.agent_type ?? 'adaptive') === 'baseline' ? 'baseline' : 'adaptive',
    sample_count: numberValue(training.sample_count),
    train_sample_count: numberValue(training.train_sample_count),
    eval_sample_count: numberValue(training.eval_sample_count),
    success_rate: numberValue(training.success_rate),
    avg_reward: numberValue(training.avg_reward),
    scenarios_covered: arrayOfStrings(training.scenarios_covered),
    latest_run_label: stringValue(training.latest_run_label) || 'Synthetic training manifest',
  };
}

export function normalizeRuntimeServices(payload: unknown): RuntimeService[] {
  const list = extractNamedList(payload, ['services', 'runtime_services']);
  return list
    .map((entry, index) => normalizeRuntimeService(entry, index))
    .filter((item): item is RuntimeService => item !== null);
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

function extractNamedList(payload: unknown, keys: string[]): unknown[] {
  if (!payload || typeof payload !== 'object') return [];
  const raw = payload as Record<string, unknown>;
  for (const key of keys) {
    if (Array.isArray(raw[key])) {
      return raw[key] as unknown[];
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
    docs_confidence: nullableNumber(raw.docs_confidence),
    selected_endpoint_path: nullableString(raw.selected_endpoint_path),
    spec_hash: nullableString(raw.spec_hash),
    spec_version: nullableString(raw.spec_version),
    scenario_type: nullableString(raw.scenario_type),
    failure_reason: nullableString(raw.failure_reason),
    retry_succeeded: nullableBoolean(raw.retry_succeeded),
    total_recovery_steps: nullableNumber(raw.total_recovery_steps),
    final_reward: nullableNumber(raw.final_reward),
  };
}

function normalizeWorkflowEpisode(entry: unknown): WorkflowEpisode | null {
  if (!entry || typeof entry !== 'object') return null;

  const raw = entry as Record<string, unknown>;
  const originalRequest = normalizeWorkflowRequest(raw.original_request);
  if (!originalRequest) return null;

  return {
    id: stringValue(raw.request_id) || stringValue(raw.id) || `workflow-${Math.random().toString(36).slice(2, 10)}`,
    scenario_type: pickType(raw.scenario_type),
    agent_type: String(raw.agent_type ?? 'adaptive') === 'baseline' ? 'baseline' : 'adaptive',
    request_id: nullableString(raw.request_id),
    success: Boolean(raw.success),
    final_status_code: numberValue(raw.final_status_code),
    retries_used: numberValue(raw.retries_used),
    reward: numberValue(raw.reward),
    latency_ms: numberValue(raw.latency_ms),
    repair_strategy: pickWorkflowStrategy(raw.repair_strategy),
    healing_action: nullableString(raw.healing_action),
    selected_endpoint_path: nullableString(raw.selected_endpoint_path),
    route_match_confidence: nullableNumber(raw.route_match_confidence),
    cache_hit: Boolean(raw.cache_hit),
    llm_attempted: Boolean(raw.llm_attempted),
    llm_succeeded: Boolean(raw.llm_succeeded),
    original_request: originalRequest,
    healed_request: normalizeWorkflowRequest({
      method: raw.healed_method,
      url: raw.healed_url,
      headers: raw.healed_headers,
      payload: raw.healed_payload,
    }),
    trapped_error: normalizeTrappedError(raw.trapped_error),
    reward_breakdown: recordNumberValue(raw.reward_breakdown),
  };
}

function normalizeBenchmarkAggregate(value: unknown): BenchmarkAggregate {
  const raw = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    success_rate: floatValue(raw.success_rate),
    avg_retries: numberValue(raw.avg_retries),
    avg_latency_ms: numberValue(raw.avg_latency_ms),
    reward_average: numberValue(raw.reward_average),
    per_scenario_accuracy: recordNumberValue(raw.per_scenario_accuracy, false),
  };
}

function normalizeRuntimeService(entry: unknown, index: number): RuntimeService | null {
  if (!entry || typeof entry !== 'object') return null;

  const raw = entry as Record<string, unknown>;
  const label = stringValue(raw.label);
  if (!label) return null;

  const status = String(raw.status ?? 'healthy').toLowerCase();

  return {
    id: stringValue(raw.id) || `service-${index}`,
    label,
    detail: stringValue(raw.detail) || 'Service ready',
    status: status === 'critical' ? 'critical' : status === 'warning' ? 'warning' : 'healthy',
    latency_ms: nullableNumber(raw.latency_ms),
  };
}

function normalizeWorkflowRequest(value: unknown): WorkflowRequestShape | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  const url = stringValue(raw.url);
  const method = stringValue(raw.method).toUpperCase();
  if (!url || !method) return null;

  return {
    method,
    url,
    headers: recordStringValue(raw.headers),
    payload: raw.payload ?? null,
  };
}

function normalizeTrappedError(
  value: unknown,
): WorkflowEpisode['trapped_error'] {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  return {
    error_code: numberValue(raw.error_code),
    error_message: stringValue(raw.error_message) || 'Unknown trapped error',
    source_component: stringValue(raw.source_component) || 'proxy',
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

function nullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const normalized = numberValue(value);
  return Number.isFinite(normalized) ? normalized : null;
}

function nullableBoolean(value: unknown): boolean | null {
  if (value === null || value === undefined) return null;
  return Boolean(value);
}

function recordValue(value: unknown): Record<string, string> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, rawValue]) => [key, String(rawValue)]),
  );
}

function recordStringValue(value: unknown): Record<string, string> | null {
  return recordValue(value);
}

function recordNumberValue(value: unknown, useRatio = false): Record<string, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, rawValue]) => [key, useRatio ? floatValue(rawValue) : numberValue(rawValue)]),
  );
}

function arrayOfStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item));
}

function pickWorkflowStrategy(value: unknown): WorkflowEpisode['repair_strategy'] {
  const normalized = String(value ?? '').toLowerCase();
  if (normalized === 'cache') return 'cache';
  return pickStrategy(value);
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
