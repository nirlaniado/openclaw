export type NutrientTotals = {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
};

export type FoodLookupResult = {
  source: "usda";
  fdcId: number;
  description: string;
  servingText: string;
  servingGrams?: number;
  totals: NutrientTotals;
};
