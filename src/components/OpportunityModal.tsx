import { CalendarDays, Edit3, X } from "lucide-react";
import type { Opportunity } from "../types";
import { BRL, stalledDays } from "../utils/metrics";
import { AddOpportunityForm } from "./AddOpportunityForm";

interface OpportunityModalProps {
  opportunity: Opportunity | null;
  mode: "view" | "edit" | "create";
  onClose: () => void;
  onEdit: () => void;
  onSave: (opportunity: Opportunity) => void;
}

export function OpportunityModal({ opportunity, mode, onClose, onEdit, onSave }: OpportunityModalProps) {
  if (!opportunity && mode !== "create") {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40">
      <aside className="h-full w-full overflow-y-auto bg-white p-5 shadow-soft sm:max-w-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-normal text-slate-500">
              {mode === "create" ? "Nova oportunidade" : opportunity?.stage}
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              {mode === "create" ? "Adicionar oportunidade" : opportunity?.clientName}
            </h2>
          </div>
          <button onClick={onClose} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
            <X size={20} />
          </button>
        </div>

        {mode === "view" && opportunity ? (
          <div className="space-y-5">
            <div className="rounded-lg bg-slate-950 p-4 text-white">
              <p className="text-sm text-white/70">{opportunity.opportunityName}</p>
              <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                <strong className="text-3xl">{BRL.format(opportunity.value)}</strong>
                <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-bold">{opportunity.probability}% forecast</span>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="Vendedor" value={opportunity.seller} />
              <Info label="Prioridade" value={opportunity.priority} />
              <Info label="Origem" value={opportunity.source} />
              <Info label="Tipo de lead" value={opportunity.leadType} />
              <Info label="Temperatura" value={opportunity.temperature} />
              <Info label="Tempo parado" value={`${stalledDays(opportunity)} dias`} />
              <Info label="Entrada" value={formatDate(opportunity.enteredAt)} />
              <Info label="Última interação" value={formatDate(opportunity.lastInteractionAt)} />
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs font-bold uppercase tracking-normal text-slate-500">Próximo passo</p>
              <p className="mt-2 text-sm text-slate-700">{opportunity.nextStep}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-normal text-slate-500">Histórico do funil</p>
              <div className="space-y-2">
                {Object.entries(opportunity.stageHistory).map(([stage, date]) => (
                  <p key={stage} className="flex items-center gap-2 text-sm text-slate-600">
                    <CalendarDays size={15} />
                    <span className="font-semibold text-slate-800">{stage}</span>
                    <span>{formatDate(date ?? "")}</span>
                  </p>
                ))}
              </div>
            </div>
            <button
              onClick={onEdit}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
            >
              <Edit3 size={17} />
              Editar oportunidade
            </button>
          </div>
        ) : (
          <AddOpportunityForm initial={mode === "edit" ? opportunity : null} onSubmit={onSave} onCancel={onClose} />
        )}
      </aside>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase tracking-normal text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function formatDate(value: string) {
  return value ? new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR") : "-";
}
