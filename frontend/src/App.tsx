import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import StudentDashboard from './pages/StudentDashboard';
import ReportIssuePage from './pages/ReportIssuePage';
import MyIssuesPage from './pages/MyIssuesPage';
import IssueDetailsPage from './pages/IssueDetailsPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';

import AdminDashboard from './pages/AdminDashboard';
import ManageIssuesPage from './pages/ManageIssuesPage';
import AdminIssueDetailsPage from './pages/AdminIssueDetailsPage';
import ManageUsersPage from './pages/ManageUsersPage';
import ManageCategoriesPage from './pages/ManageCategoriesPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import ManagePollsPage from './pages/ManagePollsPage';
import LocationQRCodesPage from './pages/LocationQRCodesPage';

import LeaderboardPage from './pages/LeaderboardPage';
import PollsPage from './pages/PollsPage';

import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute allowedRoles={['STUDENT']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/report-issue" element={<ReportIssuePage />} />
        <Route path="/my-issues" element={<MyIssuesPage />} />
        <Route path="/polls" element={<PollsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['ADMIN']}><DashboardLayout /></ProtectedRoute>}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/issues" element={<ManageIssuesPage />} />
        <Route path="/admin/issues/:id" element={<AdminIssueDetailsPage />} />
        <Route path="/admin/users" element={<ManageUsersPage />} />
        <Route path="/admin/categories" element={<ManageCategoriesPage />} />
        <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
        <Route path="/admin/polls" element={<ManagePollsPage />} />
        <Route path="/admin/qr-codes" element={<LocationQRCodesPage />} />
      </Route>

      {/* Shared route accessible by both roles once logged in */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/issues/:id" element={<IssueDetailsPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
      </Route>

      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
