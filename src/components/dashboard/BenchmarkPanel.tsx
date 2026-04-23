import { BarChart3, TrendingUp } from 'lucide-react';
import { formatRatioAsPercent, formatSignedNumber } from '../../lib/dashboard';
import type { BenchmarkSummary } from '../../types/remorph';
import { Panel } from '../layout/Panel';

export function BenchmarkPanel({
  benchmark,
}: {
  benchmark: BenchmarkSummary | null;
}) {
  if (!benchmark) {
    return (
      <Panel eyebrow="Benchmark" title="Adaptive Advantage" contentClassName="px-4 py-8">
        <EmptyState label="Benchmark report not loaded yet." />
      </Panel>
    );
  }

  return (
    <Panel
      eyebrow="Benchmark"
      title="Adaptive Advantage"
      action={<BarChart3 className="h-4 w-4 text-accent-live" />}
      contentClassName="px-4 py-4"
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.9fr)]">
        <div className="grid gap-3 md:grid-cols-2">
          <AggregateCard
            title="Baseline"
            tone="error"
            success={benchmark.baseline.success_rate}
            reward={benchmark.baseline.reward_average}
            retries={benchmark.baseline.avg_retries}
          />
          <AggregateCard
            title="Adaptive"
            tone="success"
            success={benchmark.adaptive.success_rate}
            reward={benchmark.adaptive.reward_average}
            retries={benchmark.adaptive.avg_retries}
          />
        </div>

        <div className="rounded-[24px] border border-accent-live/20 bg-accent-live/10 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-accent-live/20 bg-black/20 p-2">
              <TrendingUp className="h-4 w-4 text-accent-live" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.28em] text-text-muted">Delta</div>
              <div className="mt-1 text-lg font-semibold text-white">
                {formatSignedNumber(benchmark.deltas.reward_average_delta)} reward
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <Metric label="Success" value={formatRatioAsPercent(benchmark.deltas.success_rate_delta)} />
            <Metric label="Retries" value={formatSignedNumber(benchmark.deltas.avg_retries_delta)} />
            <Metric label="Latency" value={`${formatSignedNumber(benchmark.deltas.avg_latency_delta_ms)}ms`} />
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {Object.entries(benchmark.adaptive.per_scenario_accuracy).map(([scenario, value]) => (
          <div key={scenario} className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
            <div className="text-[11px] uppercase tracking-[0.28em] text-text-muted">
              {scenario.replace('_', ' ')}
            </div>
            <div className="mt-3 text-2xl font-semibold text-white">{formatRatioAsPercent(value)}</div>
            <div className="mt-2 text-sm text-text-muted">Adaptive recovery accuracy</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function AggregateCard({
  title,
  tone,
  success,
  reward,
  retries,
}: {
  title: string;
  tone: 'success' | 'error';
  success: number;
  reward: number;
  retries: number;
}) {
  return (
    <div className={`rounded-[24px] border p-4 ${tone === 'success' ? 'border-accent-success/20 bg-accent-success/10' : 'border-accent-error/20 bg-accent-error/10'}`}>
      <div className="text-[11px] uppercase tracking-[0.28em] text-text-muted">{title}</div>
      <div className="mt-3 text-3xl font-semibold text-white">{formatRatioAsPercent(success)}</div>
      <div className="mt-2 text-sm text-text-muted">success rate</div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Metric label="Reward" value={reward.toFixed(2)} />
        <Metric label="Retries" value={retries.toFixed(2)} />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/6 bg-black/20 px-3 py-3">
      <div className="text-[10px] uppercase tracking-[0.24em] text-text-muted">{label}</div>
      <div className="mt-2 text-sm text-white">{value}</div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return <div className="text-sm text-text-muted">{label}</div>;
}
