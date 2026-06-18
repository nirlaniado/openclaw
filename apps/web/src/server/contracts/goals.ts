import { z } from "zod";

export const goalsInputSchema = z.object({
  calorieTarget: z.number().int().positive(),
  proteinGramsTarget: z.number().positive(),
  carbsGramsTarget: z.number().positive(),
  fatGramsTarget: z.number().positive(),
  effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

export const goalSetRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  calorieTarget: z.number().int(),
  proteinGramsTarget: z.number(),
  carbsGramsTarget: z.number(),
  fatGramsTarget: z.number(),
  effectiveFrom: z.string(),
  effectiveTo: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string().datetime()
});

export type GoalsInput = z.infer<typeof goalsInputSchema>;
export type GoalSetRecord = z.infer<typeof goalSetRecordSchema>;
