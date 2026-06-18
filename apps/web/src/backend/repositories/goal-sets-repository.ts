import type { SupabaseClient } from "@supabase/supabase-js";
import type { GoalSetRecord, GoalsInput } from "@/backend/contracts/goals";

type GoalSetRow = {
  id: string;
  user_id: string;
  calorie_target: number;
  protein_grams_target: number;
  carbs_grams_target: number;
  fat_grams_target: number;
  effective_from: string;
  effective_to: string | null;
  is_active: boolean;
  created_at: string;
};

function mapGoalSet(row: GoalSetRow): GoalSetRecord {
  return {
    id: row.id,
    userId: row.user_id,
    calorieTarget: row.calorie_target,
    proteinGramsTarget: row.protein_grams_target,
    carbsGramsTarget: row.carbs_grams_target,
    fatGramsTarget: row.fat_grams_target,
    effectiveFrom: row.effective_from,
    effectiveTo: row.effective_to,
    isActive: row.is_active,
    createdAt: row.created_at
  };
}

export class GoalSetsRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findActiveForDate(userId: string, date: string): Promise<GoalSetRecord | null> {
    const { data, error } = await this.supabase
      .from("goal_sets")
      .select("*")
      .eq("user_id", userId)
      .lte("effective_from", date)
      .or(`effective_to.is.null,effective_to.gt.${date}`)
      .order("effective_from", { ascending: false })
      .limit(1)
      .maybeSingle<GoalSetRow>();

    if (error) {
      throw new Error(`Failed to load active goal set: ${error.message}`);
    }

    return data ? mapGoalSet(data) : null;
  }

  async findLatestByUserId(userId: string): Promise<GoalSetRecord | null> {
    const { data, error } = await this.supabase
      .from("goal_sets")
      .select("*")
      .eq("user_id", userId)
      .order("effective_from", { ascending: false })
      .limit(1)
      .maybeSingle<GoalSetRow>();

    if (error) {
      throw new Error(`Failed to load latest goal set: ${error.message}`);
    }

    return data ? mapGoalSet(data) : null;
  }

  async deactivateCurrentGoalSet(userId: string, nextEffectiveFrom: string): Promise<void> {
    const { error } = await this.supabase
      .from("goal_sets")
      .update({
        is_active: false,
        effective_to: nextEffectiveFrom
      })
      .eq("user_id", userId)
      .eq("is_active", true)
      .is("effective_to", null);

    if (error) {
      throw new Error(`Failed to close active goal set: ${error.message}`);
    }
  }

  async create(userId: string, input: GoalsInput): Promise<GoalSetRecord> {
    const { data, error } = await this.supabase
      .from("goal_sets")
      .insert({
        user_id: userId,
        calorie_target: input.calorieTarget,
        protein_grams_target: input.proteinGramsTarget,
        carbs_grams_target: input.carbsGramsTarget,
        fat_grams_target: input.fatGramsTarget,
        effective_from: input.effectiveFrom,
        is_active: true
      })
      .select("*")
      .single<GoalSetRow>();

    if (error) {
      throw new Error(`Failed to create goal set: ${error.message}`);
    }

    return mapGoalSet(data);
  }

  async updateById(goalSetId: string, input: GoalsInput): Promise<GoalSetRecord> {
    const { data, error } = await this.supabase
      .from("goal_sets")
      .update({
        calorie_target: input.calorieTarget,
        protein_grams_target: input.proteinGramsTarget,
        carbs_grams_target: input.carbsGramsTarget,
        fat_grams_target: input.fatGramsTarget,
        effective_from: input.effectiveFrom
      })
      .eq("id", goalSetId)
      .select("*")
      .single<GoalSetRow>();

    if (error) {
      throw new Error(`Failed to update goal set: ${error.message}`);
    }

    return mapGoalSet(data);
  }
}
