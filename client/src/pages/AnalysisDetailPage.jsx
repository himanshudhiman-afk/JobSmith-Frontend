import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Loader2, Sparkles, GraduationCap, CheckCircle2, CircleHelp } from "lucide-react";
import { getAnalysis, addOptimization } from "../services/analysisService";
import { getResume } from "../services/resumeService";
import { generateInterviewQuestions } from "../services/ai/interviewPreparation";
import { createInterviewPrep } from "../services/interviewService";
import { optimizeResume } from "../services/ai/resumeOptimization";
import { MatchScoreGauge } from "../components/MatchScoreGauge";
import { SkillBadge } from "../components/SkillBadge";
import { Tabs } from "../components/Tabs";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { ErrorState } from "../components/ErrorState";
import { useToast } from "../context/ToastContext";
import { getApiErrorMessage } from "../services/apiClient";

function OptimizationPanel({ analysis }) {
  const { showToast } = useToast();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(analysis.optimizations?.[analysis.optimizations.length - 1] || null);
  const [error, setError] = useState("");

  const handleRun = async () => {
    setRunning(true);
    setError("");
    try {
      const resume = await getResume(analysis.resume._id || analysis.resume);
      const optimization = await optimizeResume({
        resumeText: resume.extractedText,
        jobTitle: analysis.jobTitle,
        jobDescription: analysis.jobDescription,
        analysisSummary: analysis.result.summary
      });
      const saved = await addOptimization(analysis._id, {
        ...optimization,
        improvedBullets: optimization.improvedBullets.map((b) => ({ ...b, accepted: false }))
      });
      setResult(saved.optimizations[saved.optimizations.length - 1]);
      showToast("Optimization suggestions generated. Review before using them.", "success");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-4">
      <button onClick={handleRun} disabled={running} className="btn-primary">
        {running ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
        {result ? "Regenerate suggestions" : "Generate optimization suggestions"}
      </button>
      {error && <p className="field-error">{error}</p>}

      {result && (
        <div className="space-y-4">
          <div className="card">
            <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">Improved summary</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">{result.improvedSummary}</p>
          </div>

          {result.improvedBullets?.length > 0 && (
            <div className="card space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Bullet point suggestions</h3>
              {result.improvedBullets.map((b, i) => (
                <div key={i} className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800">
                  <p className="text-slate-400 line-through">{b.original}</p>
                  <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{b.improved}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{b.explanation}</p>
                  <p className="mt-2 text-xs italic text-slate-400">
                    Review and edit before copying into your resume — nothing is applied automatically.
                  </p>
                </div>
              ))}
            </div>
          )}

          {result.suggestedKeywords?.length > 0 && (
            <div className="card">
              <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">Supported keywords</h3>
              <div className="flex flex-wrap gap-2">
                {result.suggestedKeywords.map((k) => (
                  <SkillBadge key={k} label={k} matched />
                ))}
              </div>
            </div>
          )}

          {result.missingInfoRequests?.length > 0 && (
            <div className="card">
              <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                Information you should supply
              </h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
                {result.missingInfoRequests.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AnalysisDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");
  const [generatingPrep, setGeneratingPrep] = useState(false);

  const load = async () => {
    setError("");
    try {
      const data = await getAnalysis(id);
      setAnalysis(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleGeneratePrep = async () => {
    setGeneratingPrep(true);
    try {
      const resume = await getResume(analysis.resume._id || analysis.resume);
      const questions = await generateInterviewQuestions({
        jobTitle: analysis.jobTitle,
        resumeText: resume.extractedText,
        missingOrUnclearSkills: analysis.result.missingOrUnclearSkills,
        questionCount: 8,
        difficulty: "medium"
      });
      const prep = await createInterviewPrep({
        jobAnalysisId: analysis._id,
        jobTitle: analysis.jobTitle,
        questions
      });
      showToast("Interview questions generated.", "success");
      navigate(`/interview-prep/${prep._id}`);
    } catch (err) {
      showToast(getApiErrorMessage(err), "error");
    } finally {
      setGeneratingPrep(false);
    }
  };

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!analysis) return <LoadingSkeleton rows={4} />;

  const { result } = analysis;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {analysis.jobTitle}
            {analysis.companyName && (
              <span className="font-normal text-slate-400"> at {analysis.companyName}</span>
            )}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Analyzed on {new Date(analysis.createdAt).toLocaleDateString()}
          </p>
        </div>
        <button onClick={handleGeneratePrep} disabled={generatingPrep} className="btn-primary">
          {generatingPrep ? <Loader2 size={15} className="animate-spin" /> : <GraduationCap size={15} />}
          Generate interview prep
        </button>
      </div>

      <div className="card flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <MatchScoreGauge score={result.overallMatchScore} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
            AI-generated estimate — not a real ATS score or hiring prediction
          </p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{result.summary}</p>
        </div>
      </div>

      <Tabs
        tabs={[
          {
            id: "skills",
            label: "Skill Gap",
            content: (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-xl border border-brand-blue/60 bg-sky-50/60 p-4 dark:border-sky-900 dark:bg-sky-950/30">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-sky-700 shadow-sm dark:bg-slate-900 dark:text-sky-300">
                      <CheckCircle2 size={19} />
                    </span>
                    <div>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{result.matchedSkills.length}</p>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Skills with resume evidence</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-accent-200 bg-orange-50/60 p-4 dark:border-accent-900 dark:bg-orange-950/20">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-accent-700 shadow-sm dark:bg-slate-900 dark:text-accent-300">
                      <CircleHelp size={19} />
                    </span>
                    <div>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {result.missingOrUnclearSkills.length}
                      </p>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Skills not demonstrated</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="card">
                    <div className="mb-4 flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Evidence found</h3>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Matched in your resume</p>
                      </div>
                      <span className="badge shrink-0 bg-sky-50 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                        {result.matchedSkills.length}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.matchedSkills.length === 0 && (
                        <p className="text-sm text-slate-400">No matching skills found yet.</p>
                      )}
                      {result.matchedSkills.map((s) => (
                        <SkillBadge key={s} label={s} matched />
                      ))}
                    </div>
                  </div>
                  <div className="card">
                    <div className="mb-4 flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Potential gaps</h3>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Not clearly demonstrated in your resume
                        </p>
                      </div>
                      <span className="badge shrink-0 bg-accent-50 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300">
                        {result.missingOrUnclearSkills.length}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.missingOrUnclearSkills.length === 0 && (
                        <p className="text-sm text-slate-400">No potential gaps found.</p>
                      )}
                      {result.missingOrUnclearSkills.map((s) => (
                        <SkillBadge key={s} label={s} matched={false} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          },
          {
            id: "evidence",
            label: "Evidence",
            content: (
              <div className="card space-y-3">
                {result.evidence.length === 0 && <p className="text-sm text-slate-400">No evidence recorded.</p>}
                {result.evidence.map((e, i) => (
                  <div key={i} className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800">
                    <p className="font-medium text-slate-900 dark:text-slate-100">{e.skillOrClaim}</p>
                    <p className="mt-1 text-slate-500 dark:text-slate-400">&quot;{e.resumeExcerpt}&quot;</p>
                  </div>
                ))}
              </div>
            )
          },
          {
            id: "alignment",
            label: "Experience & Education",
            content: (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="card">
                  <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Experience alignment
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{result.experienceAlignment}</p>
                </div>
                <div className="card">
                  <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Education alignment
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{result.educationAlignment}</p>
                </div>
              </div>
            )
          },
          {
            id: "recommendations",
            label: "Recommendations",
            content: (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="card">
                  <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">Strengths</h3>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
                    {result.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div className="card">
                  <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Improvement areas
                  </h3>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
                    {result.improvementAreas.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div className="card sm:col-span-2">
                  <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Prioritized recommendations
                  </h3>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
                    {result.recommendations.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          },
          {
            id: "optimize",
            label: "Optimize Resume",
            content: <OptimizationPanel analysis={analysis} />
          }
        ]}
      />

      <p className="text-xs text-slate-400">
        <Link to="/resumes" className="font-medium text-accent-600 hover:underline">
          Apply these changes in the resume builder
        </Link>{" "}
        once you&apos;ve reviewed them.
      </p>
    </div>
  );
}
