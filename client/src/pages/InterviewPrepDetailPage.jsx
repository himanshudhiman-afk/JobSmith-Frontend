import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2, Sparkles } from "lucide-react";
import {
  getInterviewPrep,
  toggleQuestionCompleted,
  toggleTaskCompleted
} from "../services/interviewService";
import { generateStudyPlan } from "../services/ai/interviewPreparation";
import { apiClient, getApiErrorMessage } from "../services/apiClient";
import { InterviewQuestionCard } from "../components/InterviewQuestionCard";
import { ProgressBar } from "../components/ProgressBar";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { ErrorState } from "../components/ErrorState";
import { Tabs } from "../components/Tabs";
import { useToast } from "../context/ToastContext";

export function InterviewPrepDetailPage() {
  const { id } = useParams();
  const { showToast } = useToast();
  const [prep, setPrep] = useState(null);
  const [error, setError] = useState("");
  const [availableDays, setAvailableDays] = useState(7);
  const [proficiency, setProficiency] = useState("intermediate");
  const [pace, setPace] = useState("steady");
  const [targetDate, setTargetDate] = useState("");
  const [generatingPlan, setGeneratingPlan] = useState(false);

  const load = async () => {
    setError("");
    try {
      const data = await getInterviewPrep(id);
      setPrep(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleToggleQuestion = async (questionId, completed) => {
    try {
      const updated = await toggleQuestionCompleted(id, questionId, completed);
      setPrep(updated);
    } catch (err) {
      showToast(getApiErrorMessage(err), "error");
    }
  };

  const handleToggleTask = async (taskId, completed) => {
    try {
      const updated = await toggleTaskCompleted(id, taskId, completed);
      setPrep(updated);
    } catch (err) {
      showToast(getApiErrorMessage(err), "error");
    }
  };

  const handleGeneratePlan = async () => {
    setGeneratingPlan(true);
    try {
      const missingSkills = prep.questions
        .filter((q) => q.conceptsToRevise?.length)
        .flatMap((q) => q.conceptsToRevise);

      const tasks = await generateStudyPlan({
        jobTitle: prep.jobTitle,
        missingOrUnclearSkills: [...new Set(missingSkills)],
        availableDays: Number(availableDays),
        proficiency,
        pace,
        targetDate
      });

      const { data } = await apiClient.post(`/interviews/generate`, {
        jobAnalysisId: prep.jobAnalysis,
        jobTitle: prep.jobTitle,
        questions: prep.questions,
        studyPlan: { availableDays: Number(availableDays), targetInterviewDate: targetDate || undefined, tasks }
      });

      setPrep(data.data.preparation);
      showToast("Study plan generated.", "success");
    } catch (err) {
      showToast(getApiErrorMessage(err), "error");
    } finally {
      setGeneratingPlan(false);
    }
  };

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!prep) return <LoadingSkeleton rows={4} />;

  const completed = prep.questions.filter((q) => q.completed).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{prep.jobTitle}</h1>
        <div className="mt-3 max-w-sm">
          <ProgressBar value={completed} max={prep.questions.length} label="Questions completed" />
        </div>
      </div>

      <Tabs
        tabs={[
          {
            id: "questions",
            label: "Questions",
            content: (
              <div className="space-y-3">
                {prep.questions.map((q) => (
                  <InterviewQuestionCard
                    key={q._id}
                    question={q}
                    onToggleCompleted={(completed) => handleToggleQuestion(q._id, completed)}
                  />
                ))}
              </div>
            )
          },
          {
            id: "study-plan",
            label: "Study Plan",
            content: (
              <div className="space-y-4">
                <div className="card space-y-4">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {prep.studyPlan?.tasks?.length ? "Regenerate" : "Generate"} your study plan
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-4">
                    <div>
                      <label className="label">Available days</label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        className="input"
                        value={availableDays}
                        onChange={(e) => setAvailableDays(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="label">Proficiency</label>
                      <select className="input" value={proficiency} onChange={(e) => setProficiency(e.target.value)}>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Pace</label>
                      <select className="input" value={pace} onChange={(e) => setPace(e.target.value)}>
                        <option value="relaxed">Relaxed</option>
                        <option value="steady">Steady</option>
                        <option value="intensive">Intensive</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Target date (optional)</label>
                      <input
                        type="date"
                        className="input"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <button onClick={handleGeneratePlan} disabled={generatingPlan} className="btn-primary">
                    {generatingPlan ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                    Generate plan
                  </button>
                </div>

                {prep.studyPlan?.tasks?.length > 0 && (
                  <div className="space-y-2">
                    {Array.from(new Set(prep.studyPlan.tasks.map((t) => t.day))).map((day) => (
                      <div key={day} className="card">
                        <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                          Day {day}
                        </h4>
                        <div className="space-y-2">
                          {prep.studyPlan.tasks
                            .filter((t) => t.day === day)
                            .map((task) => (
                              <label key={task._id} className="flex items-start gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  className="mt-0.5"
                                  checked={task.completed}
                                  onChange={(e) => handleToggleTask(task._id, e.target.checked)}
                                />
                                <span className={task.completed ? "text-slate-400 line-through" : ""}>
                                  <span className="font-medium">{task.title}</span>
                                  {task.description && <span className="text-slate-500"> — {task.description}</span>}
                                  <span className="ml-1 text-xs text-slate-400">
                                    ({task.estimatedMinutes} min, {task.priority} priority)
                                  </span>
                                </span>
                              </label>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          }
        ]}
      />
    </div>
  );
}
