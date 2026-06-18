import type { SummaryRange } from "@/server/contracts/summary";

type SummaryRangePanelProps = {
  title: string;
  description: string;
  summary: SummaryRange;
  emptyCopy: string;
};

export function SummaryRangePanel({ title, description, summary, emptyCopy }: SummaryRangePanelProps) {
  return (
    <section className="card" style={{ padding: 24, display: "grid", gap: 24 }}>
      <div>
        <p style={{ margin: 0, color: "var(--warm)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{title}</p>
        <h1 style={{ marginBottom: 10 }}>{summary.periodStart === summary.periodEnd ? summary.periodStart : `${summary.periodStart} to ${summary.periodEnd}`}</h1>
        <p style={{ margin: 0, color: "var(--muted)", maxWidth: 720 }}>{description}</p>
      </div>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <MetricCard label="Logged days" value={`${summary.loggedDayCount}/${summary.totalDayCount}`} />
        <MetricCard label="Meals" value={summary.mealCount.toString()} />
        <MetricCard label="Calories" value={`${summary.consumed.calories}/${summary.target.calories || 0}`} />
        <MetricCard label="Adherence" value={`${summary.adherencePercent}%`} />
      </div>

      <div style={{ display: "grid", gap: 14 }}>
        {summary.days.some((day) => day.hasData) ? (
          summary.days.map((day) => (
            <div
              key={day.date}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(110px, 140px) 1fr auto",
                gap: 12,
                alignItems: "center",
                padding: 14,
                borderRadius: 16,
                border: "1px solid var(--line)",
                background: day.hasData ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.4)"
              }}
            >
              <strong>{day.date}</strong>
              <div style={{ display: "grid", gap: 6 }}>
                <div
                  style={{
                    height: 10,
                    borderRadius: 999,
                    background: "rgba(27, 26, 24, 0.08)",
                    overflow: "hidden"
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(100, day.target.calories > 0 ? (day.consumed.calories / day.target.calories) * 100 : 0)}%`,
                      height: "100%",
                      background: "var(--accent)"
                    }}
                  />
                </div>
                <p style={{ margin: 0, color: "var(--muted)" }}>
                  {day.consumed.calories} kcal, {day.consumed.proteinGrams}p / {day.consumed.carbsGrams}c / {day.consumed.fatGrams}f
                </p>
              </div>
              <p style={{ margin: 0, color: "var(--muted)" }}>{day.mealCount} meals</p>
            </div>
          ))
        ) : (
          <div style={{ padding: 18, borderRadius: 16, border: "1px dashed var(--line)", color: "var(--muted)" }}>{emptyCopy}</div>
        )}
      </div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: 18, borderRadius: 16, border: "1px solid var(--line)" }}>
      <p style={{ margin: 0, color: "var(--muted)" }}>{label}</p>
      <h2 style={{ marginBottom: 0 }}>{value}</h2>
    </div>
  );
}
