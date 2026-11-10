import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { resetPasswordSchema } from "../schemas/authSchemas";
import { zodResolver } from "../utils/zodResolver";
import { apiClient, getApiErrorMessage } from "../services/apiClient";
import { useToast } from "../context/ToastContext";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(resetPasswordSchema) });

  const onSubmit = async ({ password }) => {
    setServerError("");
    try {
      await apiClient.post("/auth/reset-password", { token, password });
      showToast("Password reset. Please log in.", "success");
      navigate("/login");
    } catch (err) {
      setServerError(getApiErrorMessage(err));
    }
  };

  if (!token) {
    return (
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Invalid link</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          This password reset link is missing its token.{" "}
          <Link to="/forgot-password" className="font-medium text-accent-600 hover:underline">
            Request a new one
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Set a new password</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <div>
          <label htmlFor="password" className="label">
            New password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            className="input"
            {...register("password")}
          />
          {errors.password && <p className="field-error">{errors.password.message}</p>}
        </div>
        <div>
          <label htmlFor="confirmPassword" className="label">
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            className="input"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && <p className="field-error">{errors.confirmPassword.message}</p>}
        </div>

        {serverError && <p className="field-error">{serverError}</p>}

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          Reset password
        </button>
      </form>
    </div>
  );
}
