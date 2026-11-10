import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Trash2 } from "lucide-react";
import { listInterviewPreps, deleteInterviewPrep } from "../services/interviewService";
import { EmptyState } from "../components/EmptyState";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { ErrorState } from "../components/ErrorState";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { useToast } from "../context/ToastContext";
import { getApiErrorMessage } from "../services/apiClient";

export function InterviewPrepListPage() {
  const [preps, setPreps] = useState(null);
  const [error, setError] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const { showToast } = useToast();

  const load = async () => {
    setError("");
    try {
      const { preparations } = await listInterviewPreps();
      setPreps(preparations);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async () => {
    try {
      await deleteInterviewPrep(pendingDeleteId);
      setPreps((prev) => prev.filter((p) => p._id !== pendingDeleteId));
      showToast("Preparation set deleted.", "success");
    } catch (err) {
      showToast(getApiErrorMessage(err), "error");
    } finally {
      setPendingDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Interview Preparation</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Generate question sets from the analysis results page, then track your progress here.
        </p>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}
      {!error && preps === null && <LoadingSkeleton rows={3} />}
      {!error && preps && preps.length === 0 && (
        <EmptyState
          icon={GraduationCap}
          title="No preparation sets yet"
          description="Run a job analysis first, then click 'Generate interview prep' on the results page."
          action={
            <Link to="/analyze" className="btn-primary">
              Run a job analysis
            </Link>
          }
        />
      )}

      {!error && preps && preps.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {preps.map((prep) => {
            const completed = prep.questions.filter((q) => q.completed).length;
            return (
              <div key={prep._id} className="card">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{prep.jobTitle}</h3>
                  <button
                    onClick={() => setPendingDeleteId(prep._id)}
                    className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    aria-label="Delete preparation set"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {completed}/{prep.questions.length} questions completed
                </p>
                <Link to={`/interview-prep/${prep._id}`} className="btn-secondary mt-4 w-full text-xs">
                  Open
                </Link>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDeleteId}
        title="Delete this preparation set?"
        description="This removes the question set and study plan permanently."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
