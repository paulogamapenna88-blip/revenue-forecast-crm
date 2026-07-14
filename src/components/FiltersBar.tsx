import { Search } from "lucide-react";
import { FUNNEL_STAGES } from "../constants";
import type { Filters, OptionLists } from "../types";

interface FiltersBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  optionLists: OptionLists;
}

export function FiltersBar({ filters, onChange, optionLists }: FiltersBarProps) {
  return (
    <section className="mx-auto max-w-[1800px] px-4 sm:px-6">
      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-soft lg:grid-cols-[1fr_220px_240px_220px_220px]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={filters.search}
            onChange={(event) => onChange({ ...filters, search: event.target.value })}
            placeholder="Buscar cliente ou oportunidade"
            className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition focus:border-slate-500 focus:bg-white"
          />
        </label>
        <select
          value={filters.seller}
          onChange={(event) => onChange({ ...filters, seller: event.target.value })}
          className="h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-slate-500 focus:bg-white"
        >
          <option value="">Todos os vendedores</option>
          {optionLists.sellers.map((seller) => (
            <option key={seller} value={seller}>
              {seller}
            </option>
          ))}
        </select>
        <select
          value={filters.stage}
          onChange={(event) => onChange({ ...filters, stage: event.target.value })}
          className="h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-slate-500 focus:bg-white"
        >
          <option value="">Todas as etapas</option>
          {FUNNEL_STAGES.map((stage) => (
            <option key={stage} value={stage}>
              {stage}
            </option>
          ))}
        </select>
        <select
          value={filters.segment}
          onChange={(event) => onChange({ ...filters, segment: event.target.value })}
          className="h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-slate-500 focus:bg-white"
        >
          <option value="">Todos os segmentos</option>
          {optionLists.segments.map((segment) => (
            <option key={segment} value={segment}>
              {segment}
            </option>
          ))}
        </select>
        <select
          value={filters.service}
          onChange={(event) => onChange({ ...filters, service: event.target.value })}
          className="h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-slate-500 focus:bg-white"
        >
          <option value="">Todos os serviços</option>
          {optionLists.services.map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}
