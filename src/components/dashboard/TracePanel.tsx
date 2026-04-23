import { motion } from 'framer-motion';
import { TerminalSquare } from 'lucide-react';
import { parseReasoning } from '../../lib/dashboard';
import type { ReMorphEvent } from '../../types/remorph';
import { Panel } from '../layout/Panel';

export function TracePanel({ event }: { event: ReMorphEvent | null }) {
  const steps = event ? parseReasoning(event.reasoning) : [];

  return (
    <Panel
      eyebrow="Cognitive Trace"
      title="Reasoning Stream"
      sticky
      action={<TerminalSquare className="h-4 w-4 text-accent-ai" />}
      contentClassName="min-h-0 overflow-y-auto custom-scrollbar px-4 py-4 bg-[#06070a]/70 xl:max-h-[24rem]"
    >
      {event ? (
        <div className="space-y-3 font-mono">
          <div className="grid gap-2 rounded-2xl border border-white/8 bg-white/[0.03] p-3 text-xs text-text-muted">
            <div className="break-words">ID: <span className="text-white">{event.id}</span></div>
            <div className="break-words">ACTION: <span className="text-accent-live">{event.healing_action}</span></div>
            <div className="break-words">STRATEGY: <span className="text-accent-success">{event.strategy}</span></div>
          </div>

          {steps.map((step, index) => (
            <motion.div
              key={`${event.id}-${step}-${index}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="rounded-2xl border border-white/7 bg-white/[0.03] p-3"
            >
              <div className="text-[10px] uppercase tracking-[0.32em] text-accent-ai">Stage {index + 1}</div>
              <div className="mt-2 break-words text-sm leading-6 text-text-primary">{step}</div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-text-muted">
          Select an event to inspect the reasoning trace.
        </div>
      )}
    </Panel>
  );
}
