import type { Opportunity } from "../types";

const headers = [
  "Cliente",
  "Oportunidade",
  "Segmento",
  "Serviço",
  "Vendedor",
  "Valor",
  "Entrada no funil",
  "Última interação",
  "Próximo passo",
  "Probabilidade",
  "Origem",
  "Tipo Receita Previsível",
  "Etapa",
  "Prioridade",
  "Temperatura",
  "Data de fechamento",
];

export function exportOpportunitiesCsv(opportunities: Opportunity[]) {
  const rows = opportunities.map((opportunity) => [
    opportunity.clientName,
    opportunity.opportunityName,
    opportunity.segment,
    opportunity.service,
    opportunity.seller,
    opportunity.value,
    opportunity.enteredAt,
    opportunity.lastInteractionAt,
    opportunity.nextStep,
    opportunity.probability,
    opportunity.source,
    opportunity.leadType,
    opportunity.stage,
    opportunity.priority,
    opportunity.temperature,
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

function escapeCsv(value: string | number) {
  const text = String(value);
  return `"${text.replace(/"/g, '""')}"`;
}
