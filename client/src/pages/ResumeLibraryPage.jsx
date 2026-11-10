import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Trash2, Plus, ClipboardList } from "lucide-react";
import { listResumes, deleteResume } from "../services/resumeService";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { useToast } from "../context/ToastContext";
import { getApiErrorMessage } from "../services/apiClient";

export function ResumeLibraryPage() {
  const [resumes, setResumes] = useState(null);
  const [error, setError] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const { showToast } = useToast();

  const load = async () => {
    setError("");
    try {
      const { resumes: list } = await listResumes();
      setResumes(list);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async () => {
    try {
      await deleteResume(pendingDeleteId);
      setResumes((prev) => prev.filter((r) => r._id !== pendingDeleteId));
      showToast("Resume deleted.", "success");
    } catch (err) {
      showToast(getApiErrorMessage(err), "error");
    } finally {
      setPendingDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Resume Library</h1>
        <Link to="/resumes/upload" className="btn-primary">
          <Plus size={16} /> Upload resume
        </Link>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}
      {!error && resumes === null && <LoadingSkeleton rows={3} />}
      {!error && resumes && resumes.length === 0 && (
        <EmptyState
          icon={FileText}
          title="No resumes yet"
          description="Upload your first resume to start analyzing it against job descriptions."
          action={
            <Link to="/resumes/upload" className="btn-primary">
              Upload resume
            </Link>
          }
        />
      )}

      {!error && resumes && resumes.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <div key={resume._id} className="card flex flex-col">
              <div className="flex items-start justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-900/40">
                  <FileText size={16} />
                </div>
                <button
                  onClick={() => setPendingDeleteId(resume._id)}
                  className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="Delete resume"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              <h3 className="mt-3 truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                {resume.title}
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Uploaded {new Date(resume.createdAt).toLocaleDateString()}
              </p>
              <div className="mt-4 flex gap-2">
                <Link to={`/resumes/${resume._id}`} className="btn-secondary flex-1 text-xs">
                  Edit
                </Link>
                <Link
                  to="/analyze"
                  state={{ resumeId: resume._id }}
                  className="btn-primary flex-1 text-xs"
                >
                  <ClipboardList size={13} /> Analyze
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDeleteId}
        title="Delete this resume?"
        description="This permanently removes the resume and its extracted content. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
