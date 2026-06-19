export function formatDateInTimeZone(date: Date, timeZone: string): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error(`Unable to format date for timezone ${timeZone}`);
  }

  return `${year}-${month}-${day}`;
}

export function parseDateOnly(dateString: string): Date {
  return new Date(`${dateString}T00:00:00.000Z`);
}

export function addDays(dateString: string, offset: number): string {
  const date = parseDateOnly(dateString);
  date.setUTCDate(date.getUTCDate() + offset);

  return date.toISOString().slice(0, 10);
}

export function startOfWeek(dateString: string): string {
  const date = parseDateOnly(dateString);
  const day = date.getUTCDay();
  const offset = day === 0 ? -6 : 1 - day;

  return addDays(dateString, offset);
}

export function endOfWeek(dateString: string): string {
  return addDays(startOfWeek(dateString), 6);
}

export function startOfMonth(dateString: string): string {
  return `${dateString.slice(0, 8)}01`;
}

export function endOfMonth(dateString: string): string {
  const date = parseDateOnly(startOfMonth(dateString));
  date.setUTCMonth(date.getUTCMonth() + 1, 0);

  return date.toISOString().slice(0, 10);
}

export function listDatesInclusive(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  let current = startDate;

  while (current <= endDate) {
    dates.push(current);
    current = addDays(current, 1);
  }

  return dates;
}
