import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Save } from "lucide-react";
import { profileSchema } from "../schemas/authSchemas";
import { zodResolver } from "../utils/zodResolver";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getApiErrorMessage } from "../services/apiClient";

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      targetRole: user?.preferences?.targetRole || "",
      experienceLevel: user?.preferences?.experienceLevel || "entry",
      preferredPace: user?.preferences?.preferredPace || "steady"
    }
  });

  useEffect(() => {
    reset({
      name: user?.name || "",
      targetRole: user?.preferences?.targetRole || "",
      experienceLevel: user?.preferences?.experienceLevel || "entry",
      preferredPace: user?.preferences?.preferredPace || "steady"
    });
  }, [user, reset]);

  const onSubmit = async ({ name, targetRole, experienceLevel, preferredPace }) => {
    try {
      await updateProfile({
        name,
        preferences: { targetRole, experienceLevel, preferredPace }
      });
      showToast("Profile updated.", "success");
    } catch (err) {
      showToast(getApiErrorMessage(err), "error");
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Profile</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
        <div>
          <label className="label">Full name</label>
          <input className="input" {...register("name")} />
          {errors.name && <p className="field-error">{errors.name.message}</p>}
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input bg-slate-50 dark:bg-slate-800" value={user?.email || ""} disabled />
        </div>
        <div>
          <label className="label">Target role</label>
          <input className="input" placeholder="e.g. Backend Engineer" {...register("targetRole")} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Experience level</label>
            <select className="input" {...register("experienceLevel")}>
              <option value="student">Student</option>
              <option value="entry">Entry level</option>
              <option value="mid">Mid level</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead</option>
            </select>
          </div>
          <div>
            <label className="label">Preferred study pace</label>
            <select className="input" {...register("preferredPace")}>
              <option value="relaxed">Relaxed</option>
              <option value="steady">Steady</option>
              <option value="intensive">Intensive</option>
            </select>
          </div>
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Save changes
        </button>
      </form>
    </div>
  );
}
