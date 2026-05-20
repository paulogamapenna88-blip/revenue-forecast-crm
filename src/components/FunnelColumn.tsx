import { STAGE_COLORS } from "../constants";
import type { FunnelStage, Opportunity } from "../types";
import { BRL } from "../utils/metrics";
import { OpportunityCard } from "./OpportunityCard";

interface FunnelColumnProps {
  stage: FunnelStage;
  opportunities: Opportunity[];
  onOpen: (opportunity: Opportunity) => void;
  onDrop: (stage: FunnelStage) => void;
  onDragStart: (id: string) => void;
}

export function FunnelColumn({ stage, opportunities, onOpen, onDrop, onDragStart }: FunnelColumnProps) {
  const total = opportunities.reduce((sum, opportunity) => sum + opportunity.value, 0);

  return (
    <section
      onDragOver={(event) => event.preventDefault()}
      onDrop={() => onDrop(stage)}
      className="flex min-h-[420px] w-full flex-col rounded-lg border border-slate-200 bg-slate-100/80 p-3 md:w-[310px] md:min-w-[310px]"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${STAGE_COLORS[stage]}`} />
            <h3 className="text-sm font-bold text-slate-800">{stage}</h3>
          </div>
          <p className="mt-1 text-xs text-slate-500">{opportunities.length} oportunidades · {BRL.format(total)}</p>
        </div>
        <span className="rounded-lg bg-white px-2 py-1 text-xs font-bold text-slate-600">{opportunities.length}</span>
      </div>
      <div className="flex flex-1 flex-col gap-3">
        {opportunities.map((opportunity) => (
          <OpportunityCard
            key={opportunity.id}
            opportunity={opportunity}
            onOpen={onOpen}
            onDragStart={onDragStart}
          />
        ))}
        {!opportunities.length && (
          <div className="flex min-h-28 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white/60 text-sm text-slate-400">
            Arraste oportunidades para cá
          </div>
        )}
      </div>
    </section>
  );
}
