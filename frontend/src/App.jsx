import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PollsPage from './pages/PollsPage';
import PollDetailPage from './pages/PollDetailPage';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import UserProfilePage from './pages/UserProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import NotFoundPage from './pages/NotFoundPage';

// Voter Dashboard
import VoterDashboard from './voter/VoterDashboard';

// Candidate Dashboard
import CandidateDashboard from './candidate/CandidateDashboard';

// Admin Pages
import AdminDashboard from './admin/AdminDashboard';
import AdminPolls from './admin/AdminPolls';
import AdminCandidates from './admin/AdminCandidates';
import AdminApplications from './admin/AdminApplications';
import AdminPollRequests from './admin/AdminPollRequests';
import AdminVoters from './admin/AdminVoters';
import AdminResults from './admin/AdminResults';
import AdminNews from './admin/AdminNews';
import AdminMessages from './admin/AdminMessages';
import AdminReports from './admin/AdminReports';
import AdminSettings from './admin/AdminSettings';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Standard Website Shell (Navbar & Footer) */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/polls" element={<PollsPage />} />
              <Route path="/polls/:id" element={<PollDetailPage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/news/:slug" element={<NewsDetailPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/about" element={<AboutPage />} />

              {/* Protected Profile & Notifications in Main Shell */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <UserProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <NotificationsPage />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Voter Dashboard */}
            <Route
              path="/voter"
              element={
                <ProtectedRoute allowedRoles={['voter', 'candidate', 'admin']}>
                  <DashboardLayout role="voter" />
                </ProtectedRoute>
              }
            >
              <Route index element={<VoterDashboard />} />
            </Route>

            {/* Candidate Portal */}
            <Route
              path="/candidate"
              element={
                <ProtectedRoute allowedRoles={['candidate', 'admin']}>
                  <DashboardLayout role="candidate" />
                </ProtectedRoute>
              }
            >
              <Route index element={<CandidateDashboard />} />
            </Route>

            {/* Administrator Console */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout role="admin" />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="polls" element={<AdminPolls />} />
              <Route path="candidates" element={<AdminCandidates />} />
              <Route path="applications" element={<AdminApplications />} />
              <Route path="poll-requests" element={<AdminPollRequests />} />
              <Route path="voters" element={<AdminVoters />} />
              <Route path="results" element={<AdminResults />} />
              <Route path="news" element={<AdminNews />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
