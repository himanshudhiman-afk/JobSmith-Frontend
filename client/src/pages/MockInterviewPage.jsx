import { useEffect, useState } from "react";
import { Loader2, Send, ArrowRight, Flag } from "lucide-react";
import { listResumes, getResume } from "../services/resumeService";
import {
  createMockInterview,
  submitAnswer,
  nextQuestion,
  finishMockInterview
} from "../services/mockInterviewService";
import {
  generateFirstQuestion,
  evaluateAnswer,
  generateNextQuestion,
  generateFinalReport
} from "../services/ai/mockInterview";
import { AnswerFeedbackPanel } from "../components/AnswerFeedbackPanel";
import { useToast } from "../context/ToastContext";
import { getApiErrorMessage } from "../services/apiClient";

const SCORE_DIMENSIONS = [
  ["technicalCorrectness", "Technical correctness"],
  ["completeness", "Completeness"],
  ["clarity", "Clarity"],
  ["relevance", "Relevance"],
  ["communicationQuality", "Communication"]
];

function InterviewScoreRing({ score }) {
  const circumference = 2 * Math.PI * 54;
  const safeScore = typeof score === "number" && Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : null;
  const offset = circumference * (1 - (safeScore ?? 0) / 100);

  return (
    <div
      className="relative h-36 w-36 shrink-0"
      role="img"
      aria-label={`Overall interview score: ${safeScore === null ? "not available" : `${safeScore} out of 100`}`}
    >
      <svg viewBox="0 0 128 128" className="-rotate-90">
        <circle cx="64" cy="64" r="54" fill="none" stroke="currentColor" strokeWidth="9" className="text-slate-100 dark:text-slate-800" />
        {safeScore !== null && (
          <circle
            cx="64"
            cy="64"
            r="54"
            fill="none"
            stroke="#FFA116"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={circumference}
            className="score-ring-progress"
            style={{ "--score-circumference": circumference, "--score-offset": offset }}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold tracking-tight text-brand-charcoal dark:text-white">
          {safeScore ?? "—"}
        </span>
        <span className="text-xs font-medium text-slate-400">out of 100</span>
      </div>
    </div>
  );
}

const CATEGORIES = [
  ["mixed", "Mixed"],
  ["technical", "Technical"],
  ["programming", "Programming"],
  ["project", "Project"],
  ["system-design", "System Design"],
  ["behavioral", "Behavioral"],
  ["hr", "HR"]
];

export function MockInterviewPage() {
  const { showToast } = useToast();
  const [resumes, setResumes] = useState(null);
  const [resumeId, setResumeId] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [category, setCategory] = useState("mixed");
  const [maxQuestions, setMaxQuestions] = useState(5);
  const [consentToStore, setConsentToStore] = useState(true);

  const [session, setSession] = useState(null);
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState("");
  const [finalReport, setFinalReport] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    listResumes({ limit: 50 }).then(({ resumes: list }) => setResumes(list)).catch(() => setResumes([]));
  }, []);

  const currentTurn = session?.turns?.[session.turns.length - 1];
  const answered = !!currentTurn?.userAnswer;
  const interviewTurns = session?.turns?.filter((turn) => turn.feedback) || [];
  const dimensionAverages = SCORE_DIMENSIONS.map(([key, label]) => {
    const values = interviewTurns.map((turn) => turn.feedback?.[key]).filter(Number.isFinite);
    return values.length
      ? { label, score: Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) }
      : null;
  }).filter(Boolean);

  const handleStart = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      setStage("Reading resume...");
      const resume = resumeId ? await getResume(resumeId) : { extractedText: "" };

      setStage("Generating the first question...");
      const firstQuestion = await generateFirstQuestion({ jobTitle, category, resumeText: resume.extractedText });

      setStage("Starting session...");
      const mockInterview = await createMockInterview({
        jobTitle,
        category,
        maxQuestions: Number(maxQuestions),
        firstQuestion,
        consentToStore
      });
      setSession(mockInterview);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusy(false);
      setStage("");
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;
    setBusy(true);
    setError("");
    try {
      setStage("Evaluating your answer...");
      const feedback = await evaluateAnswer({
        jobTitle,
        questionText: currentTurn.questionText,
        answer,
        category: currentTurn.category
      });

      const updated = await submitAnswer(session._id, { answer, feedback });
      setSession(updated);
      setAnswer("");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusy(false);
      setStage("");
    }
  };

  const handleNext = async () => {
    setBusy(true);
    setError("");
    try {
      setStage("Preparing next question...");
      const question = await generateNextQuestion({
        jobTitle,
        category: currentTurn.category,
        previousQuestion: currentTurn.questionText,
        previousAnswer: currentTurn.userAnswer,
        followUpQuestion: currentTurn.feedback?.followUpQuestion
      });
      const updated = await nextQuestion(session._id, question);
      setSession(updated);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusy(false);
      setStage("");
    }
  };

  const handleFinish = async () => {
    setBusy(true);
    setError("");
    try {
      setStage("Preparing your final report...");
      const report = await generateFinalReport({ jobTitle, turns: session.turns });
      const { mockInterview } = await finishMockInterview(session._id, report);
      setFinalReport(mockInterview.finalReport);
      showToast("Mock interview complete.", "success");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusy(false);
      setStage("");
    }
  };

  if (finalReport) {
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <div>
          <span className="badge bg-accent-50 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300">
            INTERVIEW COMPLETE
          </span>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">Your interview results</h1>
          <p className="mt-1 text-xs italic text-slate-400">
            AI-generated practice feedback, not an objective hiring assessment.
          </p>
        </div>

        <div className="card overflow-hidden !p-0">
          <div className="flex flex-col items-center gap-6 bg-gradient-to-br from-orange-50/70 via-white to-sky-50/60 p-6 sm:flex-row sm:p-8 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
            <InterviewScoreRing score={finalReport.overallScore} />
            <div className="text-center sm:text-left">
              <p className="text-sm font-semibold uppercase tracking-wide text-accent-700 dark:text-accent-300">
                Overall practice score
              </p>
              <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">{finalReport.summary}</p>
              <p className="mt-3 text-xs text-slate-400">
                Based on {interviewTurns.length} evaluated {interviewTurns.length === 1 ? "answer" : "answers"}
              </p>
            </div>
          </div>

          {interviewTurns.length > 0 && (
            <div className="border-t border-slate-100 p-5 sm:p-6 dark:border-slate-800">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Answer-by-answer scores</h2>
              <div className="mt-4 flex h-32 items-end gap-3" role="list" aria-label="Scores by interview question">
                {interviewTurns.map((turn, index) => {
                  const score =
                    typeof turn.feedback.score === "number" && Number.isFinite(turn.feedback.score)
                      ? Math.max(0, Math.min(100, turn.feedback.score))
                      : null;
                  return (
                    <div
                      key={turn._id || index}
                      className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                      role="listitem"
                      aria-label={`Question ${index + 1}: ${score === null ? "score unavailable" : `${score} out of 100`}`}
                    >
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {score ?? "—"}
                      </span>
                      <div className="flex h-20 w-full items-end rounded-t-md bg-slate-50 dark:bg-slate-800/70">
                        {score !== null && (
                          <div
                            className="w-full rounded-t-md bg-gradient-to-t from-accent-500 to-amber-300 transition-[height] duration-700"
                            style={{ height: `${score}%` }}
                          />
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">Q{index + 1}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {dimensionAverages.length > 0 && (
          <div className="card">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Skill breakdown</h2>
              <p className="mt-1 text-xs text-slate-400">Average across your evaluated answers</p>
            </div>
            <div className="space-y-4">
              {dimensionAverages.map(({ label, score }) => (
                <div key={label}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600 dark:text-slate-300">{label}</span>
                    <span className="font-semibold text-brand-charcoal dark:text-slate-100">{score}</span>
                  </div>
                  <div
                    className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
                    role="progressbar"
                    aria-label={label}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={score}
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent-500 to-amber-300 transition-[width] duration-700"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="card">
            <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">Strengths</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
              {finalReport.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
          <div className="card">
            <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">Areas to improve</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
              {finalReport.weaknesses.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
          <div className="card sm:col-span-2">
            <h3 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">Recommendations</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
              {finalReport.recommendations.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
        <button
          className="btn-secondary"
          onClick={() => {
            setSession(null);
            setFinalReport(null);
          }}
        >
          Start another mock interview
        </button>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Mock Interview Simulator</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Practice with AI-generated questions and get structured feedback after each answer.
          </p>
        </div>
        <form onSubmit={handleStart} className="card space-y-4">
          <div>
            <label className="label">Resume (optional, improves question relevance)</label>
            <select className="input" value={resumeId} onChange={(e) => setResumeId(e.target.value)}>
              <option value="">None</option>
              {resumes?.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Target job title</label>
            <input className="input" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Category</label>
              <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Number of questions</label>
              <input
                type="number"
                min="1"
                max="15"
                className="input"
                value={maxQuestions}
                onChange={(e) => setMaxQuestions(e.target.value)}
              />
            </div>
          </div>
          <label className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={consentToStore}
              onChange={(e) => setConsentToStore(e.target.checked)}
            />
            Save this mock interview (questions, answers, and feedback) to my history. If unchecked, only
            the final score summary is shown to you and nothing is stored.
          </label>

          {error && <p className="field-error">{error}</p>}

          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? <Loader2 size={16} className="animate-spin" /> : null}
            {busy ? stage || "Starting…" : "Start mock interview"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{jobTitle}</h1>
        <span className="text-sm text-slate-400">
          Question {session.turns.length}/{session.maxQuestions}
        </span>
      </div>

      <div className="card">
        <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {currentTurn.category}
        </span>
        <p className="mt-3 text-base font-medium text-slate-900 dark:text-slate-100">{currentTurn.questionText}</p>
      </div>

      {!answered && (
        <div className="card space-y-3">
          <label className="label">Your answer</label>
          <textarea
            className="input min-h-[140px]"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer as if speaking to the interviewer…"
          />
          {error && <p className="field-error">{error}</p>}
          <button onClick={handleSubmitAnswer} disabled={busy || !answer.trim()} className="btn-primary">
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            {busy ? stage || "Evaluating…" : "Submit answer"}
          </button>
        </div>
      )}

      {answered && <AnswerFeedbackPanel feedback={currentTurn.feedback} />}

      {answered && (
        <div className="flex gap-2">
          {session.turns.length < session.maxQuestions && (
            <button onClick={handleNext} disabled={busy} className="btn-secondary">
              {busy ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}
              Next question
            </button>
          )}
          <button onClick={handleFinish} disabled={busy} className="btn-primary">
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Flag size={15} />}
            Finish interview
          </button>
        </div>
      )}
    </div>
  );
}
