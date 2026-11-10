import { useCallback, useRef, useState } from "react";
import { UploadCloud, FileText } from "lucide-react";

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];
const MAX_SIZE_MB = 5;

export function UploadDropzone({ onFileSelected, disabled }) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const validateAndEmit = useCallback(
    (file) => {
      if (!file) return;
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Only PDF and DOCX files are supported.");
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`File is too large. Maximum size is ${MAX_SIZE_MB}MB.`);
        return;
      }
      setError("");
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    validateAndEmit(e.dataTransfer.files?.[0]);
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled) inputRef.current?.click();
        }}
        aria-disabled={disabled}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 ${
          isDragging
            ? "border-accent-500 bg-accent-50 dark:bg-accent-900/20"
            : "border-slate-300 bg-slate-50 hover:border-accent-400 dark:border-slate-700 dark:bg-slate-900"
        } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
      >
        <UploadCloud className="mb-3 h-10 w-10 text-accent-600" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Drag and drop your resume, or click to browse
        </p>
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
          <FileText size={13} /> PDF or DOCX, up to {MAX_SIZE_MB}MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          disabled={disabled}
          onChange={(e) => validateAndEmit(e.target.files?.[0])}
        />
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
