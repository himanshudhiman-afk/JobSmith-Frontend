export function LoadingSkeleton({ rows = 3, className = "" }) {
  return (
    <div className={`space-y-3 ${className}`} aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card animate-pulse">
      <div className="mb-3 h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-8 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}
