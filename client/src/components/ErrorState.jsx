import { AlertTriangle, RotateCw } from "lucide-react";

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center dark:border-red-900/50 dark:bg-red-950/30">
      <AlertTriangle className="mb-3 h-8 w-8 text-red-500" />
      <p className="max-w-sm text-sm font-medium text-red-700 dark:text-red-300">
        {message || "Something went wrong while loading this data."}
      </p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary mt-4">
          <RotateCw size={15} /> Try again
        </button>
      )}
    </div>
  );
}
