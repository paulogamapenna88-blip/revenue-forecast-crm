import { BarChart3, Download, LogOut, Plus } from "lucide-react";
import type { CurrentUser } from "../types";

interface HeaderProps {
  onAdd: () => void;
  onExport: () => void;
  storageMode: "local" | "cloud";
  currentUser: CurrentUser;
  onSignOut: () => void;
}

export function Header({ onAdd, onExport, storageMode, currentUser, onSignOut }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1800px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-white">
            <BarChart3 size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-950 sm:text-2xl">Revenue Forecast CRM</h1>
            <p className="text-sm text-slate-500">
              Kanban executivo para previsibilidade, gargalos e conversão comercial.
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-400">
              Desenvolvido por Paulo Penna - Atlantic Ocean Services 2026
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">
            {storageMode === "cloud" ? "Dados na nuvem" : "Modo local"}
          </span>
          <span className="rounded-full bg-cyan-50 px-3 py-2 text-xs font-bold text-cyan-700">
            {currentUser.name} · {currentUser.role === "manager" ? "Gestor" : "Vendedor"}
          </span>
          <button
            onClick={onExport}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Download size={18} />
            Exportar CSV
          </button>
          <button
            onClick={onAdd}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-slate-800"
          >
            <Plus size={18} />
            Nova oportunidade
          </button>
          <button
            onClick={onSignOut}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
