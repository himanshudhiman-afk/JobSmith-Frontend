import { Link, Outlet, useLocation } from "react-router-dom";
import { BrandLogo } from "../components/BrandLogo";

export function AuthLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <BrandLogo className="h-12" />
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
