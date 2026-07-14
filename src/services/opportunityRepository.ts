import { DEFAULT_SEGMENTS, DEFAULT_SERVICES, LEGACY_SELLER_MAP } from "../constants";
import { mockOpportunities } from "../data/mockData";
import type { Opportunity, OptionLists } from "../types";

const STORAGE_KEY = "crm-kanban-opportunities";
const OPTION_STORAGE_KEY = "crm-kanban-options";

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const supabaseUrl = normalizeSupabaseUrl(rawSupabaseUrl);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export async function loadOpportunities(): Promise<Opportunity[]> {
  if (isSupabaseConfigured) {
    try {
      const rows = await supabaseRequest<SupabaseOpportunity[]>("/rest/v1/opportunities?select=*&order=created_at.desc");
      return rows.map(fromSupabase).map(normalizeOpportunity);
    } catch (error) {
      console.warn("Supabase indisponível. Usando localStorage.", error);
    }
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored).map(normalizeOpportunity) : mockOpportunities;
}

export async function persistOpportunities(opportunities: Opportunity[]) {
  if (!isSupabaseConfigured) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(opportunities));
  }
}

export async function upsertOpportunity(opportunity: Opportunity) {
  if (!isSupabaseConfigured) {
    return;
  }

  await supabaseRequest("/rest/v1/opportunities", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify(toSupabase(opportunity)),
  });
}

export async function loadOptionLists(): Promise<OptionLists> {
  if (isSupabaseConfigured) {
    try {
      const rows = await supabaseRequest<SupabaseOption[]>("/rest/v1/crm_options?select=option_type,name&order=name.asc");
      return mergeOptionLists({
        segments: rows.filter((row) => row.option_type === "segment").map((row) => row.name),
        services: rows.filter((row) => row.option_type === "service").map((row) => row.name),
      });
    } catch (error) {
      console.warn("Opções do Supabase indisponíveis. Usando listas locais.", error);
    }
  }

  const stored = localStorage.getItem(OPTION_STORAGE_KEY);
  return mergeOptionLists(stored ? JSON.parse(stored) : { segments: [], services: [] });
}

export async function addOption(type: keyof OptionLists, name: string) {
  const normalized = name.trim();
  if (!normalized) return;

  if (isSupabaseConfigured) {
    await supabaseRequest("/rest/v1/crm_options", {
      method: "POST",
      headers: {
        Prefer: "resolution=ignore-duplicates",
      },
      body: JSON.stringify({
        option_type: type === "segments" ? "segment" : "service",
        name: normalized,
      }),
    });
    return;
  }

  const current = await loadOptionLists();
  const next = mergeOptionLists({
    ...current,
    [type]: [...current[type], normalized],
  });
  localStorage.setItem(OPTION_STORAGE_KEY, JSON.stringify(next));
}

async function supabaseRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${supabaseUrl}${path}`, {
    ...init,
    headers: {
      apikey: supabaseAnonKey ?? "",
      Authorization: `Bearer ${supabaseAnonKey}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Erro Supabase ${response.status}: ${await response.text()}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

function normalizeSupabaseUrl(url?: string) {
  return url?.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
}

interface SupabaseOpportunity {
  id: string;
  client_name: string;
  opportunity_name: string;
  segment?: string;
  service?: string;
  seller: string;
  value: number;
  entered_at: string;
  last_interaction_at: string;
  next_step: string;
  probability: number;
  source: Opportunity["source"];
  lead_type: Opportunity["leadType"];
  stage: Opportunity["stage"];
  priority: Opportunity["priority"];
  temperature: Opportunity["temperature"];
  closed_at?: string;
  stage_history: Opportunity["stageHistory"];
}

interface SupabaseOption {
  option_type: "segment" | "service";
  name: string;
}

function fromSupabase(row: SupabaseOpportunity): Opportunity {
  return {
    id: row.id,
    clientName: row.client_name,
    opportunityName: row.opportunity_name,
    segment: row.segment || "Não informado",
    service: row.service || "Não informado",
    seller: row.seller,
    value: Number(row.value),
    enteredAt: row.entered_at,
    lastInteractionAt: row.last_interaction_at,
    nextStep: row.next_step,
    probability: row.probability,
    source: row.source,
    leadType: row.lead_type,
    stage: row.stage,
    priority: row.priority,
    temperature: row.temperature,
    closedAt: row.closed_at,
    stageHistory: row.stage_history,
  };
}

function toSupabase(opportunity: Opportunity): SupabaseOpportunity {
  return {
    id: opportunity.id,
    client_name: opportunity.clientName,
    opportunity_name: opportunity.opportunityName,
    segment: opportunity.segment,
    service: opportunity.service,
    seller: opportunity.seller,
    value: opportunity.value,
    entered_at: opportunity.enteredAt,
    last_interaction_at: opportunity.lastInteractionAt,
    next_step: opportunity.nextStep,
    probability: opportunity.probability,
    source: opportunity.source,
    lead_type: opportunity.leadType,
    stage: opportunity.stage,
    priority: opportunity.priority,
    temperature: opportunity.temperature,
    closed_at: opportunity.closedAt,
    stage_history: opportunity.stageHistory,
  };
}

function normalizeOpportunity(opportunity: Opportunity): Opportunity {
  return {
    ...opportunity,
    seller: LEGACY_SELLER_MAP[opportunity.seller] ?? opportunity.seller,
    segment: opportunity.segment || "Não informado",
    service: opportunity.service || "Não informado",
  };
}

function mergeOptionLists(optionLists: OptionLists): OptionLists {
  return {
    segments: uniqueSorted([...DEFAULT_SEGMENTS, ...(optionLists.segments ?? [])]),
    services: uniqueSorted([...DEFAULT_SERVICES, ...(optionLists.services ?? [])]),
  };
}

function uniqueSorted(values: string[]) {
  return [...new Set(values.filter(Boolean).map((value) => value.trim()))].sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
}
