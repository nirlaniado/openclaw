import { NextResponse } from "next/server";
import { requireUser } from "@/server/services/auth-service";
import { getDailySummary } from "@/server/services/summary-service";
import { formatDateInTimeZone } from "@/server/services/date-utils";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const timezone = searchParams.get("timezone") ?? "UTC";
    const date = searchParams.get("date") ?? formatDateInTimeZone(new Date(), timezone);
    const summary = await getDailySummary(user, date);

    return NextResponse.json({ summary });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unexpected summary error";
}
