import { COMMERCIAL_GOAL, FUNNEL_STAGES, OPEN_STAGES } from "../constants";
import type { FunnelStage, Opportunity } from "../types";

export const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export const numberFormat = new Intl.NumberFormat("pt-BR");

export function daysBetween(start: string, end = todayIso()) {
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  return Math.max(0, Math.round((endDate.getTime() - startDate.getTime()) / 86400000));
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function isOpenOpportunity(opportunity: Opportunity) {
  return !opportunity.stage.startsWith("Fechado");
}

export function stalledDays(opportunity: Opportunity) {
  return daysBetween(opportunity.lastInteractionAt);
}

export function stageConversion(opportunities: Opportunity[], stage: FunnelStage) {
  const stageIndex = FUNNEL_STAGES.indexOf(stage);
  const nextStage = FUNNEL_STAGES[stageIndex + 1];
  const entered = opportunities.filter((opportunity) => opportunity.stageHistory[stage]).length;
  const advanced = nextStage
    ? opportunities.filter((opportunity) => opportunity.stageHistory[stage] && opportunity.stageHistory[nextStage]).length
    : entered;
  return entered ? advanced / entered : 0;
}

export function calculateMetrics(opportunities: Opportunity[]) {
  const open = opportunities.filter(isOpenOpportunity);
  const won = opportunities.filter((opportunity) => opportunity.stage === "Fechado - Ganhou");
  const lost = opportunities.filter((opportunity) => opportunity.stage === "Fechado - Perdido");
  const closed = [...won, ...lost];
  const openRevenue = open.reduce((sum, opportunity) => sum + opportunity.value, 0);
  const wonRevenue = won.reduce((sum, opportunity) => sum + opportunity.value, 0);
  const lostRevenue = lost.reduce((sum, opportunity) => sum + opportunity.value, 0);
  const weightedForecast = open.reduce(
    (sum, opportunity) => sum + opportunity.value * (opportunity.probability / 100),
    0,
  );
  const avgTicket = won.length ? wonRevenue / won.length : 0;
  const avgConversionDays = closed.length
    ? closed.reduce((sum, opportunity) => sum + daysBetween(opportunity.enteredAt, opportunity.closedAt ?? todayIso()), 0) /
      closed.length
    : 0;
  const winRate = closed.length ? won.length / closed.length : 0;
  const lossRate = closed.length ? lost.length / closed.length : 0;
  const stageCounts = FUNNEL_STAGES.reduce(
    (acc, stage) => ({ ...acc, [stage]: opportunities.filter((opportunity) => opportunity.stage === stage).length }),
    {} as Record<FunnelStage, number>,
  );
  const stageStallAverage = FUNNEL_STAGES.reduce(
    (acc, stage) => {
      const stageOps = opportunities.filter((opportunity) => opportunity.stage === stage);
      acc[stage] = stageOps.length
        ? stageOps.reduce((sum, opportunity) => sum + stalledDays(opportunity), 0) / stageOps.length
        : 0;
      return acc;
    },
    {} as Record<FunnelStage, number>,
  );
  const stageConversionRates = OPEN_STAGES.reduce(
    (acc, stage) => {
      acc[stage] = stageConversion(opportunities, stage);
      return acc;
    },
    {} as Partial<Record<FunnelStage, number>>,
  );
  const withoutNextAction = open.filter((opportunity) =>
    opportunity.nextStep.toLowerCase().includes("sem próxima ação"),
  ).length;
  const stalledOverSeven = open.filter((opportunity) => stalledDays(opportunity) > 7).length;
  const negotiationRanking = rankBySeller(
    opportunities.filter((opportunity) => opportunity.stage === "Negociação"),
    "value",
  );
  const wonRanking = rankWonBySeller(won);

  return {
    openRevenue,
    wonRevenue,
    lostRevenue,
    weightedForecast,
    totalOpportunities: opportunities.length,
    stageCounts,
    overallConversionRate: opportunities.length ? won.length / opportunities.length : 0,
    stageConversionRates,
    avgTicket,
    avgConversionDays,
    stageStallAverage,
    winRate,
    lossRate,
    pipelineCoverage: openRevenue / COMMERCIAL_GOAL,
    withoutNextAction,
    stalledOverSeven,
    negotiationRanking,
    wonRanking,
  };
}

function rankBySeller(opportunities: Opportunity[], field: "value") {
  const totals = opportunities.reduce<Record<string, number>>((acc, opportunity) => {
    acc[opportunity.seller] = (acc[opportunity.seller] || 0) + opportunity[field];
    return acc;
  }, {});
  return Object.entries(totals)
    .map(([seller, value]) => ({ seller, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
}

function rankWonBySeller(opportunities: Opportunity[]) {
  const totals = opportunities.reduce<Record<string, { count: number; value: number }>>((acc, opportunity) => {
    acc[opportunity.seller] ??= { count: 0, value: 0 };
    acc[opportunity.seller].count += 1;
    acc[opportunity.seller].value += opportunity.value;
    return acc;
  }, {});
  return Object.entries(totals)
    .map(([seller, data]) => ({ seller, ...data }))
    .sort((a, b) => b.count - a.count || b.value - a.value)
    .slice(0, 5);
}
