import type { SupabaseClient } from "@supabase/supabase-js";
import type { MacroTotals } from "@/server/contracts/summary";

export type DailySummaryRecord = {
  id: string;
  userId: string;
  summaryDate: string;
  goalSetId: string | null;
  consumed: MacroTotals;
  mealCount: number;
  lastRecomputedAt: string;
};

type DailySummaryRow = {
  id: string;
  user_id: string;
  summary_date: string;
  goal_set_id: string | null;
  calories_consumed: number;
  protein_grams_consumed: number;
  carbs_grams_consumed: number;
  fat_grams_consumed: number;
  meal_count: number;
  last_recomputed_at: string;
};

function mapDailySummary(row: DailySummaryRow): DailySummaryRecord {
  return {
    id: row.id,
    userId: row.user_id,
    summaryDate: row.summary_date,
    goalSetId: row.goal_set_id,
    consumed: {
      calories: row.calories_consumed,
      proteinGrams: row.protein_grams_consumed,
      carbsGrams: row.carbs_grams_consumed,
      fatGrams: row.fat_grams_consumed
    },
    mealCount: row.meal_count,
    lastRecomputedAt: row.last_recomputed_at
  };
}

export class DailySummariesRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async upsert(
    userId: string,
    summaryDate: string,
    goalSetId: string | null,
    consumed: MacroTotals,
    mealCount: number
  ): Promise<DailySummaryRecord> {
    const { data, error } = await this.supabase
      .from("daily_summaries")
      .upsert(
        {
          user_id: userId,
          summary_date: summaryDate,
          goal_set_id: goalSetId,
          calories_consumed: consumed.calories,
          protein_grams_consumed: consumed.proteinGrams,
          carbs_grams_consumed: consumed.carbsGrams,
          fat_grams_consumed: consumed.fatGrams,
          meal_count: mealCount,
          last_recomputed_at: new Date().toISOString()
        },
        {
          onConflict: "user_id,summary_date"
        }
      )
      .select("*")
      .single<DailySummaryRow>();

    if (error) {
      throw new Error(`Failed to upsert daily summary: ${error.message}`);
    }

    return mapDailySummary(data);
  }

  async listByUserAndDateRange(userId: string, startDate: string, endDate: string): Promise<DailySummaryRecord[]> {
    const { data, error } = await this.supabase
      .from("daily_summaries")
      .select("*")
      .eq("user_id", userId)
      .gte("summary_date", startDate)
      .lte("summary_date", endDate)
      .order("summary_date", { ascending: true })
      .returns<DailySummaryRow[]>();

    if (error) {
      throw new Error(`Failed to load daily summaries: ${error.message}`);
    }

    return (data ?? []).map(mapDailySummary);
  }

  async findByUserAndDate(userId: string, date: string): Promise<DailySummaryRecord | null> {
    const { data, error } = await this.supabase
      .from("daily_summaries")
      .select("*")
      .eq("user_id", userId)
      .eq("summary_date", date)
      .maybeSingle<DailySummaryRow>();

    if (error) {
      throw new Error(`Failed to load daily summary: ${error.message}`);
    }

    return data ? mapDailySummary(data) : null;
  }
}
