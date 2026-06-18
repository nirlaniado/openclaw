import type { User } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
  repository: {
    findLatestByUserId: vi.fn(),
    updateById: vi.fn(),
    deactivateCurrentGoalSet: vi.fn(),
    create: vi.fn(),
    findActiveForDate: vi.fn()
  },
  getOrCreateProfile: vi.fn()
}));

vi.mock("@/backend/lib/supabase-server", () => ({
  createSupabaseServerClient: mocks.createSupabaseServerClient
}));

vi.mock("@/backend/repositories/goal-sets-repository", () => ({
  GoalSetsRepository: class {
    constructor() {
      return mocks.repository;
    }
  }
}));

vi.mock("@/backend/services/profile-service", () => ({
  getOrCreateProfile: mocks.getOrCreateProfile
}));

import { getActiveGoalSet, upsertGoalSet } from "@/backend/services/goals-service";

describe("goals-service", () => {
  const user = {
    id: "7fd8b038-0c8b-4a9d-8548-d8c60ae0bd6d"
  } as User;

  beforeEach(() => {
    mocks.createSupabaseServerClient.mockReset().mockResolvedValue({});
    mocks.getOrCreateProfile.mockReset().mockResolvedValue({});
    mocks.repository.findLatestByUserId.mockReset();
    mocks.repository.updateById.mockReset();
    mocks.repository.deactivateCurrentGoalSet.mockReset();
    mocks.repository.create.mockReset();
    mocks.repository.findActiveForDate.mockReset();
  });

  it("updates the active goal set when the effective date is unchanged", async () => {
    mocks.repository.findLatestByUserId.mockResolvedValue({
      id: "goal-1",
      isActive: true,
      effectiveFrom: "2026-06-18"
    });
    mocks.repository.updateById.mockResolvedValue({
      id: "goal-1",
      calorieTarget: 2300
    });

    await upsertGoalSet(user, {
      calorieTarget: 2300,
      proteinGramsTarget: 170,
      carbsGramsTarget: 220,
      fatGramsTarget: 75,
      effectiveFrom: "2026-06-18"
    });

    expect(mocks.repository.updateById).toHaveBeenCalledWith("goal-1", expect.objectContaining({ calorieTarget: 2300 }));
    expect(mocks.repository.deactivateCurrentGoalSet).not.toHaveBeenCalled();
    expect(mocks.repository.create).not.toHaveBeenCalled();
  });

  it("closes the current active goal and creates a new one for a new effective date", async () => {
    mocks.repository.findLatestByUserId.mockResolvedValue({
      id: "goal-1",
      isActive: true,
      effectiveFrom: "2026-06-01"
    });
    mocks.repository.create.mockResolvedValue({
      id: "goal-2",
      calorieTarget: 2100
    });

    await upsertGoalSet(user, {
      calorieTarget: 2100,
      proteinGramsTarget: 150,
      carbsGramsTarget: 180,
      fatGramsTarget: 70,
      effectiveFrom: "2026-06-18"
    });

    expect(mocks.repository.deactivateCurrentGoalSet).toHaveBeenCalledWith(user.id, "2026-06-18");
    expect(mocks.repository.create).toHaveBeenCalledWith(user.id, expect.objectContaining({ effectiveFrom: "2026-06-18" }));
  });

  it("delegates active goal lookup by user and date", async () => {
    mocks.repository.findActiveForDate.mockResolvedValue({ id: "goal-1" });

    const goalSet = await getActiveGoalSet(user, "2026-06-18");

    expect(mocks.repository.findActiveForDate).toHaveBeenCalledWith(user.id, "2026-06-18");
    expect(goalSet).toEqual({ id: "goal-1" });
  });
});
