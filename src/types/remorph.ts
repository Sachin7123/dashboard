export type EngineState = 'idle' | 'thinking' | 'healing' | 'success';
export type EventType = 'payload_drift' | 'route_drift' | 'auth_drift' | 'server_fault';
export type EventStatus = 'healed' | 'pending' | 'failed' | 'unhandled';
export type RepairStrategy = 'deterministic' | 'llm' | 'merged' | 'agentic_search' | 'heuristic' | 'none';
export type DataSource = 'mock' | 'real';
export type ConnectionStatus = 'connected' | 'degraded' | 'offline';
export type ServiceStatus = 'healthy' | 'warning' | 'critical';
export type AgentMode = 'baseline' | 'adaptive';

export interface ReMorphDiagnostics {
  llm_attempted: boolean;
  llm_succeeded: boolean;
  fallback_used: boolean;
  docs_source: string;
  docs_confidence?: number | null;
  selected_endpoint_path?: string | null;
  spec_hash?: string | null;
  spec_version?: string | null;
  scenario_type?: string | null;
  failure_reason?: string | null;
  retry_succeeded?: boolean | null;
  total_recovery_steps?: number | null;
  final_reward?: number | null;
}

export interface ReMorphEvent {
  id: string;
  type: EventType;
  status: EventStatus;
  timestamp: string;
  target_url: string;
  method: string;
  error_code: number;
  message: string;
  raw_payload?: unknown;
  fixed_payload?: unknown;
  fixed_url?: string | null;
  fixed_headers?: Record<string, string> | null;
  confidence: number;
  processing_ms: number;
  strategy: RepairStrategy;
  reasoning: string;
  healing_action: string;
  source_component: string;
  retry_count: number;
  diagnostics: ReMorphDiagnostics;
}

export interface WorkflowRequestShape {
  method: string;
  url: string;
  headers?: Record<string, string> | null;
  payload?: unknown;
}

export interface WorkflowEpisode {
  id: string;
  scenario_type: EventType;
  agent_type: AgentMode;
  request_id: string | null;
  success: boolean;
  final_status_code: number;
  retries_used: number;
  reward: number;
  latency_ms: number;
  repair_strategy: RepairStrategy | 'cache';
  healing_action: string | null;
  selected_endpoint_path: string | null;
  route_match_confidence: number | null;
  cache_hit: boolean;
  llm_attempted: boolean;
  llm_succeeded: boolean;
  original_request: WorkflowRequestShape;
  healed_request?: WorkflowRequestShape | null;
  trapped_error?: {
    error_code: number;
    error_message: string;
    source_component: string;
  } | null;
  reward_breakdown: Record<string, number>;
}

export interface StageStatus {
  id: string;
  label: string;
  status: 'waiting' | 'active' | 'complete' | 'error';
  detail: string;
}

export interface FlowPacket {
  id: string;
  label: string;
  variant: 'request' | 'healed' | 'destination';
  detail: string;
}

export interface NetworkProfile {
  latency_ms: number;
  retries: number;
  timeout_risk: 'low' | 'medium' | 'high';
  next_retry_ms: number | null;
}

export interface RuntimeFlow {
  request_packet: FlowPacket;
  healed_packet: FlowPacket;
  destination_packet: FlowPacket;
  stages: StageStatus[];
  confidence_score: number;
  completion_badge: string;
  network: NetworkProfile;
}

export interface SessionState {
  operator_name: string;
  role: string;
  auth_state: 'authenticated' | 'reauth_required';
  environment: 'mock-lab' | 'staging' | 'production';
}

export interface DashboardMetrics {
  success_rate: number;
  unresolved_count: number;
  average_latency_ms: number;
  average_confidence: number;
  total_events: number;
  healed_events: number;
}

export interface BenchmarkAggregate {
  success_rate: number;
  avg_retries: number;
  avg_latency_ms: number;
  reward_average: number;
  per_scenario_accuracy: Record<string, number>;
}

export interface BenchmarkSummary {
  baseline: BenchmarkAggregate;
  adaptive: BenchmarkAggregate;
  deltas: {
    success_rate_delta: number;
    avg_retries_delta: number;
    avg_latency_delta_ms: number;
    reward_average_delta: number;
  };
}

export interface TrainingReadiness {
  agent_type: AgentMode;
  sample_count: number;
  train_sample_count: number;
  eval_sample_count: number;
  success_rate: number;
  avg_reward: number;
  scenarios_covered: string[];
  latest_run_label: string;
}

export interface RuntimeService {
  id: string;
  label: string;
  detail: string;
  status: ServiceStatus;
  latency_ms: number | null;
}

export interface DashboardSnapshot {
  events: ReMorphEvent[];
  workflows: WorkflowEpisode[];
  flow: RuntimeFlow | null;
  metrics: DashboardMetrics;
  benchmark: BenchmarkSummary | null;
  training: TrainingReadiness | null;
  services: RuntimeService[];
  session: SessionState;
  source: DataSource;
  connection: ConnectionStatus;
  last_updated: string | null;
  backend_label: string;
  notices: string[];
}

export interface TelemetryRequestOptions {
  limit?: number;
  signal?: AbortSignal;
}

export interface TelemetryService {
  getSnapshot(options?: TelemetryRequestOptions): Promise<DashboardSnapshot>;
}
