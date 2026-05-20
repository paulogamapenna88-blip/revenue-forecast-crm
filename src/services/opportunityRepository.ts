import { LEGACY_SELLER_MAP } from "../constants";
import { mockOpportunities } from "../data/mockData";
import type { Opportunity } from "../types";

const STORAGE_KEY = "crm-kanban-opportunities";

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const supabaseUrl = normalizeSupabaseUrl(rawSupabaseUrl);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export async function loadOpportunities(): Promise<Opportunity[]> {
  if (isSupabaseConfigured) {
    try {
      const rows = await supabaseRequest<SupabaseOpportunity[]>("/rest/v1/opportunities?select=*&order=created_at.desc");
      return rows.map(fromSupabase).map(normalizeSeller);
    } catch (error) {
      console.warn("Supabase indisponível. Usando localStorage.", error);
    }
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored).map(normalizeSeller) : mockOpportunities;
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

function fromSupabase(row: SupabaseOpportunity): Opportunity {
  return {
    id: row.id,
    clientName: row.client_name,
    opportunityName: row.opportunity_name,
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

function normalizeSeller(opportunity: Opportunity): Opportunity {
  return {
    ...opportunity,
    seller: LEGACY_SELLER_MAP[opportunity.seller] ?? opportunity.seller,
  };
}
