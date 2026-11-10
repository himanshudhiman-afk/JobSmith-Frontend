import { Link } from "react-router-dom";
import {
  FileSearch,
  Target,
  MessageSquareText,
  FileSignature,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

const FEATURES = [
  {
    icon: FileSearch,
    title: "Resume ↔ Job Analysis",
    description:
      "Upload your resume and a job description to get an evidence-based compatibility estimate, not a guess."
  },
  {
    icon: Target,
    title: "Skill Gap Detection",
    description: "See exactly which requirements your resume demonstrates, and which are missing or unclear."
  },
  {
    icon: FileSignature,
    title: "Truthful Resume Optimization",
    description: "Get rewritten bullets and summaries you review and approve — nothing is invented."
  },
  {
    icon: MessageSquareText,
    title: "Mock Interviews",
    description: "Practice technical and behavioral questions with AI feedback and a final report."
  }
];

const STEPS = [
  "Create an account and upload your resume",
  "Paste a target job description",
  "Review your AI-generated match score and skill gaps",
  "Optimize your resume and prepare for interview questions",
  "Download an ATS-friendly PDF and track your progress"
];

const HERO_CARDS = [
  { icon: FileSearch, eyebrow: "RESUME INSIGHTS", title: "See where you stand", accent: "bg-accent-50 text-accent-700" },
  { icon: Target, eyebrow: "SKILL FOCUS", title: "Know what to improve", accent: "bg-sky-50 text-sky-700" },
  {
    icon: MessageSquareText,
    eyebrow: "INTERVIEW PRACTICE",
    title: "Build confidence as you go",
    accent: "bg-orange-50 text-orange-700"
  },
  {
    icon: FileSignature,
    eyebrow: "CAREER TOOLKIT",
    title: "Make every application count",
    accent: "bg-blue-50 text-blue-700"
  }
];

export function LandingPage() {
  return (
    <div className="bg-white dark:bg-slate-950">
      <header className="mx-auto flex max-w-6xl items-center justify-between border-b border-slate-100 px-4 py-5 sm:px-6 lg:px-8 dark:border-slate-900">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-charcoal text-sm font-bold text-accent-500">
            JP
          </div>
          <span className="text-base font-bold text-slate-900 dark:text-slate-100">Job Prep</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-secondary">
            Log in
          </Link>
          <Link to="/register" className="btn-primary">
            Get started
          </Link>
        </div>
      </header>

      <section className="hero-intro relative isolate mx-auto mt-8 max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 via-white to-orange-50 px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
        <div className="hero-glow pointer-events-none absolute -right-20 -top-24 -z-10 h-64 w-64 rounded-full bg-brand-blue/20 blur-3xl" />
        <div className="hero-glow pointer-events-none absolute -bottom-28 -left-20 -z-10 h-64 w-64 rounded-full bg-accent-200/30 blur-3xl [animation-delay:-4s]" />
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-blue/60 bg-white/80 px-3 py-1.5 text-xs font-semibold text-brand-charcoal shadow-sm dark:bg-slate-900/80 dark:text-slate-200">
          <span className="h-2 w-2 rounded-full bg-accent-500" />
          Your next career move, made clearer
        </div>
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl dark:text-slate-50">
          Prepare for your next role with AI you can actually trust
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-400">
          Tailor your resume to a job description, understand your real skill gaps, and practice
          interviews — with AI output that is always evidence-based and always editable by you.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/register" className="btn-primary px-6 py-3 text-base">
            Start for free <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn-secondary px-6 py-3 text-base">
            I have an account
          </Link>
        </div>
      </section>

      <section className="hero-marquee relative mt-8 overflow-hidden border-y border-slate-100 bg-slate-50/80 py-4 dark:border-slate-800 dark:bg-slate-900/40" aria-label="Job Prep features">
        <p className="sr-only">Resume insights, skill focus, interview practice, and career tools.</p>
        <div className="hero-marquee-track flex w-max" aria-hidden="true">
          {[0, 1].map((group) => (
            <div key={group} className="flex shrink-0 gap-4 pr-4">
              {HERO_CARDS.map(({ icon: Icon, eyebrow, title, accent }) => (
                <div
                  key={`${group}-${title}`}
                  className="hero-marquee-card flex w-[250px] items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${accent}`}>
                    <Icon size={18} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[10px] font-bold tracking-wider text-slate-400">{eyebrow}</span>
                    <span className="mt-0.5 block truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {title}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="card">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 text-accent-600 ring-1 ring-inset ring-accent-100 dark:bg-accent-900/40">
                <Icon size={19} />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold text-slate-900 dark:text-slate-100">How it works</h2>
        <ol className="mt-8 space-y-4">
          {STEPS.map((step, i) => (
            <li key={step} className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-500 text-xs font-bold text-brand-charcoal">
                {i + 1}
              </span>
              <span className="pt-0.5 text-sm text-slate-700 dark:text-slate-300">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-slate-100 bg-slate-50 py-12 dark:border-slate-900 dark:bg-slate-900/40">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-4 flex items-center justify-center gap-2 text-sm font-medium text-slate-500">
            <CheckCircle2 size={16} className="text-emerald-600" />
            Match scores are AI-generated estimates, not real ATS scores or hiring predictions.
          </div>
          <Link to="/register" className="btn-primary px-6 py-3 text-base">
            Create your free account
          </Link>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-slate-400 sm:flex-row sm:px-6 lg:px-8">
        <span>© {new Date().getFullYear()} Job Prep</span>
        <div className="flex gap-4">
          <Link to="/privacy" className="hover:text-slate-600">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-slate-600">
            Terms
          </Link>
        </div>
      </footer>
    </div>
  );
}
