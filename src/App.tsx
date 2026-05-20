import { useEffect, useMemo, useState } from "react";
import { FUNNEL_STAGES } from "./constants";
import { DashboardMetrics } from "./components/DashboardMetrics";
import { FiltersBar } from "./components/FiltersBar";
import { FunnelBoard } from "./components/FunnelBoard";
import { Header } from "./components/Header";
import { OpportunityModal } from "./components/OpportunityModal";
import { exportOpportunitiesCsv } from "./utils/exportCsv";
import {
  isSupabaseConfigured,
  loadOpportunities,
  persistOpportunities,
  upsertOpportunity,
} from "./services/opportunityRepository";
import type { Filters, FunnelStage, Opportunity } from "./types";
import { todayIso } from "./utils/metrics";

function App() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({ seller: "", stage: "", search: "" });
  const [selected, setSelected] = useState<Opportunity | null>(null);
  const [modalMode, setModalMode] = useState<"view" | "edit" | "create">("view");

  useEffect(() => {
    loadOpportunities()
      .then(setOpportunities)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!isLoading) {
      persistOpportunities(opportunities);
    }
  }, [isLoading, opportunities]);

  const filteredOpportunities = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return opportunities.filter((opportunity) => {
      const matchesSeller = !filters.seller || opportunity.seller === filters.seller;
      const matchesStage = !filters.stage || opportunity.stage === filters.stage;
      const matchesSearch =
        !search ||
        opportunity.clientName.toLowerCase().includes(search) ||
        opportunity.opportunityName.toLowerCase().includes(search);
      return matchesSeller && matchesStage && matchesSearch;
    });
  }, [filters, opportunities]);

  function handleMove(id: string, stage: FunnelStage) {
    const sourceOpportunity = opportunities.find((opportunity) => opportunity.id === id);
    if (!sourceOpportunity || sourceOpportunity.stage === stage) {
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
    upsertOpportunity(movedOpportunity);
  }

  function handleSave(opportunity: Opportunity) {
    setOpportunities((current) => {
      const exists = current.some((item) => item.id === opportunity.id);
      return exists ? current.map((item) => (item.id === opportunity.id ? opportunity : item)) : [opportunity, ...current];
    });
    upsertOpportunity(opportunity);
    setSelected(opportunity);
    setModalMode("view");
  }

  function openCreate() {
    setSelected(null);
    setModalMode("create");
  }

  return (
    <div className="min-h-screen bg-[#eef3f8]">
      <Header
        onAdd={openCreate}
        onExport={() => exportOpportunitiesCsv(opportunities)}
        storageMode={isSupabaseConfigured ? "cloud" : "local"}
      />
      {isLoading ? (
        <div className="mx-auto max-w-[1800px] px-4 py-10 text-sm font-semibold text-slate-500 sm:px-6">
          Carregando oportunidades...
        </div>
      ) : null}
      <DashboardMetrics opportunities={opportunities} />
      <FiltersBar filters={filters} onChange={setFilters} />
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
        />
      )}
    </div>
  );
}

export default App;
