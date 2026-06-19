import { NextResponse } from "next/server";
import { requireUser } from "@/backend/services/auth-service";
import { getLatestGoalSet, upsertGoalSet } from "@/backend/services/goals-service";

export async function GET() {
  try {
    const user = await requireUser();
    const goalSet = await getLatestGoalSet(user);

    return NextResponse.json({ goalSet });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireUser();
    const payload = (await request.json()) as Record<string, unknown>;
    const goalSet = await upsertGoalSet(user, {
      calorieTarget: Number(payload.calorieTarget),
      proteinGramsTarget: Number(payload.proteinGramsTarget),
      carbsGramsTarget: Number(payload.carbsGramsTarget),
      fatGramsTarget: Number(payload.fatGramsTarget),
      effectiveFrom: String(payload.effectiveFrom ?? "")
    });

    return NextResponse.json({ goalSet });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unexpected goals error";
}
