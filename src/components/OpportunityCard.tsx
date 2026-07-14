import { CalendarClock, Flame, MoveRight, UserRound } from "lucide-react";
import type { Opportunity } from "../types";
import { BRL, stalledDays } from "../utils/metrics";

interface OpportunityCardProps {
  opportunity: Opportunity;
  onOpen: (opportunity: Opportunity) => void;
  onDragStart: (id: string) => void;
}

export function OpportunityCard({ opportunity, onOpen, onDragStart }: OpportunityCardProps) {
  const stalled = stalledDays(opportunity);
  const isCritical = stalled > 14;
  const isWarning = stalled > 7 && stalled <= 14;

  return (
    <article
      draggable
      onDragStart={() => onDragStart(opportunity.id)}
      onClick={() => onOpen(opportunity)}
      className={`cursor-grab rounded-lg border bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft active:cursor-grabbing ${
        isCritical ? "border-red-300 ring-2 ring-red-100" : isWarning ? "border-orange-300 ring-2 ring-orange-100" : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-950">{opportunity.clientName}</p>
          <p className="mt-1 text-xs font-medium text-slate-500">{opportunity.opportunityName}</p>
        </div>
        <span className={priorityClass(opportunity.priority)}>{opportunity.priority}</span>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <strong className="text-base text-slate-950">{BRL.format(opportunity.value)}</strong>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
          {opportunity.probability}%
        </span>
      </div>
      <div className="mt-3 space-y-2 text-xs text-slate-500">
        <p className="rounded-md bg-slate-50 px-2 py-1 font-semibold text-slate-600">
          {opportunity.segment} · {opportunity.service}
        </p>
        <p className="flex items-center gap-2">
          <UserRound size={14} />
          {opportunity.seller} · {opportunity.source} · {opportunity.leadType}
        </p>
        <p className="flex items-center gap-2">
          <CalendarClock size={14} />
          Última interação há {stalled} dias
        </p>
        <p className="flex items-center gap-2 text-slate-700">
          <MoveRight size={14} />
          {opportunity.nextStep}
        </p>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className={temperatureClass(opportunity.temperature)}>
          <Flame size={13} />
          {opportunity.temperature}
        </span>
        {(isCritical || isWarning) && (
          <span className={`text-xs font-bold ${isCritical ? "text-red-600" : "text-orange-600"}`}>
            parado
          </span>
        )}
      </div>
    </article>
  );
}

function priorityClass(priority: Opportunity["priority"]) {
  const base = "rounded-full px-2 py-1 text-[11px] font-bold uppercase tracking-normal";
  const classes = {
    baixa: "bg-slate-100 text-slate-600",
    média: "bg-amber-100 text-amber-700",
    alta: "bg-red-100 text-red-700",
  };
  return `${base} ${classes[priority]}`;
}

function temperatureClass(temperature: Opportunity["temperature"]) {
  const base = "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold";
  const classes = {
    frio: "bg-blue-50 text-blue-700",
    morno: "bg-orange-50 text-orange-700",
    quente: "bg-red-50 text-red-700",
  };
  return `${base} ${classes[temperature]}`;
}
