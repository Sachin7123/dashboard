import type { ReactNode } from 'react';
import { GitCompareArrows, ShieldAlert, Trophy } from 'lucide-react';
import { formatRatioAsPercent } from '../../lib/dashboard';
import type { WorkflowEpisode } from '../../types/remorph';
import { Panel } from '../layout/Panel';
import { StatusPill } from './StatusPill';

export function WorkflowTimeline({
  workflows,
}: {
  workflows: WorkflowEpisode[];
}) {
  return (
    <Panel
      eyebrow="Sprint 4 Episodes"
      title="Adaptive vs Baseline Workflow Replay"
      action={<GitCompareArrows className="h-4 w-4 text-accent-live" />}
      contentClassName="min-h-0 overflow-y-auto custom-scrollbar px-4 py-4 xl:max-h-[28rem]"
    >
      <div className="space-y-3">
        {workflows.map((workflow) => (
          <div key={workflow.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill
                    tone={workflow.success ? 'success' : 'error'}
                    label={workflow.success ? 'Recovered' : 'Failed'}
                  />
                  <StatusPill
                    tone={workflow.agent_type === 'adaptive' ? 'ai' : 'muted'}
                    label={workflow.agent_type}
                  />
                </div>
                <div className="mt-3 break-words text-sm font-semibold leading-6 text-white">
                  {workflow.original_request.method} {workflow.original_request.url}
                </div>
                <div className="mt-1 break-words text-sm leading-6 text-text-muted">
                  {workflow.selected_endpoint_path ?? 'No endpoint selected'} • {workflow.healing_action ?? 'no_change'}
                </div>
              </div>
              <div className="min-w-[4.75rem] text-right">
                <div className="text-lg font-semibold text-white">{workflow.reward.toFixed(2)}</div>
                <div className="text-[11px] uppercase tracking-[0.25em] text-text-muted">
                  reward
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <Signal label="Status Code" value={workflow.final_status_code} />
              <Signal label="Retries" value={workflow.retries_used} />
              <Signal
                label="Route Match"
                value={
                  workflow.route_match_confidence === null
                    ? 'n/a'
                    : formatRatioAsPercent(workflow.route_match_confidence)
                }
              />
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <RewardTile
                icon={<Trophy className="h-4 w-4 text-accent-success" />}
                label="Success Bonus"
                value={workflow.reward_breakdown.success_bonus ?? 0}
              />
              <RewardTile
                icon={<ShieldAlert className="h-4 w-4 text-accent-pending" />}
                label="Failure Penalty"
                value={workflow.reward_breakdown.final_failure_penalty ?? 0}
              />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function Signal({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/6 bg-black/20 px-3 py-3">
      <div className="text-[10px] uppercase tracking-[0.25em] text-text-muted">{label}</div>
      <div className="mt-2 break-words text-sm text-white">{value}</div>
    </div>
  );
}

function RewardTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/6 bg-black/20 px-3 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="rounded-full border border-white/8 bg-white/[0.04] p-2">{icon}</div>
        <span className="min-w-0 break-words text-sm text-white">{label}</span>
      </div>
      <span className="text-sm font-semibold text-white">{value.toFixed(2)}</span>
    </div>
  );
}
