import type { GoalSetRecord } from "@/server/contracts/goals";
import type { MacroTotals, SummaryDay, SummaryRange } from "@/server/contracts/summary";

export function emptyMacroTotals(): MacroTotals {
  return {
    calories: 0,
    proteinGrams: 0,
    carbsGrams: 0,
    fatGrams: 0
  };
}

export function addMacroTotals(left: MacroTotals, right: MacroTotals): MacroTotals {
  return {
    calories: round2(left.calories + right.calories),
    proteinGrams: round2(left.proteinGrams + right.proteinGrams),
    carbsGrams: round2(left.carbsGrams + right.carbsGrams),
    fatGrams: round2(left.fatGrams + right.fatGrams)
  };
}

export function goalSetToMacroTotals(goalSet: GoalSetRecord | null): MacroTotals {
  if (!goalSet) {
    return emptyMacroTotals();
  }

  return {
    calories: goalSet.calorieTarget,
    proteinGrams: goalSet.proteinGramsTarget,
    carbsGrams: goalSet.carbsGramsTarget,
    fatGrams: goalSet.fatGramsTarget
  };
}

export function createEmptySummaryDay(date: string, goalSet: GoalSetRecord | null): SummaryDay {
  return {
    date,
    consumed: emptyMacroTotals(),
    target: goalSetToMacroTotals(goalSet),
    mealCount: 0,
    goalSetId: goalSet?.id ?? null,
    hasData: false
  };
}

export function buildSummaryRange(range: SummaryRange["range"], periodStart: string, periodEnd: string, days: SummaryDay[]): SummaryRange {
  const consumed = days.reduce((total, day) => addMacroTotals(total, day.consumed), emptyMacroTotals());
  const target = days.reduce((total, day) => addMacroTotals(total, day.target), emptyMacroTotals());
  const mealCount = days.reduce((total, day) => total + day.mealCount, 0);
  const loggedDayCount = days.filter((day) => day.hasData).length;
  const adherencePercent = target.calories > 0 ? round2((consumed.calories / target.calories) * 100) : 0;

  return {
    range,
    periodStart,
    periodEnd,
    consumed,
    target,
    adherencePercent,
    mealCount,
    loggedDayCount,
    totalDayCount: days.length,
    days
  };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
