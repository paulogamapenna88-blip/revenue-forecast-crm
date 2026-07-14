import { DEFAULT_SEGMENTS, DEFAULT_SERVICES, DEFAULT_SELLERS, LEGACY_SELLER_MAP } from "../constants";
import { mockOpportunities } from "../data/mockData";
import type { CurrentUser, FunnelStage, Opportunity, OpportunityHistory, OptionLists, UserRole } from "../types";

const STORAGE_KEY = "crm-kanban-opportunities";
const OPTION_STORAGE_KEY = "crm-kanban-options";
const AUTH_STORAGE_KEY = "crm-kanban-auth";

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const supabaseUrl = normalizeSupabaseUrl(rawSupabaseUrl);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let authSession: AuthSession | null = readStoredSession();

export function getStoredSession() {
  return authSession;
}

export async function signIn(email: string, password: string) {
  const session = await authRequest<AuthSession>("/auth/v1/token?grant_type=password", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  authSession = session;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  return session;
}

export function signOut() {
  authSession = null;
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export async function loadCurrentUser(): Promise<CurrentUser | null> {
  if (!authSession) return null;
  const authUser = await authRequest<AuthUser>("/auth/v1/user");
  const rows = await supabaseRequest<SupabaseCrmUser[]>(`/rest/v1/crm_users?id=eq.${authUser.id}&select=*`);
  if (rows[0]) return fromSupabaseUser(rows[0]);

  const fallback: CurrentUser = {
    id: authUser.id,
    email: authUser.email,
    name: authUser.email.split("@")[0],
    role: "seller",
    sellerName: authUser.email.split("@")[0],
  };
  await upsertCurrentUser(fallback);
  return fallback;
}

export async function upsertCurrentUser(user: CurrentUser) {
  await supabaseRequest("/rest/v1/crm_users?on_conflict=id", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify(toSupabaseUser(user)),
  });
}

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

export async function deleteOpportunity(id: string) {
  if (!isSupabaseConfigured) return;
  await supabaseRequest(`/rest/v1/opportunities?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: {
      Prefer: "return=minimal",
    },
  });
}

export async function recordStageMove(
  opportunityId: string,
  fromStage: FunnelStage,
  toStage: FunnelStage,
  user: CurrentUser,
) {
  if (!isSupabaseConfigured) return;
  await supabaseRequest("/rest/v1/opportunity_history", {
    method: "POST",
    body: JSON.stringify({
      opportunity_id: opportunityId,
      changed_by: user.id,
      changed_by_name: user.name,
      changed_by_email: user.email,
      from_stage: fromStage,
      to_stage: toStage,
    }),
  });
}

export async function loadOpportunityHistory(opportunityId: string): Promise<OpportunityHistory[]> {
  if (!isSupabaseConfigured) return [];
  const rows = await supabaseRequest<SupabaseOpportunityHistory[]>(
    `/rest/v1/opportunity_history?opportunity_id=eq.${encodeURIComponent(
      opportunityId,
    )}&select=*&order=changed_at.desc`,
  );
  return rows.map(fromSupabaseHistory);
}

export async function loadOptionLists(): Promise<OptionLists> {
  if (isSupabaseConfigured) {
    try {
      const rows = await supabaseRequest<SupabaseOption[]>("/rest/v1/crm_options?select=option_type,name&order=name.asc");
      return mergeOptionLists({
        sellers: rows.filter((row) => row.option_type === "seller").map((row) => row.name),
        segments: rows.filter((row) => row.option_type === "segment").map((row) => row.name),
        services: rows.filter((row) => row.option_type === "service").map((row) => row.name),
      });
    } catch (error) {
      console.warn("Opções do Supabase indisponíveis. Usando listas locais.", error);
    }
  }

  const stored = localStorage.getItem(OPTION_STORAGE_KEY);
  return mergeOptionLists(stored ? JSON.parse(stored) : { sellers: [], segments: [], services: [] });
}

export async function addOption(type: keyof OptionLists, name: string) {
  const normalized = name.trim();
  if (!normalized) return;

  if (isSupabaseConfigured) {
    await supabaseRequest("/rest/v1/crm_options?on_conflict=option_type,name", {
      method: "POST",
      headers: {
        Prefer: "resolution=ignore-duplicates",
      },
      body: JSON.stringify(toSupabaseOption(type, normalized)),
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

export async function deleteOption(type: keyof OptionLists, name: string) {
  const normalized = name.trim();
  if (!normalized) return;

  if (isSupabaseConfigured) {
    const optionType = optionListKeyToSupabaseType(type);
    await supabaseRequest(
      `/rest/v1/crm_options?option_type=eq.${encodeURIComponent(optionType)}&name=eq.${encodeURIComponent(normalized)}`,
      {
        method: "DELETE",
        headers: {
          Prefer: "return=minimal",
        },
      },
    );
    return;
  }

  const current = await loadOptionLists();
  const next = mergeOptionLists({
    ...current,
    [type]: current[type].filter((option) => option !== normalized),
  });
  localStorage.setItem(OPTION_STORAGE_KEY, JSON.stringify(next));
}

async function supabaseRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response = await fetch(`${supabaseUrl}${path}`, {
    ...init,
    headers: {
      apikey: supabaseAnonKey ?? "",
      Authorization: `Bearer ${authSession?.access_token ?? supabaseAnonKey}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (response.status === 401 && authSession?.refresh_token) {
    await refreshSession();
    response = await fetch(`${supabaseUrl}${path}`, {
      ...init,
      headers: {
        apikey: supabaseAnonKey ?? "",
        Authorization: `Bearer ${authSession?.access_token ?? supabaseAnonKey}`,
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
    });
  }

  if (!response.ok) {
    throw new Error(`Erro Supabase ${response.status}: ${await response.text()}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

async function authRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response = await fetch(`${supabaseUrl}${path}`, {
    ...init,
    headers: {
      apikey: supabaseAnonKey ?? "",
      Authorization: `Bearer ${authSession?.access_token ?? supabaseAnonKey}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (response.status === 401 && authSession?.refresh_token && !path.includes("grant_type=refresh_token")) {
    await refreshSession();
    response = await fetch(`${supabaseUrl}${path}`, {
      ...init,
      headers: {
        apikey: supabaseAnonKey ?? "",
        Authorization: `Bearer ${authSession?.access_token ?? supabaseAnonKey}`,
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
    });
  }

  if (!response.ok) {
    throw new Error(`Erro Auth ${response.status}: ${await response.text()}`);
  }

  return response.json();
}

async function refreshSession() {
  if (!authSession?.refresh_token) return;
  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey ?? "",
      Authorization: `Bearer ${supabaseAnonKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token: authSession.refresh_token }),
  });

  if (!response.ok) {
    signOut();
    throw new Error("Sessão expirada. Entre novamente.");
  }

  authSession = await response.json();
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authSession));
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
  option_type: "seller" | "segment" | "service";
  name: string;
}

interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: AuthUser;
}

interface AuthUser {
  id: string;
  email: string;
}

interface SupabaseCrmUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  seller_name: string;
}

interface SupabaseOpportunityHistory {
  id: number;
  opportunity_id: string;
  changed_at: string;
  changed_by_name: string;
  changed_by_email: string;
  from_stage: FunnelStage | null;
  to_stage: FunnelStage;
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

function fromSupabaseUser(row: SupabaseCrmUser): CurrentUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    sellerName: row.seller_name,
  };
}

function toSupabaseUser(user: CurrentUser): SupabaseCrmUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    seller_name: user.sellerName,
  };
}

function fromSupabaseHistory(row: SupabaseOpportunityHistory): OpportunityHistory {
  return {
    id: row.id,
    opportunityId: row.opportunity_id,
    changedAt: row.changed_at,
    changedByName: row.changed_by_name,
    changedByEmail: row.changed_by_email,
    fromStage: row.from_stage ?? "",
    toStage: row.to_stage,
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
    sellers: uniqueSorted(optionLists.sellers?.length ? optionLists.sellers : DEFAULT_SELLERS),
    segments: uniqueSorted(optionLists.segments?.length ? optionLists.segments : DEFAULT_SEGMENTS),
    services: uniqueSorted(optionLists.services?.length ? optionLists.services : DEFAULT_SERVICES),
  };
}

function toSupabaseOption(type: keyof OptionLists, name: string): SupabaseOption {
  return {
    option_type: optionListKeyToSupabaseType(type),
    name,
  };
}

function optionListKeyToSupabaseType(type: keyof OptionLists): SupabaseOption["option_type"] {
  if (type === "sellers") return "seller";
  if (type === "segments") return "segment";
  return "service";
}

function uniqueSorted(values: string[]) {
  return [...new Set(values.filter(Boolean).map((value) => value.trim()))].sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
}

function readStoredSession(): AuthSession | null {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}
