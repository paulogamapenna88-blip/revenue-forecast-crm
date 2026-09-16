import { BUSINESS_UNITS } from "../constants";
import type { Opportunity } from "../types";

const headers = [
  "Base operacional",
  "Cliente",
  "Oportunidade",
  "Segmento",
  "Serviço",
  "Vendedor",
  "Valor",
  "Entrada no funil",
  "Última interação",
  "Próximo passo",
  "Data da próxima ação",
  "Probabilidade",
  "Origem",
  "Tipo Receita Previsível",
  "Etapa",
  "Prioridade",
  "Temperatura",
  "Motivo da perda",
  "Data de fechamento",
];

export function exportOpportunitiesCsv(opportunities: Opportunity[]) {
  const rows = opportunities.map((opportunity) => [
    businessUnitLabel(opportunity.businessUnit),
    opportunity.clientName,
    opportunity.opportunityName,
    opportunity.segment,
    opportunity.service,
    opportunity.seller,
    opportunity.value,
    opportunity.enteredAt,
    opportunity.lastInteractionAt,
    opportunity.nextStep,
    opportunity.nextActionDate ?? "",
    opportunity.probability,
    opportunity.source,
    opportunity.leadType,
    opportunity.stage,
    opportunity.priority,
    opportunity.temperature,
    opportunity.lossReason ?? "",
    opportunity.closedAt ?? "",
  ]);

  const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `crm-oportunidades-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function businessUnitLabel(value: Opportunity["businessUnit"]) {
  return BUSINESS_UNITS.find((unit) => unit.id === value)?.label ?? value;
}

function escapeCsv(value: string | number) {
  const text = String(value);
  return `"${text.replace(/"/g, '""')}"`;
}
