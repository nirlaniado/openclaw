import { z } from "zod";

export const profileInputSchema = z.object({
  displayName: z.string().min(1).max(80),
  age: z.number().int().min(13).max(120),
  sex: z.enum(["female", "male", "other", "prefer_not_to_say"]),
  heightCm: z.number().positive(),
  weightKg: z.number().positive(),
  timezone: z.string().min(1),
  preferredUnits: z.enum(["metric", "imperial"]).default("metric")
});

export const profileRecordSchema = z.object({
  id: z.string().uuid(),
  displayName: z.string().nullable(),
  age: z.number().int().nullable(),
  sex: z.enum(["female", "male", "other", "prefer_not_to_say"]).nullable(),
  heightCm: z.number().nullable(),
  weightKg: z.number().nullable(),
  timezone: z.string(),
  preferredUnits: z.enum(["metric", "imperial"]),
  isComplete: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export type ProfileInput = z.infer<typeof profileInputSchema>;
export type ProfileRecord = z.infer<typeof profileRecordSchema>;
