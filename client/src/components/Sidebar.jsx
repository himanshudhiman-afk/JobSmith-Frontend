import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  UploadCloud,
  ClipboardList,
  FileSignature,
  GraduationCap,
  MessageSquareText,
  History,
  Settings,
  X
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/resumes", label: "Resume Library", icon: FileText },
  { to: "/resumes/upload", label: "Upload Resume", icon: UploadCloud },
  { to: "/analyze", label: "Job Analysis", icon: ClipboardList },
  { to: "/interview-prep", label: "Interview Prep", icon: GraduationCap },
  { to: "/mock-interview", label: "Mock Interview", icon: MessageSquareText },
  { to: "/builder", label: "ATS Resume Builder", icon: FileSignature },
  { to: "/history", label: "History", icon: History },
  { to: "/settings", label: "Settings", icon: Settings }
];

export function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 shrink-0 border-r border-slate-200 bg-white px-3 py-5 transition-transform dark:border-slate-800 dark:bg-slate-900 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-6 flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-charcoal text-sm font-bold text-accent-500">
              JP
            </div>
            <span className="text-base font-bold text-slate-900 dark:text-slate-100">Job Prep</span>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 lg:hidden">
            <X size={18} />
          </button>
        </div>
        <nav className="space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent-50 text-accent-700 ring-1 ring-inset ring-accent-100 dark:bg-accent-900/40 dark:text-accent-300"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`
              }
              end={to === "/dashboard"}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
