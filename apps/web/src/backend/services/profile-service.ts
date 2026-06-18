import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/backend/lib/supabase-server";
import { profileInputSchema, type ProfileInput, type ProfileRecord } from "@/backend/contracts/profile";
import { ProfilesRepository } from "@/backend/repositories/profiles-repository";

function getDefaultDisplayName(user: User): string | null {
  const metadataName = user.user_metadata?.display_name ?? user.user_metadata?.full_name;

  if (typeof metadataName === "string" && metadataName.trim().length > 0) {
    return metadataName.trim();
  }

  if (user.email) {
    return user.email.split("@")[0] ?? null;
  }

  return null;
}

export async function getOrCreateProfile(user: User): Promise<ProfileRecord> {
  const supabase = await createSupabaseServerClient();
  const repository = new ProfilesRepository(supabase);
  const existing = await repository.findById(user.id);

  if (existing) {
    return existing;
  }

  return repository.createShell({
    id: user.id,
    display_name: getDefaultDisplayName(user),
    timezone: "UTC",
    preferred_units: "metric"
  });
}

export async function updateProfile(user: User, input: ProfileInput): Promise<ProfileRecord> {
  const validated = profileInputSchema.parse(input);
  const supabase = await createSupabaseServerClient();
  const repository = new ProfilesRepository(supabase);

  await getOrCreateProfile(user);

  return repository.update(user.id, validated);
}
