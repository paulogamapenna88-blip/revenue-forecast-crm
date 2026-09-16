import type { BusinessUnit, FunnelStage, LossReason, OfficialSalesSegment } from "./types";

export const BUSINESS_UNITS: { id: BusinessUnit; label: string; shortLabel: string }[] = [
  {
    id: "freight_projects",
    label: "Freight Forwarder e Projetos",
    shortLabel: "Freight / Projetos",
  },
  {
    id: "maritime_port",
    label: "Serviços Marítimos e Portuários",
    shortLabel: "Marítimo / Portuário",
  },
];

export const DEFAULT_BUSINESS_UNIT: BusinessUnit = "freight_projects";

export const DEFAULT_SELLERS = [
  "Paulo Penna",
  "Luiz Garcia",
  "Leonardo Sgrancio",
  "Erik de Oliveira",
  "Mykaela Moreira",
  "Carlos Cesario",
];

export const SELLERS = DEFAULT_SELLERS;

export const LEGACY_SELLER_MAP: Record<string, string> = {
  Paulo: "Paulo Penna",
  Mariana: "Luiz Garcia",
  Carlos: "Leonardo Sgrancio",
  Fernanda: "Erik de Oliveira",
  Rodrigo: "Mykaela Moreira",
};

export const COMMERCIAL_GOAL = 850000;

export const DEFAULT_SEGMENTS: OfficialSalesSegment[] = [
  "Serviços Portuários",
  "Serviços Marítimos",
  "Freight Forwarder",
  "Projetos",
];

export const BUSINESS_UNIT_SEGMENTS: Record<BusinessUnit, OfficialSalesSegment[]> = {
  freight_projects: ["Freight Forwarder", "Projetos"],
  maritime_port: ["Serviços Portuários", "Serviços Marítimos"],
};

export const DEFAULT_SERVICES_BY_SEGMENT: Record<OfficialSalesSegment, string[]> = {
  "Serviços Portuários": ["Apoio Portuário", "Operação Portuária", "Armazenagem", "Inspeção em Terminal"],
  "Serviços Marítimos": ["Agenciamento Marítimo", "Consultoria Operacional", "Inspeção Técnica", "Apoio Marítimo"],
  "Freight Forwarder": ["Frete Internacional", "Desembaraço Aduaneiro", "Logística Integrada", "Carga Projeto"],
  "Projetos": ["Gestão de Projetos", "Treinamento", "Implantação Operacional", "Consultoria Especializada"],
};

export const DEFAULT_SERVICES = Object.values(DEFAULT_SERVICES_BY_SEGMENT).flat();

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

export const LOSS_REASONS: LossReason[] = [
  "preço",
  "concorrência",
  "timing",
  "sem fit",
  "sem oferta",
  "desistência",
  "prazo",
  "outro",
];

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
