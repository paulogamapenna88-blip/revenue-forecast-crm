export type FunnelStage =
  | "Prospecção"
  | "Lead Identificado"
  | "Contato Realizado"
  | "Reunião Agendada"
  | "Diagnóstico / Qualificação"
  | "Proposta Enviada"
  | "Negociação"
  | "Fechado - Ganhou"
  | "Fechado - Perdido";

export type Priority = "baixa" | "média" | "alta";
export type LeadSource = "outbound" | "inbound" | "indicação" | "evento" | "parceiro";
export type PredictableRevenueLeadType = "Seeds" | "Nets" | "Spears";
export type LeadTemperature = "frio" | "morno" | "quente";

export interface Opportunity {
  id: string;
  clientName: string;
  opportunityName: string;
  segment: string;
  service: string;
  seller: string;
  value: number;
  enteredAt: string;
  lastInteractionAt: string;
  nextStep: string;
  probability: number;
  source: LeadSource;
  leadType: PredictableRevenueLeadType;
  stage: FunnelStage;
  priority: Priority;
  temperature: LeadTemperature;
  closedAt?: string;
  stageHistory: Partial<Record<FunnelStage, string>>;
}

export interface Filters {
  seller: string;
  stage: string;
  segment: string;
  service: string;
  search: string;
}

export interface OptionLists {
  segments: string[];
  services: string[];
}
