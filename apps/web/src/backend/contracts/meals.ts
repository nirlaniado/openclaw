import { z } from "zod";

export const mealCreateSchema = z.object({
  eatenAt: z.string().datetime(),
  timezone: z.string().min(1),
  locale: z.string().min(2).max(20).optional(),
  mealText: z.string().min(1).max(2000),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack", "other"]).default("other")
});

export const mealItemRecordSchema = z.object({
  id: z.string().uuid(),
  mealId: z.string().uuid(),
  source: z.string(),
  sourceRef: z.string(),
  description: z.string(),
  quantityText: z.string().nullable(),
  grams: z.number().nullable(),
  calories: z.number(),
  proteinGrams: z.number(),
  carbsGrams: z.number(),
  fatGrams: z.number(),
  createdAt: z.string().datetime()
});

export const mealRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack", "other"]),
  source: z.string(),
  mealText: z.string(),
  status: z.enum(["draft", "reviewed", "logged", "error"]),
  eatenAt: z.string().datetime(),
  loggedAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  items: z.array(mealItemRecordSchema)
});

export type MealType = z.infer<typeof mealCreateSchema>["mealType"];
export type MealCreateInput = z.infer<typeof mealCreateSchema>;
export type MealItemRecord = z.infer<typeof mealItemRecordSchema>;
export type MealRecord = z.infer<typeof mealRecordSchema>;
