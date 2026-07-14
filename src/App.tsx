import { useEffect, useMemo, useState } from "react";
import { FUNNEL_STAGES } from "./constants";
import { DashboardMetrics } from "./components/DashboardMetrics";
import { FiltersBar } from "./components/FiltersBar";
import { FunnelBoard } from "./components/FunnelBoard";
import { Header } from "./components/Header";
import { LoginScreen } from "./components/LoginScreen";
import { OpportunityModal } from "./components/OpportunityModal";
import { exportOpportunitiesCsv } from "./utils/exportCsv";
import {
  isSupabaseConfigured,
  addOption,
  deleteOption,
  deleteOpportunity,
  loadCurrentUser,
  loadOptionLists,
  loadOpportunities,
  persistOpportunities,
  recordStageMove,
  signIn,
  signOut,
  upsertOpportunity,
} from "./services/opportunityRepository";
import type { CurrentUser, Filters, FunnelStage, Opportunity, OptionLists } from "./types";
import { todayIso } from "./utils/metrics";

function App() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [optionLists, setOptionLists] = useState<OptionLists>({ sellers: [], segments: [], services: [] });
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({ seller: "", stage: "", segment: "", service: "", search: "" });
  const [selected, setSelected] = useState<Opportunity | null>(null);
  const [modalMode, setModalMode] = useState<"view" | "edit" | "create">("view");

  useEffect(() => {
    loadCurrentUser()
      .then(async (loadedUser) => {
        setCurrentUser(loadedUser);
        if (!loadedUser) return;
        const [loadedOpportunities, loadedOptions] = await Promise.all([loadOpportunities(), loadOptionLists()]);
        setOpportunities(loadedOpportunities);
        setOptionLists(loadedOptions);
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!isLoading) {
      persistOpportunities(opportunities);
    }
  }, [isLoading, opportunities]);

  const visibleOpportunities = useMemo(() => {
    if (!currentUser) return [];
    return currentUser.role === "manager"
      ? opportunities
      : opportunities.filter((opportunity) => opportunity.seller === currentUser.sellerName);
  }, [currentUser, opportunities]);

  const filteredOpportunities = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return visibleOpportunities.filter((opportunity) => {
      const matchesSeller = !filters.seller || opportunity.seller === filters.seller;
      const matchesStage = !filters.stage || opportunity.stage === filters.stage;
      const matchesSegment = !filters.segment || opportunity.segment === filters.segment;
      const matchesService = !filters.service || opportunity.service === filters.service;
      const matchesSearch =
        !search ||
        opportunity.clientName.toLowerCase().includes(search) ||
        opportunity.opportunityName.toLowerCase().includes(search) ||
        opportunity.segment.toLowerCase().includes(search) ||
        opportunity.service.toLowerCase().includes(search);
      return matchesSeller && matchesStage && matchesSegment && matchesService && matchesSearch;
    });
  }, [filters, visibleOpportunities]);

  async function handleAddOption(type: keyof OptionLists, name: string) {
    await addOption(type, name);
    const nextOptions = await loadOptionLists();
    setOptionLists(nextOptions);
  }

  async function handleDeleteOption(type: keyof OptionLists, name: string) {
    await deleteOption(type, name);
    const nextOptions = await loadOptionLists();
    setOptionLists(nextOptions);
  }

  async function handleLogin(email: string, password: string) {
    await signIn(email, password);
    const loadedUser = await loadCurrentUser();
    setCurrentUser(loadedUser);
    if (!loadedUser) return;
    const [loadedOpportunities, loadedOptions] = await Promise.all([loadOpportunities(), loadOptionLists()]);
    setOpportunities(loadedOpportunities);
    setOptionLists(loadedOptions);
  }

  function handleSignOut() {
    signOut();
    setCurrentUser(null);
    setOpportunities([]);
    setSelected(null);
  }

  function canEditOpportunity(opportunity: Opportunity) {
    return currentUser?.role === "manager" || opportunity.seller === currentUser?.sellerName;
  }

  async function handleMove(id: string, stage: FunnelStage) {
    const sourceOpportunity = opportunities.find((opportunity) => opportunity.id === id);
    if (!sourceOpportunity || sourceOpportunity.stage === stage || !currentUser || !canEditOpportunity(sourceOpportunity)) {
      return;
    }

    const movedOpportunity: Opportunity = {
      ...sourceOpportunity,
      stage,
      probability: stage === "Fechado - Ganhou" ? 100 : stage === "Fechado - Perdido" ? 0 : sourceOpportunity.probability,
      closedAt: stage.startsWith("Fechado") ? todayIso() : undefined,
      lastInteractionAt: todayIso(),
      stageHistory: {
        ...sourceOpportunity.stageHistory,
        [stage]: sourceOpportunity.stageHistory[stage] ?? todayIso(),
      },
    };

    setOpportunities((current) =>
      current.map((opportunity) => (opportunity.id === id ? movedOpportunity : opportunity)),
    );
    await upsertOpportunity(movedOpportunity);
    await recordStageMove(id, sourceOpportunity.stage, stage, currentUser);
  }

  async function handleSave(opportunity: Opportunity) {
    if (!currentUser) return;
    if (currentUser.role !== "manager") {
      opportunity.seller = currentUser.sellerName;
    }
    setOpportunities((current) => {
      const exists = current.some((item) => item.id === opportunity.id);
      return exists ? current.map((item) => (item.id === opportunity.id ? opportunity : item)) : [opportunity, ...current];
    });
    await upsertOpportunity(opportunity);
    setSelected(opportunity);
    setModalMode("view");
  }

  async function handleDeleteOpportunity(opportunity: Opportunity) {
    if (currentUser?.role !== "manager") return;
    const confirmed = window.confirm(`Excluir a oportunidade "${opportunity.opportunityName}" de ${opportunity.clientName}?`);
    if (!confirmed) return;
    await deleteOpportunity(opportunity.id);
    setOpportunities((current) => current.filter((item) => item.id !== opportunity.id));
    setSelected(null);
    setModalMode("view");
  }

  function openCreate() {
    setSelected(null);
    setModalMode("create");
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#eef3f8] px-4 py-10 text-sm font-semibold text-slate-500">
        Carregando CRM...
      </div>
    );
  }

  if (!currentUser && !isLoading) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#eef3f8]">
      <Header
        onAdd={openCreate}
        onExport={() => exportOpportunitiesCsv(visibleOpportunities)}
        storageMode={isSupabaseConfigured ? "cloud" : "local"}
        currentUser={currentUser!}
        onSignOut={handleSignOut}
      />
      <DashboardMetrics opportunities={visibleOpportunities} />
      <FiltersBar filters={filters} onChange={setFilters} optionLists={optionLists} />
      <FunnelBoard
        opportunities={filteredOpportunities}
          onOpen={(opportunity) => {
            setSelected(opportunity);
            setModalMode("view");
          }}
        onMove={handleMove}
      />
      <footer className="mx-auto max-w-[1800px] px-4 pb-8 text-xs text-slate-500 sm:px-6">
        Integração pronta: configure as variáveis do Supabase em <code>.env</code> para colaboração na nuvem. O export CSV
        abre no Google Sheets, Excel ou Looker Studio.
        <span className="mt-2 block font-semibold text-slate-400">
          Desenvolvido por Paulo Penna - Atlantic Ocean Services 2026
        </span>
      </footer>
      {(selected || modalMode === "create") && (
        <OpportunityModal
          opportunity={selected}
          mode={modalMode}
          onClose={() => {
            setSelected(null);
            setModalMode("view");
          }}
          onEdit={() => setModalMode("edit")}
          onSave={handleSave}
          onDelete={handleDeleteOpportunity}
          optionLists={optionLists}
          onAddOption={handleAddOption}
          onDeleteOption={handleDeleteOption}
          currentUser={currentUser!}
          canEdit={selected ? canEditOpportunity(selected) : true}
        />
      )}
    </div>
  );
}

export default App;
