import type { User } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
  repository: {
    findById: vi.fn(),
    createShell: vi.fn(),
    update: vi.fn()
  }
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.createSupabaseServerClient
}));

vi.mock("@/server/repositories/profiles-repository", () => ({
  ProfilesRepository: class {
    constructor() {
      return mocks.repository;
    }
  }
}));

import { getOrCreateProfile, updateProfile } from "./profile-service";

describe("profile-service", () => {
  const user = {
    id: "8af0f9ad-1f43-4710-aa5f-b7e91351aa65",
    email: "nir@example.com",
    user_metadata: {}
  } as User;

  beforeEach(() => {
    mocks.createSupabaseServerClient.mockReset().mockResolvedValue({});
    mocks.repository.findById.mockReset();
    mocks.repository.createShell.mockReset();
    mocks.repository.update.mockReset();
  });

  it("creates a shell profile from user metadata when one does not exist", async () => {
    mocks.repository.findById.mockResolvedValue(null);
    mocks.repository.createShell.mockResolvedValue({
      id: user.id,
      displayName: "Nir",
      age: null,
      sex: null,
      heightCm: null,
      weightKg: null,
      timezone: "UTC",
      preferredUnits: "metric",
      isComplete: false,
      createdAt: "2026-06-18T08:00:00.000Z",
      updatedAt: "2026-06-18T08:00:00.000Z"
    });

    await getOrCreateProfile({
      ...user,
      user_metadata: { full_name: " Nir " }
    } as User);

    expect(mocks.repository.createShell).toHaveBeenCalledWith({
      id: user.id,
      display_name: "Nir",
      timezone: "UTC",
      preferred_units: "metric"
    });
  });

  it("falls back to the email prefix for shell profile display name", async () => {
    mocks.repository.findById.mockResolvedValue(null);
    mocks.repository.createShell.mockResolvedValue({});

    await getOrCreateProfile(user);

    expect(mocks.repository.createShell).toHaveBeenCalledWith(
      expect.objectContaining({
        display_name: "nir"
      })
    );
  });

  it("updates the validated profile after ensuring a shell exists", async () => {
    mocks.repository.findById.mockResolvedValue({
      id: user.id
    });
    mocks.repository.update.mockResolvedValue({
      id: user.id,
      displayName: "Nir",
      age: 33,
      sex: "male",
      heightCm: 182,
      weightKg: 80,
      timezone: "Asia/Hebron",
      preferredUnits: "metric",
      isComplete: true,
      createdAt: "2026-06-18T08:00:00.000Z",
      updatedAt: "2026-06-18T08:05:00.000Z"
    });

    const profile = await updateProfile(user, {
      displayName: "Nir",
      age: 33,
      sex: "male",
      heightCm: 182,
      weightKg: 80,
      timezone: "Asia/Hebron",
      preferredUnits: "metric"
    });

    expect(mocks.repository.update).toHaveBeenCalledWith(user.id, {
      displayName: "Nir",
      age: 33,
      sex: "male",
      heightCm: 182,
      weightKg: 80,
      timezone: "Asia/Hebron",
      preferredUnits: "metric"
    });
    expect(profile.isComplete).toBe(true);
  });
});
