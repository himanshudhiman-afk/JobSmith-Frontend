import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Loader2, Sparkles, ClipboardList } from "lucide-react";
import { listResumes, getResume } from "../services/resumeService";
import { createAnalysis } from "../services/analysisService";
import { analyzeResumeAgainstJob } from "../services/ai/resumeAnalysis";
import { useToast } from "../context/ToastContext";
import { getApiErrorMessage } from "../services/apiClient";
import {
  PuterNotAvailableError,
  PuterSignInCancelledError,
  PuterAIError
} from "../services/puterClient";
import { EmptyState } from "../components/EmptyState";

export function AnalyzePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [resumes, setResumes] = useState(null);
  const [resumeId, setResumeId] = useState(location.state?.resumeId || "");
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    listResumes({ limit: 50 })
      .then(({ resumes: list }) => setResumes(list))
      .catch((err) => setError(getApiErrorMessage(err)));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!resumeId) {
      setError("Select a resume first.");
      return;
    }
    if (jobDescription.trim().length < 20) {
      setError("Paste a more complete job description (at least 20 characters).");
      return;
    }

    setRunning(true);
    try {
      setStage("Fetching resume text...");
      const resume = await getResume(resumeId);

      setStage("Asking the AI to analyze compatibility...");
      const result = await analyzeResumeAgainstJob({
        resumeText: resume.extractedText,
        jobTitle,
        companyName,
        jobDescription
      });

      setStage("Saving your analysis...");
      const analysis = await createAnalysis({
        resumeId,
        jobTitle,
        companyName,
        jobDescription,
        result
      });

      showToast("Analysis complete.", "success");
      navigate(`/analyses/${analysis._id}`);
    } catch (err) {
      if (err instanceof PuterNotAvailableError || err instanceof PuterSignInCancelledError || err instanceof PuterAIError) {
        setError(err.message);
      } else {
        setError(getApiErrorMessage(err));
      }
    } finally {
      setRunning(false);
      setStage("");
    }
  };

  if (resumes && resumes.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Upload a resume first"
        description="You need at least one uploaded resume before running a job analysis."
        action={
          <Link to="/resumes/upload" className="btn-primary">
            Upload resume
          </Link>
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Analyze a job description</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Pick a resume and paste the job posting to get an AI-generated compatibility estimate.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="label">Resume</label>
          <select className="input" value={resumeId} onChange={(e) => setResumeId(e.target.value)}>
            <option value="">Select a resume…</option>
            {resumes?.map((r) => (
              <option key={r._id} value={r._id}>
                {r.title}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Job title</label>
            <input className="input" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} required />
          </div>
          <div>
            <label className="label">Company (optional)</label>
            <input className="input" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Job description</label>
          <textarea
            className="input min-h-[220px]"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here…"
            required
          />
        </div>

        {error && <p className="field-error">{error}</p>}

        <button type="submit" disabled={running} className="btn-primary w-full">
          {running ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {running ? stage || "Analyzing…" : "Run analysis"}
        </button>
      </form>
    </div>
  );
}
