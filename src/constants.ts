import type { FunnelStage } from "./types";

export const SELLERS = [
  "Paulo Penna",
  "Luiz Garcia",
  "Leonardo Sgrancio",
  "Erik de Oliveira",
  "Mykaela Moreira",
  "Carlos Cesario",
];

export const LEGACY_SELLER_MAP: Record<string, string> = {
  Paulo: "Paulo Penna",
  Mariana: "Luiz Garcia",
  Carlos: "Leonardo Sgrancio",
  Fernanda: "Erik de Oliveira",
  Rodrigo: "Mykaela Moreira",
};

export const COMMERCIAL_GOAL = 850000;

export const DEFAULT_SEGMENTS = [
  "Óleo e Gás",
  "Portos e Terminais",
  "Navegação",
  "Indústria",
  "Energia",
  "Logística",
  "Serviços Marítimos",
];

export const DEFAULT_SERVICES = [
  "Agenciamento Marítimo",
  "Apoio Portuário",
  "Consultoria Operacional",
  "Gestão de Projetos",
  "Inspeção Técnica",
  "Logística Integrada",
  "Treinamento",
];

export const FUNNEL_STAGES: FunnelStage[] = [
  "Prospecção",
  "Lead Identificado",
  "Contato Realizado",
  "Reunião Agendada",
  "Diagnóstico / Qualificação",
  "Proposta Enviada",
  "Negociação",
  "Fechado - Ganhou",
  "Fechado - Perdido",
];

export const OPEN_STAGES = FUNNEL_STAGES.filter((stage) => !stage.startsWith("Fechado"));

export const STAGE_COLORS: Record<FunnelStage, string> = {
  "Prospecção": "bg-sky-500",
  "Lead Identificado": "bg-cyan-500",
  "Contato Realizado": "bg-teal-500",
  "Reunião Agendada": "bg-emerald-500",
  "Diagnóstico / Qualificação": "bg-lime-600",
  "Proposta Enviada": "bg-amber-500",
  "Negociação": "bg-orange-500",
  "Fechado - Ganhou": "bg-green-600",
  "Fechado - Perdido": "bg-rose-600",
};
