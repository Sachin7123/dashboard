export type EngineState = 'idle' | 'thinking' | 'healing' | 'success';
export type EventType = 'payload_drift' | 'route_drift' | 'auth_drift' | 'server_fault';
export type EventStatus = 'healed' | 'pending' | 'failed' | 'unhandled';
export type RepairStrategy = 'deterministic' | 'llm' | 'merged' | 'agentic_search' | 'heuristic' | 'none';
export type DataSource = 'mock' | 'real';
export type ConnectionStatus = 'connected' | 'degraded' | 'offline';

export interface ReMorphDiagnostics {
  llm_attempted: boolean;
  llm_succeeded: boolean;
  fallback_used: boolean;
  docs_source: string;
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

export interface DashboardSnapshot {
  events: ReMorphEvent[];
  flow: RuntimeFlow | null;
  metrics: DashboardMetrics;
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
