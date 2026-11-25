import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, LogIn, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { getApiErrorMessage } from "../services/apiClient";
import { PuterSignInCancelledError, switchPuterAccount } from "../services/puterClient";

export function SettingsPage() {
  const { deleteAccount } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [switchingPuterAccount, setSwitchingPuterAccount] = useState(false);

  const handleSwitchPuterAccount = async () => {
    setSwitchingPuterAccount(true);
    try {
      await switchPuterAccount();
      showToast("Puter account switched successfully.", "success");
    } catch (err) {
      const cancelled = err instanceof PuterSignInCancelledError;
      showToast(getApiErrorMessage(err), cancelled ? "info" : "error");
    } finally {
      setSwitchingPuterAccount(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAccount();
      showToast("Your account and all associated data have been deleted.", "success");
      navigate("/");
    } catch (err) {
      showToast(getApiErrorMessage(err), "error");
    } finally {
      setConfirmOpen(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>

      <div className="card">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Puter AI account</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Sign out of Puter and sign in with a different account for AI features.
        </p>
        <button
          onClick={handleSwitchPuterAccount}
          disabled={switchingPuterAccount}
          className="btn-secondary mt-4"
        >
          {switchingPuterAccount ? <Loader2 size={15} className="animate-spin" /> : <LogIn size={15} />}
          {switchingPuterAccount ? "Switching account..." : "Switch Puter account"}
        </button>
      </div>

      <div className="card border-red-200 dark:border-red-900/50">
        <h2 className="text-sm font-semibold text-red-700 dark:text-red-400">Danger zone</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Permanently delete your account, resumes, analyses, interview preparations, and mock interview
          history. This cannot be undone.
        </p>
        <button onClick={() => setConfirmOpen(true)} className="btn-danger mt-4">
          <Trash2 size={15} /> Delete my account
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete your account?"
        description="All your resumes, analyses, interview preparations, and mock interview history will be permanently deleted."
        confirmLabel="Delete account"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
