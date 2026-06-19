import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/backend/lib/supabase-server";
import { type SummaryDay, type SummaryRange } from "@/backend/contracts/summary";
import { DailySummariesRepository } from "@/backend/repositories/daily-summaries-repository";
import { GoalSetsRepository } from "@/backend/repositories/goal-sets-repository";
import { listDatesInclusive, endOfMonth, endOfWeek, formatDateInTimeZone, startOfMonth, startOfWeek } from "@/backend/services/date-utils";
import { buildSummaryRange, createEmptySummaryDay, goalSetToMacroTotals } from "@/backend/services/summary-math";

export async function getDailySummary(user: User, date: string): Promise<SummaryRange> {
  return getSummaryRange(user, "day", date, date);
}

export async function getWeeklySummary(user: User, date: string): Promise<SummaryRange> {
  return getSummaryRange(user, "week", startOfWeek(date), endOfWeek(date));
}

export async function getMonthlySummary(user: User, date: string): Promise<SummaryRange> {
  return getSummaryRange(user, "month", startOfMonth(date), endOfMonth(date));
}

export async function getTodaySummary(user: User, timezone: string): Promise<SummaryRange> {
  const today = formatDateInTimeZone(new Date(), timezone);

  return getDailySummary(user, today);
}

async function getSummaryRange(user: User, range: SummaryRange["range"], startDate: string, endDate: string): Promise<SummaryRange> {
  const supabase = await createSupabaseServerClient();
  const dailySummariesRepository = new DailySummariesRepository(supabase);
  const goalSetsRepository = new GoalSetsRepository(supabase);
  const days = listDatesInclusive(startDate, endDate);
  const [summaries, goalSets] = await Promise.all([
    dailySummariesRepository.listByUserAndDateRange(user.id, startDate, endDate),
    Promise.all(days.map((date) => goalSetsRepository.findActiveForDate(user.id, date)))
  ]);
  const summariesByDate = new Map(summaries.map((summary) => [summary.summaryDate, summary]));
  const summaryDays: SummaryDay[] = days.map((date, index) => {
    const summary = summariesByDate.get(date);
    const goalSet = goalSets[index] ?? null;

    if (!summary) {
      return createEmptySummaryDay(date, goalSet);
    }

    return {
      date,
      consumed: summary.consumed,
      target: goalSetToMacroTotals(goalSet),
      mealCount: summary.mealCount,
      goalSetId: summary.goalSetId,
      hasData: summary.mealCount > 0
    };
  });

  return buildSummaryRange(range, startDate, endDate, summaryDays);
}
