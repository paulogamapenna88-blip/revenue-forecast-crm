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

export type UserRole = "manager" | "seller";

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  sellerName: string;
}

export interface OpportunityHistory {
  id: number;
  opportunityId: string;
  changedAt: string;
  changedByName: string;
  changedByEmail: string;
  fromStage: FunnelStage | "";
  toStage: FunnelStage;
}

export interface Filters {
  seller: string;
  stage: string;
  segment: string;
  service: string;
  search: string;
}

export interface OptionLists {
  sellers: string[];
  segments: string[];
  services: string[];
}
