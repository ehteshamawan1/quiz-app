import { Route, Routes, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import AdminDashboardPage from "../pages/admin/DashboardPage";
import CollegesPage from "../pages/admin/CollegesPage";
import UsersPage from "../pages/admin/UsersPage";
import TemplatesPage from "../pages/admin/TemplatesPage";
import SettingsPage from "../pages/admin/SettingsPage";
import EducatorDashboardPage from "../pages/educator/DashboardPage";
import GamesPage from "../pages/educator/GamesPage";
import CreateGamePage from "../pages/educator/CreateGamePage";
import EditGamePage from "../pages/educator/EditGamePage";
import StudentsPage from "../pages/educator/StudentsPage";
import AnalyticsPage from "../pages/educator/AnalyticsPage";
import ReportsPage from "../pages/educator/ReportsPage";
import QuestionBankPage from "../pages/educator/QuestionBankPage";
import StudentDashboardPage from "../pages/student/DashboardPage";
import AssignedGamesPage from "../pages/student/AssignedGamesPage";
import GamePlayPage from "../pages/student/GamePlayPage";
import GameResultsPage from "../pages/student/GameResultsPage";
import StudentProfilePage from "../pages/student/ProfilePage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboardPage /></ProtectedRoute>} />
      <Route path="/admin/colleges" element={<ProtectedRoute allowedRoles={["admin"]}><CollegesPage /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><UsersPage /></ProtectedRoute>} />
      <Route path="/admin/templates" element={<ProtectedRoute allowedRoles={["admin"]}><TemplatesPage /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={["admin"]}><SettingsPage /></ProtectedRoute>} />

      <Route path="/educator" element={<ProtectedRoute allowedRoles={["educator", "admin"]}><EducatorDashboardPage /></ProtectedRoute>} />
      <Route path="/educator/games" element={<ProtectedRoute allowedRoles={["educator", "admin"]}><GamesPage /></ProtectedRoute>} />
      <Route path="/educator/games/create" element={<ProtectedRoute allowedRoles={["educator", "admin"]}><CreateGamePage /></ProtectedRoute>} />
      <Route path="/educator/games/edit/:id" element={<ProtectedRoute allowedRoles={["educator", "admin"]}><EditGamePage /></ProtectedRoute>} />
      <Route path="/educator/question-bank" element={<ProtectedRoute allowedRoles={["educator", "admin"]}><QuestionBankPage /></ProtectedRoute>} />
      <Route path="/educator/students" element={<ProtectedRoute allowedRoles={["educator", "admin"]}><StudentsPage /></ProtectedRoute>} />
      <Route path="/educator/analytics" element={<ProtectedRoute allowedRoles={["educator", "admin"]}><AnalyticsPage /></ProtectedRoute>} />
      <Route path="/educator/reports" element={<ProtectedRoute allowedRoles={["educator", "admin"]}><ReportsPage /></ProtectedRoute>} />

      <Route path="/student" element={<ProtectedRoute allowedRoles={["student"]}><StudentDashboardPage /></ProtectedRoute>} />
      <Route path="/student/games" element={<ProtectedRoute allowedRoles={["student"]}><AssignedGamesPage /></ProtectedRoute>} />
      <Route path="/student/games/:gameId/play" element={<ProtectedRoute allowedRoles={["student"]}><GamePlayPage /></ProtectedRoute>} />
      <Route path="/student/games/sessions/:sessionId/results" element={<ProtectedRoute allowedRoles={["student"]}><GameResultsPage /></ProtectedRoute>} />
      <Route path="/student/profile" element={<ProtectedRoute allowedRoles={["student"]}><StudentProfilePage /></ProtectedRoute>} />
    </Routes>
  );
}
