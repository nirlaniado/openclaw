import type { SummaryRange } from "@/server/contracts/summary";

type SummaryRangePanelProps = {
  title: string;
  description: string;
  summary: SummaryRange;
  emptyCopy: string;
};

export function SummaryRangePanel({ title, description, summary, emptyCopy }: SummaryRangePanelProps) {
  return (
    <section className="card panel stack-lg">
      <div className="panel-header">
        <p className="eyebrow">{title}</p>
        <h1>{summary.periodStart === summary.periodEnd ? summary.periodStart : `${summary.periodStart} to ${summary.periodEnd}`}</h1>
        <p style={{ maxWidth: 720 }}>{description}</p>
      </div>

      <div className="summary-grid">
        <MetricCard label="Logged days" value={`${summary.loggedDayCount}/${summary.totalDayCount}`} />
        <MetricCard label="Meals" value={summary.mealCount.toString()} />
        <MetricCard label="Calories" value={`${summary.consumed.calories}/${summary.target.calories || 0}`} />
        <MetricCard label="Adherence" value={`${summary.adherencePercent}%`} />
      </div>

      <div className="stack-sm">
        {summary.days.some((day) => day.hasData) ? (
          summary.days.map((day) => (
            <div key={day.date} className={`summary-day${day.hasData ? "" : " summary-day-muted"}`}>
              <strong>{day.date}</strong>
              <div className="stack-sm">
                <div className="progress-rail">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(100, day.target.calories > 0 ? (day.consumed.calories / day.target.calories) * 100 : 0)}%`
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
          <div className="empty-state">{emptyCopy}</div>
        )}
      </div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-card">
      <p style={{ margin: 0, color: "var(--muted)" }}>{label}</p>
      <h2 style={{ marginBottom: 0 }}>{value}</h2>
    </div>
  );
}
