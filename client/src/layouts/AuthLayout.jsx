import { Link, Outlet, useLocation } from "react-router-dom";

export function AuthLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-charcoal text-sm font-bold text-accent-500">
            JP
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100">Job Prep</span>
        </Link>
        <div key={location.pathname} className="page-enter">
          <div className="card">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
