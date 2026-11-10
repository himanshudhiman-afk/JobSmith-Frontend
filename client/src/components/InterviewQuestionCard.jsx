import { useState } from "react";
import { ChevronDown, CheckCircle2, Circle } from "lucide-react";

const CATEGORY_COLORS = {
  technical: "bg-accent-50 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300",
  programming: "bg-violet-50 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  project: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  "system-design": "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  behavioral: "bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  hr: "bg-rose-50 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
};

export function InterviewQuestionCard({ question, onToggleCompleted }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card">
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggleCompleted(!question.completed)}
          aria-label={question.completed ? "Mark as not completed" : "Mark as completed"}
          className="mt-0.5 shrink-0 text-accent-600"
        >
          {question.completed ? <CheckCircle2 size={20} /> : <Circle size={20} className="text-slate-300" />}
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`badge ${CATEGORY_COLORS[question.category] || "bg-slate-100 text-slate-700"}`}>
              {question.category}
            </span>
            <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {question.difficulty}
            </span>
          </div>
          <p
            className={`mt-2 text-sm font-medium ${
              question.completed ? "text-slate-400 line-through" : "text-slate-900 dark:text-slate-100"
            }`}
          >
            {question.questionText}
          </p>

          <button
            onClick={() => setOpen((o) => !o)}
            className="mt-2 flex items-center gap-1 text-xs font-medium text-accent-600 hover:underline"
          >
            {open ? "Hide" : "Show"} prep notes
            <ChevronDown size={13} className={`transition-transform ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 text-sm dark:border-slate-800">
              {question.whyRelevant && (
                <p>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Why relevant: </span>
                  <span className="text-slate-600 dark:text-slate-300">{question.whyRelevant}</span>
                </p>
              )}
              {question.conceptsToRevise?.length > 0 && (
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Concepts to revise:</span>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {question.conceptsToRevise.map((c) => (
                      <span key={c} className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {question.answerGuidance && (
                <p>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Answer guidance: </span>
                  <span className="text-slate-600 dark:text-slate-300">{question.answerGuidance}</span>
                </p>
              )}
              {question.followUps?.length > 0 && (
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Possible follow-ups:</span>
                  <ul className="mt-1 list-disc pl-5 text-slate-600 dark:text-slate-300">
                    {question.followUps.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
