import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { forgotPasswordSchema } from "../schemas/authSchemas";
import { zodResolver } from "../utils/zodResolver";
import { apiClient, getApiErrorMessage } from "../services/apiClient";

export function ForgotPasswordPage() {
  const [message, setMessage] = useState("");
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async ({ email }) => {
    setServerError("");
    setMessage("");
    try {
      const { data } = await apiClient.post("/auth/forgot-password", { email });
      setMessage(data.data.message);
    } catch (err) {
      setServerError(getApiErrorMessage(err));
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Reset your password</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input id="email" type="email" autoComplete="email" className="input" {...register("email")} />
          {errors.email && <p className="field-error">{errors.email.message}</p>}
        </div>

        {message && <p className="text-sm font-medium text-emerald-600">{message}</p>}
        {serverError && <p className="field-error">{serverError}</p>}

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          Send reset link
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        <Link to="/login" className="font-medium text-accent-600 hover:underline">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
