import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileSignature, FileText } from "lucide-react";
import { listResumes } from "../services/resumeService";
import { EmptyState } from "../components/EmptyState";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { ErrorState } from "../components/ErrorState";
import { getApiErrorMessage } from "../services/apiClient";

export function AtsResumeBuilderPage() {
  const [resumes, setResumes] = useState(null);
  const [error, setError] = useState("");

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">ATS Resume Builder</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Choose a resume to edit in the single-column ATS-friendly template and export a PDF.
        </p>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}
      {!error && resumes === null && <LoadingSkeleton rows={3} />}
      {!error && resumes && resumes.length === 0 && (
        <EmptyState
          icon={FileSignature}
          title="Upload a resume to get started"
          description="The builder works from a resume you've already uploaded and parsed."
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
            <Link
              key={resume._id}
              to={`/resumes/${resume._id}`}
              className="card flex items-center gap-3 transition-shadow hover:shadow-lg"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-900/40">
                <FileText size={16} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{resume.title}</p>
                <p className="text-xs text-slate-400">Open in builder →</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-400">
        No resume template can guarantee acceptance by every ATS — the single-column layout avoids tables,
        columns, and graphics that commonly cause parsing issues.
      </p>
    </div>
  );
}
