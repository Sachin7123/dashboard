import {
  ActivitySquare,
  BrainCircuit,
  Crosshair,
  ShieldCheck,
  Sparkles,
  Waypoints,
} from 'lucide-react';
import type { RuntimeFlow, WorkflowEpisode } from '../../types/remorph';
import { Panel } from '../layout/Panel';

const stageIcons = [Crosshair, ActivitySquare, BrainCircuit, Sparkles, Waypoints, ShieldCheck];

export function PipelineMap({
  flow,
  workflow,
}: {
  flow: RuntimeFlow | null;
  workflow: WorkflowEpisode | null;
}) {
  const stages = [
    {
      label: 'Input Request',
      detail: workflow?.original_request.method ?? flow?.request_packet.label ?? 'Awaiting ingress',
      status: 'complete',
    },
    {
      label: 'Detection',
      detail: workflow?.trapped_error?.error_message ?? 'Proxy trap packaged',
      status: workflow?.trapped_error ? 'complete' : 'active',
    },
    {
      label: 'Intelligence',
      detail: workflow?.repair_strategy ?? 'Reasoning engine armed',
      status: workflow?.agent_type === 'baseline' ? 'error' : 'complete',
    },
    {
      label: 'Self-Healing',
      detail: workflow?.healing_action ?? 'Patch selection pending',
      status: workflow?.success ? 'complete' : workflow?.agent_type === 'adaptive' ? 'active' : 'error',
    },
    {
      label: 'Recovery',
      detail: `${workflow?.retries_used ?? flow?.network.retries ?? 0} retry cycles`,
      status: workflow?.success ? 'complete' : 'error',
    },
    {
      label: 'Success',
      detail: workflow?.success ? `HTTP ${workflow.final_status_code}` : 'Operator review needed',
      status: workflow?.success ? 'complete' : 'error',
    },
  ] as const;

  return (
    <Panel
      eyebrow="Product Vision"
      title="Input -> Detection -> Intelligence -> Self-Healing -> Recovery -> Success"
      contentClassName="px-4 py-4"
    >
      <div className="grid gap-3 xl:grid-cols-6">
        {stages.map((stage, index) => {
          const Icon = stageIcons[index];
          const statusClass =
            stage.status === 'complete'
              ? 'border-accent-success/20 bg-accent-success/10'
              : stage.status === 'active'
                ? 'border-accent-live/20 bg-accent-live/10'
                : 'border-accent-error/20 bg-accent-error/10';

          return (
            <div key={stage.label} className={`rounded-[24px] border p-4 ${statusClass}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="text-[11px] uppercase tracking-[0.28em] text-text-muted">
                  {stage.label}
                </div>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <div className="mt-3 text-sm font-medium text-white">{stage.detail}</div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
