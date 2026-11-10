import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute, PublicOnlyRoute } from "./routes/ProtectedRoute";
import { AuthLayout } from "./layouts/AuthLayout";
import { DashboardLayout } from "./layouts/DashboardLayout";

import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage";
import { TermsPage } from "./pages/TermsPage";

import { DashboardPage } from "./pages/DashboardPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ResumeLibraryPage } from "./pages/ResumeLibraryPage";
import { ResumeUploadPage } from "./pages/ResumeUploadPage";
import { ResumeDetailPage } from "./pages/ResumeDetailPage";
import { AnalyzePage } from "./pages/AnalyzePage";
import { AnalysisDetailPage } from "./pages/AnalysisDetailPage";
import { InterviewPrepListPage } from "./pages/InterviewPrepListPage";
import { InterviewPrepDetailPage } from "./pages/InterviewPrepDetailPage";
import { MockInterviewPage } from "./pages/MockInterviewPage";
import { AtsResumeBuilderPage } from "./pages/AtsResumeBuilderPage";
import { HistoryPage } from "./pages/HistoryPage";
import { SettingsPage } from "./pages/SettingsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsPage />} />

      <Route element={<PublicOnlyRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/resumes" element={<ResumeLibraryPage />} />
          <Route path="/resumes/upload" element={<ResumeUploadPage />} />
          <Route path="/resumes/:id" element={<ResumeDetailPage />} />
          <Route path="/analyze" element={<AnalyzePage />} />
          <Route path="/analyses/:id" element={<AnalysisDetailPage />} />
          <Route path="/interview-prep" element={<InterviewPrepListPage />} />
          <Route path="/interview-prep/:id" element={<InterviewPrepDetailPage />} />
          <Route path="/mock-interview" element={<MockInterviewPage />} />
          <Route path="/builder" element={<AtsResumeBuilderPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
