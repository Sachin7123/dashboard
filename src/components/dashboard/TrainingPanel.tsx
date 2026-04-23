import { DatabaseZap, Sparkle } from 'lucide-react';
import { formatRatioAsPercent } from '../../lib/dashboard';
import type { TrainingReadiness } from '../../types/remorph';
import { Panel } from '../layout/Panel';

export function TrainingPanel({
  training,
}: {
  training: TrainingReadiness | null;
}) {
  if (!training) {
    return (
      <Panel eyebrow="Training" title="Policy Readiness" contentClassName="px-4 py-8">
        <div className="text-sm text-text-muted">Training manifest is still warming up.</div>
      </Panel>
    );
  }

  return (
    <Panel
      eyebrow="Training"
      title="Policy Readiness"
      action={<DatabaseZap className="h-4 w-4 text-accent-ai" />}
      contentClassName="px-4 py-4"
    >
      <div className="rounded-[24px] border border-accent-ai/20 bg-accent-ai/10 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full border border-accent-ai/20 bg-black/20 p-2">
            <Sparkle className="h-4 w-4 text-accent-ai" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">{training.latest_run_label}</div>
            <div className="mt-1 text-sm text-text-muted">
              {training.agent_type} episodes converted into reward-labeled train/eval rows
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Samples" value={String(training.sample_count)} />
        <Metric label="Train Rows" value={String(training.train_sample_count)} />
        <Metric label="Eval Rows" value={String(training.eval_sample_count)} />
        <Metric label="Success Rate" value={formatRatioAsPercent(training.success_rate)} />
      </div>

      <div className="mt-4 rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
        <div className="text-[11px] uppercase tracking-[0.28em] text-text-muted">Coverage</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {training.scenarios_covered.map((scenario) => (
            <span
              key={scenario}
              className="rounded-full border border-white/8 bg-black/20 px-3 py-2 text-xs uppercase tracking-[0.2em] text-white"
            >
              {scenario.replace('_', ' ')}
            </span>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
      <div className="text-[10px] uppercase tracking-[0.24em] text-text-muted">{label}</div>
      <div className="mt-2 text-xl font-semibold text-white">{value}</div>
    </div>
  );
}
