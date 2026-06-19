import { z } from "zod";

const macroTotalsSchema = z.object({
  calories: z.number(),
  proteinGrams: z.number(),
  carbsGrams: z.number(),
  fatGrams: z.number()
});

export const summaryDaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  consumed: macroTotalsSchema,
  target: macroTotalsSchema,
  mealCount: z.number().int().nonnegative(),
  goalSetId: z.string().uuid().nullable(),
  hasData: z.boolean()
});

export const summaryRangeSchema = z.object({
  range: z.enum(["day", "week", "month"]),
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  consumed: macroTotalsSchema,
  target: macroTotalsSchema,
  adherencePercent: z.number(),
  mealCount: z.number().int().nonnegative(),
  loggedDayCount: z.number().int().nonnegative(),
  totalDayCount: z.number().int().positive(),
  days: z.array(summaryDaySchema)
});

export type MacroTotals = z.infer<typeof macroTotalsSchema>;
export type SummaryDay = z.infer<typeof summaryDaySchema>;
export type SummaryRange = z.infer<typeof summaryRangeSchema>;
