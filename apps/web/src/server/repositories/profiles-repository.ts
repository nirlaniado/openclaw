import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProfileInput, ProfileRecord } from "@/server/contracts/profile";

type ProfileRow = {
  id: string;
  display_name: string | null;
  age: number | null;
  sex: "female" | "male" | "other" | "prefer_not_to_say" | null;
  height_cm: number | null;
  weight_kg: number | null;
  timezone: string;
  preferred_units: "metric" | "imperial";
  created_at: string;
  updated_at: string;
};

type ProfileShellInsert = {
  id: string;
  display_name: string | null;
  timezone: string;
  preferred_units: "metric" | "imperial";
};

function mapProfile(row: ProfileRow): ProfileRecord {
  const isComplete =
    row.display_name !== null &&
    row.age !== null &&
    row.sex !== null &&
    row.height_cm !== null &&
    row.weight_kg !== null;

  return {
    id: row.id,
    displayName: row.display_name,
    age: row.age,
    sex: row.sex,
    heightCm: row.height_cm,
    weightKg: row.weight_kg,
    timezone: row.timezone,
    preferredUnits: row.preferred_units,
    isComplete,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export class ProfilesRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(userId: string): Promise<ProfileRecord | null> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle<ProfileRow>();

    if (error) {
      throw new Error(`Failed to load profile: ${error.message}`);
    }

    return data ? mapProfile(data) : null;
  }

  async createShell(input: ProfileShellInsert): Promise<ProfileRecord> {
    const { data, error } = await this.supabase
      .from("profiles")
      .insert({
        id: input.id,
        display_name: input.display_name,
        timezone: input.timezone,
        preferred_units: input.preferred_units
      })
      .select("*")
      .single<ProfileRow>();

    if (error) {
      throw new Error(`Failed to create profile shell: ${error.message}`);
    }

    return mapProfile(data);
  }

  async update(userId: string, input: ProfileInput): Promise<ProfileRecord> {
    const { data, error } = await this.supabase
      .from("profiles")
      .update({
        display_name: input.displayName,
        age: input.age,
        sex: input.sex,
        height_cm: input.heightCm,
        weight_kg: input.weightKg,
        timezone: input.timezone,
        preferred_units: input.preferredUnits
      })
      .eq("id", userId)
      .select("*")
      .single<ProfileRow>();

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    return mapProfile(data);
  }
}
