import { Loader2 } from "lucide-react";

export function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-4" role="status" aria-label="Loading JobSmith">
        <img src="/jobsmith-logo.svg" alt="JobSmith" className="h-11 w-auto" />
        <Loader2 className="h-7 w-7 animate-spin text-accent-600" aria-hidden="true" />
      </div>
    </div>
  );
}
