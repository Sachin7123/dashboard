import { FlaskConical } from 'lucide-react';
import type { ReMorphEvent } from '../../types/remorph';
import { Panel } from '../layout/Panel';

export function DiffViewer({ event }: { event: ReMorphEvent | null }) {
  const leftTitle = event?.type === 'route_drift' ? 'Broken route' : event?.type === 'auth_drift' ? 'Broken auth' : 'Broken payload';
  const rightTitle = event?.type === 'route_drift' ? 'Recovered route' : event?.type === 'auth_drift' ? 'Recovered auth' : 'Recovered payload';
  const leftData = event?.type === 'route_drift' ? { url: event.target_url } : event?.type === 'auth_drift' ? { status: event.message, error_code: event.error_code } : event?.raw_payload ?? {};
  const rightData = event?.type === 'route_drift'
    ? { url: event.fixed_url ?? event.target_url }
    : event?.type === 'auth_drift'
      ? event.fixed_headers ?? {}
      : event?.fixed_payload ?? {};

  return (
    <Panel
      eyebrow="Transformation Logic"
      title="Diff + Recovery Output"
      sticky
      action={<FlaskConical className="h-4 w-4 text-accent-live" />}
      contentClassName="min-h-0 overflow-y-auto custom-scrollbar p-4 xl:max-h-[24rem]"
    >
      {event ? (
        <div className="grid gap-4 2xl:grid-cols-2">
          <DiffCard title={leftTitle} tone="error" content={leftData} />
          <DiffCard title={rightTitle} tone="success" content={rightData} />
        </div>
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-text-muted">
          Select an event to inspect the payload transformation.
        </div>
      )}
    </Panel>
  );
}

function DiffCard({
  title,
  tone,
  content,
}: {
  title: string;
  tone: 'success' | 'error';
  content: unknown;
}) {
  return (
    <section className={`min-w-0 rounded-[24px] border p-4 ${tone === 'success' ? 'border-accent-success/20 bg-accent-success/10' : 'border-accent-error/20 bg-accent-error/10'}`}>
      <div className="text-[11px] uppercase tracking-[0.32em] text-text-muted">{title}</div>
      <pre className="mt-3 max-h-[16rem] overflow-auto whitespace-pre-wrap break-all rounded-2xl bg-black/25 p-3 font-mono text-xs leading-6 text-white custom-scrollbar">
        {JSON.stringify(content ?? {}, null, 2)}
      </pre>
    </section>
  );
}
