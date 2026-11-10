export function MatchScoreGauge({ score, size = 128 }) {
  const clamped = typeof score === "number" && Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : null;
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - (clamped ?? 0) / 100);
  const color = clamped === null ? "#cbd5e1" : clamped >= 75 ? "#96D1F9" : "#FFA116";
  const scoreLabel = clamped === null ? "No score" : clamped >= 75 ? "Strong match" : clamped >= 50 ? "Partial match" : "Early match";

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Resume match score: ${clamped === null ? "not available" : `${clamped} out of 100, ${scoreLabel}`}`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={10} className="text-slate-100 dark:text-slate-800" />
        {clamped !== null && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
          {clamped ?? "—"}
        </span>
        <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
          {clamped === null ? "match" : "/ 100"}
        </span>
      </div>
    </div>
  );
}
