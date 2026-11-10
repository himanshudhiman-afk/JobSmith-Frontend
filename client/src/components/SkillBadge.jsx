import { CheckCircle2, HelpCircle } from "lucide-react";

export function SkillBadge({ label, matched = true }) {
  return (
    <span
      className={`badge gap-1 ring-1 ring-inset ${
        matched
          ? "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:ring-sky-800"
          : "bg-orange-50 text-orange-800 ring-orange-200 dark:bg-orange-950/50 dark:text-orange-200 dark:ring-orange-900"
      }`}
    >
      {matched ? <CheckCircle2 size={12} /> : <HelpCircle size={12} />}
      {label}
    </span>
  );
}
