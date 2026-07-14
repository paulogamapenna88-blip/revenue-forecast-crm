import { Save } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { FUNNEL_STAGES, SELLERS } from "../constants";
import type { FunnelStage, LeadSource, LeadTemperature, Opportunity, OptionLists, PredictableRevenueLeadType, Priority } from "../types";
import { todayIso } from "../utils/metrics";

interface AddOpportunityFormProps {
  initial?: Opportunity | null;
  onSubmit: (opportunity: Opportunity) => void;
  onCancel: () => void;
  optionLists: OptionLists;
  onAddOption: (type: keyof OptionLists, name: string) => Promise<void>;
}

const sources: LeadSource[] = ["outbound", "inbound", "indicação", "evento", "parceiro"];
const leadTypes: PredictableRevenueLeadType[] = ["Seeds", "Nets", "Spears"];
const priorities: Priority[] = ["baixa", "média", "alta"];
const temperatures: LeadTemperature[] = ["frio", "morno", "quente"];

export function AddOpportunityForm({ initial, onSubmit, onCancel, optionLists, onAddOption }: AddOpportunityFormProps) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const stage = data.get("stage") as FunnelStage;
    const enteredAt = String(data.get("enteredAt"));
    const opportunity: Opportunity = {
      id: initial?.id ?? `opp-${crypto.randomUUID()}`,
      clientName: String(data.get("clientName")),
      opportunityName: String(data.get("opportunityName")),
      segment: String(data.get("segment")),
      service: String(data.get("service")),
      seller: String(data.get("seller")),
      value: Number(data.get("value")),
      enteredAt,
      lastInteractionAt: String(data.get("lastInteractionAt")),
      nextStep: String(data.get("nextStep")),
      probability: Number(data.get("probability")),
      source: data.get("source") as LeadSource,
      leadType: data.get("leadType") as PredictableRevenueLeadType,
      stage,
      priority: data.get("priority") as Priority,
      temperature: data.get("temperature") as LeadTemperature,
      closedAt: stage.startsWith("Fechado") ? (initial?.closedAt ?? todayIso()) : undefined,
      stageHistory: {
        ...(initial?.stageHistory ?? { Prospecção: enteredAt }),
        [stage]: initial?.stageHistory?.[stage] ?? todayIso(),
      },
    };
    onSubmit(opportunity);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Cliente" name="clientName" defaultValue={initial?.clientName} required />
        <Field label="Oportunidade" name="opportunityName" defaultValue={initial?.opportunityName} required />
        <ManagedSelect
          label="Segmento"
          name="segment"
          defaultValue={initial?.segment ?? optionLists.segments[0] ?? "Não informado"}
          options={optionLists.segments}
          onAdd={(value) => onAddOption("segments", value)}
        />
        <ManagedSelect
          label="Serviço"
          name="service"
          defaultValue={initial?.service ?? optionLists.services[0] ?? "Não informado"}
          options={optionLists.services}
          onAdd={(value) => onAddOption("services", value)}
        />
        <Select label="Vendedor" name="seller" defaultValue={initial?.seller ?? SELLERS[0]} options={SELLERS} />
        <Field label="Valor estimado" name="value" type="number" defaultValue={initial?.value ?? 50000} required />
        <Field label="Entrada no funil" name="enteredAt" type="date" defaultValue={initial?.enteredAt ?? todayIso()} required />
        <Field label="Última interação" name="lastInteractionAt" type="date" defaultValue={initial?.lastInteractionAt ?? todayIso()} required />
        <Select label="Etapa" name="stage" defaultValue={initial?.stage ?? FUNNEL_STAGES[0]} options={FUNNEL_STAGES} />
        <Field label="Probabilidade (%)" name="probability" type="number" min={0} max={100} defaultValue={initial?.probability ?? 15} required />
        <Select label="Origem" name="source" defaultValue={initial?.source ?? "outbound"} options={sources} />
        <Select label="Tipo Receita Previsível" name="leadType" defaultValue={initial?.leadType ?? "Spears"} options={leadTypes} />
        <Select label="Prioridade" name="priority" defaultValue={initial?.priority ?? "média"} options={priorities} />
        <Select label="Temperatura" name="temperature" defaultValue={initial?.temperature ?? "morno"} options={temperatures} />
      </div>
      <label className="block">
        <span className="mb-1 block text-xs font-bold uppercase tracking-normal text-slate-500">Próximo passo</span>
        <textarea
          name="nextStep"
          defaultValue={initial?.nextStep ?? "Definir próxima ação comercial"}
          rows={3}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:bg-white"
        />
      </label>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">
          Cancelar
        </button>
        <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
          <Save size={16} />
          Salvar
        </button>
      </div>
    </form>
  );
}

function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-normal text-slate-500">{label}</span>
      <input
        {...props}
        className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-slate-500 focus:bg-white"
      />
    </label>
  );
}

function Select({ label, options, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; options: string[] }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-normal text-slate-500">{label}</span>
      <select
        {...props}
        className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-slate-500 focus:bg-white"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function ManagedSelect({
  label,
  name,
  defaultValue,
  options,
  onAdd,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: string[];
  onAdd: (value: string) => Promise<void>;
}) {
  const [value, setValue] = useState(defaultValue);
  const [newValue, setNewValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const currentOptions = options.includes(value) ? options : [value, ...options].filter(Boolean);

  async function handleAdd() {
    const normalized = newValue.trim();
    if (!normalized) return;
    await onAdd(normalized);
    setValue(normalized);
    setNewValue("");
    setIsAdding(false);
  }

  return (
    <div className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-normal text-slate-500">{label}</span>
      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <select
          name={name}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-slate-500 focus:bg-white"
        >
          {currentOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setIsAdding((current) => !current)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600"
        >
          Adicionar
        </button>
      </div>
      {isAdding ? (
        <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]">
          <input
            value={newValue}
            onChange={(event) => setNewValue(event.target.value)}
            placeholder={`Novo ${label.toLowerCase()}`}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-500"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white"
          >
            Incluir
          </button>
        </div>
      ) : null}
    </div>
  );
}
