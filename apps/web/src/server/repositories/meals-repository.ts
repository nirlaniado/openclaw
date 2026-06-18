import type { SupabaseClient } from "@supabase/supabase-js";
import type { MealCreateInput, MealRecord } from "@/server/contracts/meals";

type MealRow = {
  id: string;
  user_id: string;
  meal_type: MealRecord["mealType"];
  source: string;
  meal_text: string;
  status: MealRecord["status"];
  eaten_at: string;
  logged_at: string;
  created_at: string;
  updated_at: string;
};

function mapMeal(row: MealRow): Omit<MealRecord, "items"> {
  return {
    id: row.id,
    userId: row.user_id,
    mealType: row.meal_type,
    source: row.source,
    mealText: row.meal_text,
    status: row.status,
    eatenAt: row.eaten_at,
    loggedAt: row.logged_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export class MealsRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(userId: string, input: MealCreateInput, status: MealRecord["status"]): Promise<Omit<MealRecord, "items">> {
    const { data, error } = await this.supabase
      .from("meals")
      .insert({
        user_id: userId,
        meal_type: input.mealType,
        source: "manual",
        meal_text: input.mealText,
        status,
        eaten_at: input.eatenAt
      })
      .select("*")
      .single<MealRow>();

    if (error) {
      throw new Error(`Failed to create meal: ${error.message}`);
    }

    return mapMeal(data);
  }

  async listByUserAndDateRange(userId: string, startDate: string, endDateExclusive: string): Promise<Array<Omit<MealRecord, "items">>> {
    const { data, error } = await this.supabase
      .from("meals")
      .select("*")
      .eq("user_id", userId)
      .gte("eaten_at", `${startDate}T00:00:00.000Z`)
      .lt("eaten_at", `${endDateExclusive}T00:00:00.000Z`)
      .order("eaten_at", { ascending: false })
      .returns<MealRow[]>();

    if (error) {
      throw new Error(`Failed to load meals: ${error.message}`);
    }

    return (data ?? []).map(mapMeal);
  }

  async listRecentByUser(userId: string, limit: number): Promise<Array<Omit<MealRecord, "items">>> {
    const { data, error } = await this.supabase
      .from("meals")
      .select("*")
      .eq("user_id", userId)
      .order("eaten_at", { ascending: false })
      .limit(limit)
      .returns<MealRow[]>();

    if (error) {
      throw new Error(`Failed to load recent meals: ${error.message}`);
    }

    return (data ?? []).map(mapMeal);
  }
}
