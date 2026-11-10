import { Link } from "react-router-dom";

export function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link to="/" className="text-sm font-medium text-accent-600 hover:underline">
        ← Back home
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-slate-900 dark:text-slate-100">Privacy Policy</h1>
      <div className="prose mt-6 space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        <p>
          This is an academic demonstration project. Resumes, job descriptions, and interview answers you
          submit are stored in your account so you can review and manage them, and are used only to
          generate the analyses, optimizations, and feedback you request.
        </p>
        <p>
          <strong>AI processing.</strong> Generative AI features in this application are powered by
          Puter.js. When you use an AI feature, the relevant text (your resume content and/or job
          description, never your account password) is sent through Puter.js to an AI model to produce a
          response, which is shown to you for review before anything is saved.
        </p>
        <p>
          <strong>What we store.</strong> Your account details, uploaded resume text and structured
          content, job analyses, interview preparation sets, and mock interview sessions (only when you
          consent to storing a given mock interview).
        </p>
        <p>
          <strong>Deletion.</strong> You can delete individual resumes, analyses, and interview records at
          any time, or delete your entire account from Settings, which removes all associated records.
        </p>
        <p>
          <strong>Contact.</strong> This is a student project and not a production service. Do not upload
          highly sensitive personal information.
        </p>
      </div>
    </div>
  );
}
