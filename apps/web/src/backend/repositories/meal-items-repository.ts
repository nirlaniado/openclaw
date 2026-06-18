import type { SupabaseClient } from "@supabase/supabase-js";
import type { MealItemRecord } from "@/backend/contracts/meals";

type MealItemInsert = {
  mealId: string;
  source: string;
  sourceRef: string;
  description: string;
  quantityText?: string;
  grams?: number;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
};

type MealItemRow = {
  id: string;
  meal_id: string;
  source: string;
  source_ref: string;
  description: string;
  quantity_text: string | null;
  grams: number | null;
  calories: number;
  protein_grams: number;
  carbs_grams: number;
  fat_grams: number;
  created_at: string;
};

function mapMealItem(row: MealItemRow): MealItemRecord {
  return {
    id: row.id,
    mealId: row.meal_id,
    source: row.source,
    sourceRef: row.source_ref,
    description: row.description,
    quantityText: row.quantity_text,
    grams: row.grams,
    calories: row.calories,
    proteinGrams: row.protein_grams,
    carbsGrams: row.carbs_grams,
    fatGrams: row.fat_grams,
    createdAt: row.created_at
  };
}

export class MealItemsRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async createMany(items: MealItemInsert[]): Promise<MealItemRecord[]> {
    if (items.length === 0) {
      return [];
    }

    const { data, error } = await this.supabase
      .from("meal_items")
      .insert(
        items.map((item) => ({
          meal_id: item.mealId,
          source: item.source,
          source_ref: item.sourceRef,
          description: item.description,
          quantity_text: item.quantityText ?? null,
          grams: item.grams ?? null,
          calories: item.calories,
          protein_grams: item.proteinGrams,
          carbs_grams: item.carbsGrams,
          fat_grams: item.fatGrams
        }))
      )
      .select("*")
      .returns<MealItemRow[]>();

    if (error) {
      throw new Error(`Failed to create meal items: ${error.message}`);
    }

    return (data ?? []).map(mapMealItem);
  }

  async listByMealIds(mealIds: string[]): Promise<MealItemRecord[]> {
    if (mealIds.length === 0) {
      return [];
    }

    const { data, error } = await this.supabase
      .from("meal_items")
      .select("*")
      .in("meal_id", mealIds)
      .order("created_at", { ascending: true })
      .returns<MealItemRow[]>();

    if (error) {
      throw new Error(`Failed to load meal items: ${error.message}`);
    }

    return (data ?? []).map(mapMealItem);
  }
}
