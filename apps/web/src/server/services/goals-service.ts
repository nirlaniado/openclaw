import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { goalsInputSchema, type GoalSetRecord, type GoalsInput } from "@/server/contracts/goals";
import { GoalSetsRepository } from "@/server/repositories/goal-sets-repository";
import { getOrCreateProfile } from "@/server/services/profile-service";

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

export async function getActiveGoalSet(user: User, date = getTodayDateString()): Promise<GoalSetRecord | null> {
  const supabase = await createSupabaseServerClient();
  const repository = new GoalSetsRepository(supabase);

  return repository.findActiveForDate(user.id, date);
}

export async function getLatestGoalSet(user: User): Promise<GoalSetRecord | null> {
  const supabase = await createSupabaseServerClient();
  const repository = new GoalSetsRepository(supabase);

  return repository.findLatestByUserId(user.id);
}

export async function upsertGoalSet(user: User, input: GoalsInput): Promise<GoalSetRecord> {
  const validated = goalsInputSchema.parse(input);
  const supabase = await createSupabaseServerClient();
  const repository = new GoalSetsRepository(supabase);

  await getOrCreateProfile(user);

  const latest = await repository.findLatestByUserId(user.id);

  if (latest?.isActive && latest.effectiveFrom === validated.effectiveFrom) {
    return repository.updateById(latest.id, validated);
  }

  if (latest?.isActive) {
    await repository.deactivateCurrentGoalSet(user.id, validated.effectiveFrom);
  }

  return repository.create(user.id, validated);
}
