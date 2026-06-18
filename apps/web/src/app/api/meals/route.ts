import { NextResponse } from "next/server";
import { requireUser } from "@/server/services/auth-service";
import { listMealsForDate, logMeal } from "@/server/services/meal-log-service";
import type { MealRecord } from "@/server/contracts/meals";
import { formatDateInTimeZone } from "@/server/services/date-utils";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const timezone = searchParams.get("timezone") ?? "UTC";
    const date = searchParams.get("date") ?? formatDateInTimeZone(new Date(), timezone);
    const meals = await listMealsForDate(user, date, timezone);

    return NextResponse.json({ meals });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const payload = (await request.json()) as Record<string, unknown>;
    const eatenAtValue = String(payload.eatenAt ?? "");
    const meal = await logMeal(user, {
      eatenAt: normalizeDateTimeInput(eatenAtValue),
      timezone: String(payload.timezone ?? "UTC"),
      locale: typeof payload.locale === "string" ? payload.locale : undefined,
      mealText: String(payload.mealText ?? ""),
      mealType: String(payload.mealType ?? "other") as MealRecord["mealType"]
    });

    return NextResponse.json(meal, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}

function normalizeDateTimeInput(value: string) {
  if (value.includes("T") && value.endsWith("Z")) {
    return value;
  }

  return `${value}:00.000Z`;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unexpected meals error";
}
