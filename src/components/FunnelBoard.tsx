import { FUNNEL_STAGES } from "../constants";
import type { FunnelStage, Opportunity } from "../types";
import { FunnelColumn } from "./FunnelColumn";

interface FunnelBoardProps {
  opportunities: Opportunity[];
  onOpen: (opportunity: Opportunity) => void;
  onMove: (id: string, stage: FunnelStage) => void;
}

export function FunnelBoard({ opportunities, onOpen, onMove }: FunnelBoardProps) {
  let draggedId = "";

  function handleDragStart(id: string) {
    draggedId = id;
    window.sessionStorage.setItem("draggedOpportunity", id);
  }

  function handleDrop(stage: FunnelStage) {
    const id = draggedId || window.sessionStorage.getItem("draggedOpportunity");
    if (id) {
      onMove(id, stage);
    }
    window.sessionStorage.removeItem("draggedOpportunity");
  }

  return (
    <main className="mx-auto max-w-[1800px] px-4 py-5 sm:px-6">
      <div className="kanban-scroll flex flex-col gap-4 overflow-x-auto pb-4 md:flex-row">
        {FUNNEL_STAGES.map((stage) => (
          <FunnelColumn
            key={stage}
            stage={stage}
            opportunities={opportunities.filter((opportunity) => opportunity.stage === stage)}
            onOpen={onOpen}
            onDrop={handleDrop}
            onDragStart={handleDragStart}
          />
        ))}
      </div>
    </main>
  );
}
