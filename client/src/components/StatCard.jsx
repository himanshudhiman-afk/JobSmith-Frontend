export function StatCard({ icon: Icon, label, value, hint, accent = "accent" }) {
  const colorMap = {
    accent: "bg-accent-50 text-accent-600 dark:bg-accent-900/40",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/40",
    violet: "bg-violet-50 text-violet-600 dark:bg-violet-900/40"
  };

  return (
    <div className="card flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-1.5 text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
        {hint && <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
      </div>
      {Icon && (
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${colorMap[accent]}`}>
          <Icon size={18} />
        </div>
      )}
    </div>
  );
}
