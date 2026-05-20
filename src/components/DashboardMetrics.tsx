import {
  AlertTriangle,
  Banknote,
  BarChart2,
  CheckCircle2,
  Clock3,
  Gauge,
  ListChecks,
  Scale,
  Target,
  TimerReset,
  TrendingDown,
  TrendingUp,
  Trophy,
  UsersRound,
  XCircle,
} from "lucide-react";
import { FUNNEL_STAGES } from "../constants";
import type { Opportunity } from "../types";
import { BRL, calculateMetrics, numberFormat } from "../utils/metrics";
import { MetricCard } from "./MetricCard";

interface DashboardMetricsProps {
  opportunities: Opportunity[];
}

export function DashboardMetrics({ opportunities }: DashboardMetricsProps) {
  const metrics = calculateMetrics(opportunities);
  const topStage = Object.entries(metrics.stageCounts).sort((a, b) => b[1] - a[1])[0];
  const worstStall = Object.entries(metrics.stageStallAverage).sort((a, b) => b[1] - a[1])[0];
  const bestNegotiator = metrics.negotiationRanking[0];
  const bestCloser = metrics.wonRanking[0];
  const proposalConversion = metrics.stageConversionRates["Proposta Enviada"] ?? 0;

  const cards = [
    ["Faturamento em aberto", BRL.format(metrics.openRevenue), "bg-sky-600", Banknote, "Pipeline não fechado"],
    ["Receita ganha", BRL.format(metrics.wonRevenue), "bg-emerald-600", CheckCircle2, `${metrics.wonRanking.length} vendedores com ganhos`],
    ["Receita perdida", BRL.format(metrics.lostRevenue), "bg-rose-600", XCircle, "Valor de deals perdidos"],
    ["Forecast ponderado", BRL.format(metrics.weightedForecast), "bg-violet-600", Gauge, "Valor x probabilidade"],
    ["Total de oportunidades", numberFormat.format(metrics.totalOpportunities), "bg-slate-800", ListChecks, "Base mockada local"],
    ["Clientes por etapa", `${topStage?.[1] ?? 0}`, "bg-cyan-600", UsersRound, topStage?.[0] ?? "Sem etapa"],
    ["Conversão geral", percent(metrics.overallConversionRate), "bg-green-700", TrendingUp, "Ganhas sobre total"],
    ["Conversão proposta", percent(proposalConversion), "bg-amber-600", BarChart2, "Avanço pós-proposta"],
    ["Ticket médio", BRL.format(metrics.avgTicket), "bg-indigo-600", Scale, "Receita ganha / ganhos"],
    ["Ciclo médio", `${Math.round(metrics.avgConversionDays)} dias`, "bg-teal-700", Clock3, "Entrada até fechamento"],
    ["Parado médio", `${Math.round(worstStall?.[1] ?? 0)} dias`, "bg-orange-600", TimerReset, worstStall?.[0] ?? "Sem etapa"],
    ["Win rate", percent(metrics.winRate), "bg-lime-700", Trophy, "Ganhas / fechadas"],
    ["Loss rate", percent(metrics.lossRate), "bg-red-700", TrendingDown, "Perdidas / fechadas"],
    ["Pipeline coverage", `${metrics.pipelineCoverage.toFixed(1)}x`, "bg-blue-700", Target, "Meta: R$ 850 mil"],
    ["Sem próxima ação", `${metrics.withoutNextAction}`, "bg-fuchsia-700", AlertTriangle, "Oportunidades abertas"],
    ["Paradas +7 dias", `${metrics.stalledOverSeven}`, "bg-orange-700", AlertTriangle, "Exigem follow-up"],
    [
      "Ranking negociação",
      bestNegotiator ? BRL.format(bestNegotiator.value) : "R$ 0",
      "bg-slate-700",
      Trophy,
      bestNegotiator?.seller ?? "Sem deals",
    ],
    [
      "Ranking ganhos",
      bestCloser ? `${bestCloser.seller}` : "Sem ganhos",
      "bg-emerald-700",
      Trophy,
      bestCloser ? `${bestCloser.count} oportunidades` : "Sem ganhos",
    ],
  ] as const;

  return (
    <section className="mx-auto max-w-[1800px] px-4 py-5 sm:px-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {cards.map(([label, value, tone, Icon, detail]) => (
          <MetricCard key={label} label={label} value={value} tone={tone} Icon={Icon} detail={detail} />
        ))}
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
          <h2 className="text-sm font-bold uppercase tracking-normal text-slate-500">Taxa de conversão por etapa</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {FUNNEL_STAGES.slice(0, -2).map((stage) => (
              <div key={stage}>
                <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                  <span className="truncate">{stage}</span>
                  <b>{percent(metrics.stageConversionRates[stage] ?? 0)}</b>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-slate-900"
                    style={{ width: `${Math.round((metrics.stageConversionRates[stage] ?? 0) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
          <h2 className="text-sm font-bold uppercase tracking-normal text-slate-500">Ranking executivo</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Ranking
              title="Valor em negociação"
              data={metrics.negotiationRanking.map((item): [string, string] => [item.seller, BRL.format(item.value)])}
            />
            <Ranking
              title="Oportunidades ganhas"
              data={metrics.wonRanking.map((item): [string, string] => [
                item.seller,
                `${item.count} deals · ${BRL.format(item.value)}`,
              ])}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Ranking({ title, data }: { title: string; data: Array<[string, string]> }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase tracking-normal text-slate-500">{title}</p>
      <div className="mt-2 space-y-2">
        {data.length ? (
          data.map(([seller, value], index) => (
            <div key={seller} className="flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold text-slate-700">{index + 1}. {seller}</span>
              <span className="text-right text-slate-500">{value}</span>
            </div>
          ))
        ) : (
          <span className="text-sm text-slate-400">Sem dados</span>
        )}
      </div>
    </div>
  );
}

function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}
