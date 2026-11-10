const METRICS = [
  ["technicalCorrectness", "Technical correctness"],
  ["completeness", "Completeness"],
  ["clarity", "Clarity"],
  ["relevance", "Relevance"],
  ["communicationQuality", "Communication"]
];

export function AnswerFeedbackPanel({ feedback }) {
  if (!feedback) return null;

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">AI practice feedback</h3>
        {feedback.score !== undefined && (
          <span className="badge bg-accent-50 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300">
            {feedback.score}/100
          </span>
        )}
      </div>
      <p className="text-xs italic text-slate-400">
        AI-generated practice feedback, not an objective hiring assessment.
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {METRICS.map(([key, label]) =>
          feedback[key] !== undefined ? (
            <div key={key} className="text-center">
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{feedback[key]}</p>
              <p className="text-[11px] text-slate-400">{label}</p>
            </div>
          ) : null
        )}
      </div>

      {feedback.suggestedImprovements?.length > 0 && (
        <div>
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Suggested improvements
          </h4>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
            {feedback.suggestedImprovements.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
