import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { FileText, ClipboardList, GraduationCap, MessageSquareText, Plus, TrendingUp } from "lucide-react";
import { getDashboardSummary, getDashboardActivity } from "../services/dashboardService";
import { StatCard } from "../components/StatCard";
import { SkeletonCard } from "../components/LoadingSkeleton";
import { ErrorState } from "../components/ErrorState";
import { EmptyState } from "../components/EmptyState";
import { getApiErrorMessage } from "../services/apiClient";

const GAP_BAR_COLORS = ["#FFA116", "#f7b64c", "#96D1F9", "#75bce9"];

function SkillGapTooltip({ active, payload, label, totalAnalyses }) {
  if (!active || !payload?.length) return null;

  const count = payload[0].value;

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <p className="font-semibold text-slate-900 dark:text-slate-100">{label}</p>
      <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">
        <span className="font-semibold text-accent-700 dark:text-accent-300">{count}</span>{" "}
        of {totalAnalyses} {totalAnalyses === 1 ? "analysis" : "analyses"}
      </p>
    </div>
  );
}

export function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [activity, setActivity] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [summaryData, activityData] = await Promise.all([getDashboardSummary(), getDashboardActivity()]);
      setSummary(summaryData);
      setActivity(activityData);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) return <ErrorState message={error} onRetry={load} />;

  const hasAnyData = summary.totals.resumes > 0 || summary.totals.analyses > 0;
  const analysisCount = summary.totals.analyses;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
        <Link to="/resumes/upload" className="btn-primary">
          <Plus size={16} /> New resume
        </Link>
      </div>

      {!hasAnyData && (
        <EmptyState
          icon={FileText}
          title="Let's get your first resume analyzed"
          description="Upload a resume and paste a job description to see your match score and skill gaps."
          action={
            <Link to="/resumes/upload" className="btn-primary">
              Upload a resume
            </Link>
          }
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FileText} label="Resumes" value={summary.totals.resumes} accent="accent" />
        <StatCard icon={ClipboardList} label="Analyses" value={summary.totals.analyses} accent="violet" />
        <StatCard
          icon={GraduationCap}
          label="Interview preps"
          value={summary.totals.interviewPreparations}
          accent="emerald"
        />
        <StatCard
          icon={MessageSquareText}
          label="Mock interviews"
          value={summary.totals.completedMockInterviews}
          accent="amber"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-1 text-sm font-semibold text-slate-900 dark:text-slate-100">Average match score</h2>
          <p className="text-3xl font-bold text-accent-600">
            {summary.averageMatchScore ?? "—"}
            {summary.averageMatchScore !== null && <span className="text-base text-slate-400">/100</span>}
          </p>
          <p className="mt-1 text-xs text-slate-400">AI-generated estimate across all your analyses.</p>
        </div>
        <div className="card">
          <h2 className="mb-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
            Average mock interview score
          </h2>
          <p className="text-3xl font-bold text-emerald-600">
            {summary.averageMockScore ?? "—"}
            {summary.averageMockScore !== null && <span className="text-base text-slate-400">/100</span>}
          </p>
          <p className="mt-1 text-xs text-slate-400">AI-generated practice feedback, not a hiring assessment.</p>
        </div>
      </div>

      {summary.topSkillGaps.length > 0 && (
        <div className="card overflow-hidden">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-50 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300">
                  <TrendingUp size={17} />
                </span>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Most common skill gaps</h2>
              </div>
              <p className="mt-2 text-base text-slate-500 dark:text-slate-400">
                How often each skill was not clearly demonstrated in your analyzed roles.
              </p>
            </div>
            <span className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {analysisCount} {analysisCount === 1 ? "role analyzed" : "roles analyzed"}
            </span>
          </div>

          <div className="h-[300px] w-full sm:h-[340px]" role="img" aria-label="Horizontal bar chart of the most common skill gaps">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={summary.topSkillGaps}
                layout="vertical"
                margin={{ top: 4, right: 36, bottom: 8, left: 8 }}
                barCategoryGap="28%"
              >
                <CartesianGrid
                  horizontal={false}
                  stroke="currentColor"
                  strokeDasharray="3 5"
                  className="text-slate-200 dark:text-slate-700"
                />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  domain={[0, (max) => Math.max(max, 1)]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 13, fontFamily: '"EB Garamond", Georgia, serif' }}
                  tickCount={Math.min(analysisCount + 1, 6)}
                  label={{
                    value: "Number of roles",
                    position: "insideBottom",
                    offset: -4,
                    fill: "#94a3b8",
                    fontSize: 13,
                    fontFamily: '"EB Garamond", Georgia, serif'
                  }}
                  height={42}
                />
                <YAxis
                  type="category"
                  dataKey="skill"
                  width={130}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#475569", fontSize: 14, fontFamily: '"EB Garamond", Georgia, serif' }}
                  tickFormatter={(value) => (value.length > 18 ? `${value.slice(0, 17)}…` : value)}
                />
                <Tooltip
                  cursor={{ fill: "rgba(150, 209, 249, 0.12)" }}
                  content={<SkillGapTooltip totalAnalyses={analysisCount} />}
                />
                <Bar dataKey="count" name="Roles" maxBarSize={24} radius={[0, 7, 7, 0]} isAnimationActive>
                  {summary.topSkillGaps.map((item, index) => (
                    <Cell key={item.skill} fill={GAP_BAR_COLORS[index % GAP_BAR_COLORS.length]} />
                  ))}
                  <LabelList
                    dataKey="count"
                    position="right"
                    offset={10}
                    fill="#64748b"
                    fontSize={13}
                    fontWeight={600}
                    fontFamily='"EB Garamond", Georgia, serif'
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">Recent activity</h2>
        {activity.length === 0 ? (
          <p className="text-sm text-slate-400">No activity yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {activity.map((item) => (
              <li key={`${item.type}-${item.id}`} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{item.title}</p>
                  <p className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleString()}</p>
                </div>
                {item.score !== null && (
                  <span className="badge bg-accent-50 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300">
                    {item.score}/100
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
