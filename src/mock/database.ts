import syntheticData from '../data/synthetic_data.json';
import type {
  BenchmarkSummary,
  ConnectionStatus,
  ReMorphEvent,
  RuntimeService,
  SessionState,
  TrainingReadiness,
  WorkflowEpisode,
} from '../types/remorph';

export const mockSessionState: SessionState = {
  operator_name: 'Sachin Ops',
  role: 'Platform Reliability',
  auth_state: 'authenticated',
  environment: 'mock-lab',
};

export const mockLatencyProfiles = [
  { id: 'stable', label: 'Stable sync lane', base: 180, jitter: 80, retries: 0, connection: 'connected' as ConnectionStatus },
  { id: 'retrying', label: 'Adaptive retry lane', base: 260, jitter: 120, retries: 1, connection: 'connected' as ConnectionStatus },
  { id: 'timeout-edge', label: 'Timeout recovery lane', base: 420, jitter: 180, retries: 2, connection: 'degraded' as ConnectionStatus },
];

export const mockSessionVariants: SessionState[] = [
  mockSessionState,
  {
    operator_name: 'Sachin Ops',
    role: 'Platform Reliability',
    auth_state: 'authenticated',
    environment: 'staging',
  },
  {
    operator_name: 'Sachin Ops',
    role: 'Platform Reliability',
    auth_state: 'reauth_required',
    environment: 'mock-lab',
  },
];

export const mockBackendNotices = [
  'Proxy ingress accepted request envelope.',
  'Reasoning trace stitched from latest repair attempt.',
  'Sprint 4 benchmark harness is replaying adaptive vs baseline episodes.',
  'Reward signals are being computed from retry and recovery outcomes.',
  'Training manifest is ready for mock-to-real backend swap.',
  'OpenEnv adapter is standing by behind the synthetic lab gateway.',
];

export function getSeedEvents(): ReMorphEvent[] {
  return (syntheticData as ReMorphEvent[]).map((event, index) => ({
    ...event,
    id: event.id || `seed-${index}`,
  }));
}

export function getMockAuthHeaders(): Record<string, string> {
  return {
    Authorization: 'Bearer remorph-mock-session-token',
    'x-vendor-id': 'ven-mock-001',
    'x-api-key': 'mock-live-key',
  };
}

export const mockBenchmarkSummary: BenchmarkSummary = {
  baseline: {
    success_rate: 0,
    avg_retries: 0,
    avg_latency_ms: 0,
    reward_average: -1,
    per_scenario_accuracy: {
      payload_drift: 0,
      route_drift: 0,
      auth_drift: 0,
    },
  },
  adaptive: {
    success_rate: 1,
    avg_retries: 1,
    avg_latency_ms: 1.33,
    reward_average: 1.2,
    per_scenario_accuracy: {
      payload_drift: 1,
      route_drift: 1,
      auth_drift: 1,
    },
  },
  deltas: {
    success_rate_delta: 1,
    avg_retries_delta: 1,
    avg_latency_delta_ms: 1.33,
    reward_average_delta: 2.2,
  },
};

export const mockTrainingReadiness: TrainingReadiness = {
  agent_type: 'adaptive',
  sample_count: 126,
  train_sample_count: 101,
  eval_sample_count: 25,
  success_rate: 0.94,
  avg_reward: 1.11,
  scenarios_covered: ['payload_drift', 'route_drift', 'auth_drift', 'server_fault'],
  latest_run_label: 'TRL-ready dataset manifest / sprint4_clean',
};

export const mockRuntimeServices: RuntimeService[] = [
  {
    id: 'proxy-adapter',
    label: 'Proxy Adapter',
    detail: 'Jenish contract bridge packaging trapped failures into ReMorph envelopes',
    status: 'healthy',
    latency_ms: 34,
  },
  {
    id: 'repair-brain',
    label: 'Sprint 2 Repair Brain',
    detail: 'Explainable route, payload, and auth repair orchestration',
    status: 'healthy',
    latency_ms: 126,
  },
  {
    id: 'retry-loop',
    label: 'Retry Orchestrator',
    detail: 'Repair-and-retry loop scoring recovery and failure outcomes',
    status: 'healthy',
    latency_ms: 58,
  },
  {
    id: 'benchmark-harness',
    label: 'Sprint 4 Benchmark',
    detail: 'Adaptive vs baseline episode replay with reward deltas',
    status: 'healthy',
    latency_ms: 91,
  },
  {
    id: 'training-node',
    label: 'Training Dataset Builder',
    detail: 'Benchmark episodes converted into GRPO-style train/eval samples',
    status: 'warning',
    latency_ms: 212,
  },
  {
    id: 'openenv',
    label: 'OpenEnv Adapter',
    detail: 'Production-facing environment backend ready for strict mode handoff',
    status: 'warning',
    latency_ms: 418,
  },
];

export const mockWorkflowEpisodes: WorkflowEpisode[] = [
  {
    id: 'wf-route-adaptive',
    scenario_type: 'route_drift',
    agent_type: 'adaptive',
    request_id: 'sprint4-6bad198a5d7b',
    success: true,
    final_status_code: 200,
    retries_used: 1,
    reward: 1.2,
    latency_ms: 1,
    repair_strategy: 'cache',
    healing_action: 'route_rewrite',
    selected_endpoint_path: '/api/v2/finance/ledger',
    route_match_confidence: 0.6468,
    cache_hit: true,
    llm_attempted: false,
    llm_succeeded: false,
    original_request: {
      method: 'GET',
      url: 'https://mock.example.com/api/v1/transactions',
      headers: { Authorization: 'Bearer demo-token' },
      payload: null,
    },
    healed_request: {
      method: 'GET',
      url: 'https://mock.example.com/api/v2/finance/ledger',
      headers: { Authorization: 'Bearer demo-token' },
      payload: null,
    },
    trapped_error: {
      error_code: 404,
      error_message: 'Route not found for active contract',
      source_component: 'sprint4:route_drift',
    },
    reward_breakdown: {
      success_bonus: 1,
      one_cycle_bonus: 0.2,
      extra_retry_penalty: 0,
      hallucinated_fields_penalty: 0,
      wrong_route_penalty: 0,
      final_failure_penalty: 0,
    },
  },
  {
    id: 'wf-route-baseline',
    scenario_type: 'route_drift',
    agent_type: 'baseline',
    request_id: 'baseline-route-01',
    success: false,
    final_status_code: 404,
    retries_used: 0,
    reward: -1,
    latency_ms: 0,
    repair_strategy: 'none',
    healing_action: 'none',
    selected_endpoint_path: null,
    route_match_confidence: null,
    cache_hit: false,
    llm_attempted: false,
    llm_succeeded: false,
    original_request: {
      method: 'GET',
      url: 'https://mock.example.com/api/v1/transactions',
      headers: { Authorization: 'Bearer demo-token' },
      payload: null,
    },
    healed_request: null,
    trapped_error: {
      error_code: 404,
      error_message: 'Baseline request drifted and failed without recovery',
      source_component: 'sprint4:route_drift',
    },
    reward_breakdown: {
      success_bonus: 0,
      one_cycle_bonus: 0,
      extra_retry_penalty: 0,
      hallucinated_fields_penalty: 0,
      wrong_route_penalty: 0,
      final_failure_penalty: -1,
    },
  },
  {
    id: 'wf-payload-adaptive',
    scenario_type: 'payload_drift',
    agent_type: 'adaptive',
    request_id: 'sprint4-f41e1f99a413',
    success: true,
    final_status_code: 201,
    retries_used: 1,
    reward: 1.2,
    latency_ms: 2,
    repair_strategy: 'cache',
    healing_action: 'payload_rewrite',
    selected_endpoint_path: '/users',
    route_match_confidence: 1,
    cache_hit: true,
    llm_attempted: false,
    llm_succeeded: false,
    original_request: {
      method: 'POST',
      url: 'https://mock.example.com/users',
      headers: { Authorization: 'Bearer demo-token' },
      payload: { first_name: 'John', last_name: 'Doe' },
    },
    healed_request: {
      method: 'POST',
      url: 'https://mock.example.com/users',
      headers: { Authorization: 'Bearer demo-token' },
      payload: { user: { f_name: 'John', l_name: 'Doe' } },
    },
    trapped_error: {
      error_code: 400,
      error_message: 'Invalid request body for active contract',
      source_component: 'sprint4:payload_drift',
    },
    reward_breakdown: {
      success_bonus: 1,
      one_cycle_bonus: 0.2,
      extra_retry_penalty: 0,
      hallucinated_fields_penalty: 0,
      wrong_route_penalty: 0,
      final_failure_penalty: 0,
    },
  },
  {
    id: 'wf-auth-adaptive',
    scenario_type: 'auth_drift',
    agent_type: 'adaptive',
    request_id: 'sprint4-1356d64a612c',
    success: true,
    final_status_code: 200,
    retries_used: 1,
    reward: 1.2,
    latency_ms: 1,
    repair_strategy: 'cache',
    healing_action: 'auth_rewrite',
    selected_endpoint_path: '/api/v2/finance/ledger',
    route_match_confidence: 0.725,
    cache_hit: true,
    llm_attempted: false,
    llm_succeeded: false,
    original_request: {
      method: 'GET',
      url: 'https://mock.example.com/api/v2/finance/ledger',
      headers: { Authorization: 'Bearer demo-token' },
      payload: null,
    },
    healed_request: {
      method: 'GET',
      url: 'https://mock.example.com/api/v2/finance/ledger',
      headers: { 'x-api-key': 'demo-token' },
      payload: null,
    },
    trapped_error: {
      error_code: 401,
      error_message: 'Unauthorized for active contract',
      source_component: 'sprint4:auth_drift',
    },
    reward_breakdown: {
      success_bonus: 1,
      one_cycle_bonus: 0.2,
      extra_retry_penalty: 0,
      hallucinated_fields_penalty: 0,
      wrong_route_penalty: 0,
      final_failure_penalty: 0,
    },
  },
];
