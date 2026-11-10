import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { History, Trash2 } from "lucide-react";
import { listAnalyses, deleteAnalysis } from "../services/analysisService";
import { listMockInterviews, deleteMockInterview } from "../services/mockInterviewService";
import { EmptyState } from "../components/EmptyState";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { ErrorState } from "../components/ErrorState";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Tabs } from "../components/Tabs";
import { useToast } from "../context/ToastContext";
import { getApiErrorMessage } from "../services/apiClient";

export function HistoryPage() {
  const { showToast } = useToast();
  const [analyses, setAnalyses] = useState(null);
  const [mockInterviews, setMockInterviews] = useState(null);
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = async () => {
    setError("");
    try {
      const [a, m] = await Promise.all([listAnalyses({ limit: 50 }), listMockInterviews({ limit: 50 })]);
      setAnalyses(a.analyses);
      setMockInterviews(m.mockInterviews);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async () => {
    try {
      if (pendingDelete.type === "analysis") {
        await deleteAnalysis(pendingDelete.id);
        setAnalyses((prev) => prev.filter((a) => a._id !== pendingDelete.id));
      } else {
        await deleteMockInterview(pendingDelete.id);
        setMockInterviews((prev) => prev.filter((m) => m._id !== pendingDelete.id));
      }
      showToast("Deleted.", "success");
    } catch (err) {
      showToast(getApiErrorMessage(err), "error");
    } finally {
      setPendingDelete(null);
    }
  };

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (analyses === null || mockInterviews === null) return <LoadingSkeleton rows={4} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">History</h1>

      <Tabs
        tabs={[
          {
            id: "analyses",
            label: `Job Analyses (${analyses.length})`,
            content:
              analyses.length === 0 ? (
                <EmptyState icon={History} title="No analyses yet" description="Run a job analysis to see it here." />
              ) : (
                <div className="space-y-2">
                  {analyses.map((a) => (
                    <div key={a._id} className="card flex items-center justify-between">
                      <div>
                        <Link to={`/analyses/${a._id}`} className="text-sm font-semibold text-accent-600 hover:underline">
                          {a.jobTitle}
                          {a.companyName ? ` at ${a.companyName}` : ""}
                        </Link>
                        <p className="text-xs text-slate-400">{new Date(a.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="badge bg-accent-50 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300">
                          {a.result?.overallMatchScore}/100
                        </span>
                        <button
                          onClick={() => setPendingDelete({ type: "analysis", id: a._id })}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          aria-label="Delete analysis"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
          },
          {
            id: "mock",
            label: `Mock Interviews (${mockInterviews.length})`,
            content:
              mockInterviews.length === 0 ? (
                <EmptyState
                  icon={History}
                  title="No saved mock interviews"
                  description="Mock interviews only appear here if you opted to save them."
                />
              ) : (
                <div className="space-y-2">
                  {mockInterviews.map((m) => (
                    <div key={m._id} className="card flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {m.jobTitle} ({m.category})
                        </p>
                        <p className="text-xs text-slate-400">{new Date(m.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {m.finalReport?.overallScore !== undefined && (
                          <span className="badge bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                            {m.finalReport.overallScore}/100
                          </span>
                        )}
                        <button
                          onClick={() => setPendingDelete({ type: "mock", id: m._id })}
                          className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          aria-label="Delete mock interview"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
          }
        ]}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this record?"
        description="This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
