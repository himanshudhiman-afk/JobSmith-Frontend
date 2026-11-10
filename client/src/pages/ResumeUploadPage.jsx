import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { UploadDropzone } from "../components/UploadDropzone";
import { uploadResume } from "../services/resumeService";
import { useToast } from "../context/ToastContext";
import { getApiErrorMessage } from "../services/apiClient";

export function ResumeUploadPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [resume, setResume] = useState(null);
  const [error, setError] = useState("");
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const uploaded = await uploadResume(file);
      setResume(uploaded);
      showToast("Resume uploaded and parsed successfully.", "success");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Upload your resume</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          We&apos;ll extract the text so you can review it before running any analysis.
        </p>
      </div>

      <div className="card space-y-4">
        <UploadDropzone onFileSelected={setFile} disabled={uploading} />
        {file && (
          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800">
            <span className="truncate text-slate-700 dark:text-slate-200">{file.name}</span>
            <span className="text-slate-400">{(file.size / 1024).toFixed(0)} KB</span>
          </div>
        )}
        {error && <p className="field-error">{error}</p>}
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="btn-primary w-full"
        >
          {uploading && <Loader2 size={16} className="animate-spin" />}
          Upload and extract text
        </button>
      </div>

      {resume && (
        <div className="card space-y-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Extracted text preview</h2>
          <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {resume.extractedText}
          </pre>
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={() => navigate(`/resumes/${resume._id}`)}>
              Review and edit details
            </button>
            <button className="btn-primary" onClick={() => navigate("/analyze", { state: { resumeId: resume._id } })}>
              Analyze against a job
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
