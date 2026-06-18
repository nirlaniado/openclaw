export type TimeRange = "day" | "week" | "month";

export type MacroTotals = {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
};

export type SummarySnapshot = {
  range: TimeRange;
  periodStart: string;
  periodEnd: string;
  consumed: MacroTotals;
  target: MacroTotals;
  adherencePercent: number;
};
