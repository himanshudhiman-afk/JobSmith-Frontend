import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { loginSchema } from "../schemas/authSchemas";
import { zodResolver } from "../utils/zodResolver";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getApiErrorMessage } from "../services/apiClient";
import { Loader2 } from "lucide-react";

export function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values) => {
    setServerError("");
    try {
      await login(values);
      showToast("Welcome back!", "success");
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (err) {
      setServerError(getApiErrorMessage(err));
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Log in</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Welcome back. Enter your details.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input id="email" type="email" autoComplete="email" className="input" {...register("email")} />
          {errors.email && <p className="field-error">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="input"
            {...register("password")}
          />
          {errors.password && <p className="field-error">{errors.password.message}</p>}
        </div>

        {serverError && <p className="field-error">{serverError}</p>}

        <div className="flex items-center justify-between text-sm">
          <Link to="/forgot-password" className="font-medium text-accent-600 hover:underline">
            Forgot password?
          </Link>
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          Log in
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="font-medium text-accent-600 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
