import { NextResponse } from "next/server";
import { requireUser } from "@/backend/services/auth-service";
import { getOrCreateProfile, updateProfile } from "@/backend/services/profile-service";

export async function GET() {
  try {
    const user = await requireUser();
    const profile = await getOrCreateProfile(user);

    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireUser();
    const payload = (await request.json()) as Record<string, unknown>;
    const profile = await updateProfile(user, {
      displayName: String(payload.displayName ?? ""),
      age: Number(payload.age),
      sex: String(payload.sex ?? "") as "female" | "male" | "other" | "prefer_not_to_say",
      heightCm: Number(payload.heightCm),
      weightKg: Number(payload.weightKg),
      timezone: String(payload.timezone ?? ""),
      preferredUnits: String(payload.preferredUnits ?? "metric") as "metric" | "imperial"
    });

    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unexpected profile error";
}
