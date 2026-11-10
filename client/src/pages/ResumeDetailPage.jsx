import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Download, Save, Loader2, Sparkles } from "lucide-react";
import { getResume, updateStructuredContent, exportResumePdf } from "../services/resumeService";
import { parseResumeWithAI } from "../services/ai/resumeParsing";
import { ResumeStructuredForm } from "../components/ResumeStructuredForm";
import { ResumePrintPreview } from "../components/ResumePrintPreview";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { ErrorState } from "../components/ErrorState";
import { Tabs } from "../components/Tabs";
import { useToast } from "../context/ToastContext";
import { getApiErrorMessage } from "../services/apiClient";

const DEFAULT_CONTENT = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  links: [],
  summary: "",
  skills: [],
  experience: [],
  education: [],
  projects: [],
  certifications: []
};

export function ResumeDetailPage() {
  const { id } = useParams();
  const { showToast } = useToast();
  const [resume, setResume] = useState(null);
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [exporting, setExporting] = useState(false);

  const load = async () => {
    setError("");
    try {
      const data = await getResume(id);
      setResume(data);
      setContent({ ...DEFAULT_CONTENT, ...data.structuredContent });
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleParseWithAI = async () => {
    if (!resume?.extractedText) return;
    setParsing(true);
    try {
      const parsed = await parseResumeWithAI(resume.extractedText);
      setContent((prev) => ({ ...prev, ...parsed }));
      showToast("AI filled in the fields below from your resume text. Review before saving.", "success");
    } catch (err) {
      showToast(getApiErrorMessage(err), "error");
    } finally {
      setParsing(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateStructuredContent(id, content);
      setResume(updated);
      showToast("Resume details saved.", "success");
    } catch (err) {
      showToast(getApiErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await exportResumePdf(id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${resume?.title || "resume"}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      showToast(getApiErrorMessage(err), "error");
    } finally {
      setExporting(false);
    }
  };

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!resume) return <LoadingSkeleton rows={4} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{resume.title}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Edit the extracted details, then export an ATS-friendly PDF.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleParseWithAI} disabled={parsing} className="btn-secondary">
            {parsing ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
            Parse with AI
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-secondary">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Save
          </button>
          <button onClick={handleExport} disabled={exporting} className="btn-primary">
            {exporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            Export PDF
          </button>
        </div>
      </div>

      <Tabs
        tabs={[
          {
            id: "editor",
            label: "Editor",
            content: (
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="card">
                  <ResumeStructuredForm value={content} onChange={setContent} />
                </div>
                <div className="hidden lg:block">
                  <div className="sticky top-20 rounded-xl bg-slate-100 p-4 dark:bg-slate-800/50">
                    <ResumePrintPreview content={content} />
                  </div>
                </div>
              </div>
            )
          },
          {
            id: "extracted",
            label: "Original extracted text",
            content: (
              <pre className="max-h-[70vh] overflow-y-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {resume.extractedText}
              </pre>
            )
          }
        ]}
      />

      <p className="text-xs text-slate-400">
        Need the AI to suggest improved wording?{" "}
        <Link to="/analyze" state={{ resumeId: id }} className="font-medium text-accent-600 hover:underline">
          Run a job analysis
        </Link>{" "}
        first, then use the optimization tab there.
      </p>
    </div>
  );
}
