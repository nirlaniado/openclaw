import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireUser: vi.fn(),
  getDailySummary: vi.fn(),
  formatDateInTimeZone: vi.fn()
}));

vi.mock("@/server/services/auth-service", () => ({
  requireUser: mocks.requireUser
}));

vi.mock("@/server/services/summary-service", () => ({
  getDailySummary: mocks.getDailySummary
}));

vi.mock("@/server/services/date-utils", () => ({
  formatDateInTimeZone: mocks.formatDateInTimeZone
}));

import { GET } from "./route";

describe("api/summary/daily route", () => {
  beforeEach(() => {
    mocks.requireUser.mockReset().mockResolvedValue({ id: "user-1" });
    mocks.getDailySummary.mockReset().mockResolvedValue({ periodStart: "2026-06-18" });
    mocks.formatDateInTimeZone.mockReset().mockReturnValue("2026-06-18");
  });

  it("loads a summary using the explicit request date", async () => {
    const response = await GET(new Request("http://localhost/api/summary/daily?date=2026-06-17&timezone=UTC"));
    const payload = await response.json();

    expect(mocks.getDailySummary).toHaveBeenCalledWith({ id: "user-1" }, "2026-06-17");
    expect(payload).toEqual({ summary: { periodStart: "2026-06-18" } });
  });

  it("falls back to the timezone-derived date when no date is provided", async () => {
    await GET(new Request("http://localhost/api/summary/daily?timezone=Asia%2FHebron"));

    expect(mocks.formatDateInTimeZone).toHaveBeenCalled();
    expect(mocks.getDailySummary).toHaveBeenCalledWith({ id: "user-1" }, "2026-06-18");
  });
});
