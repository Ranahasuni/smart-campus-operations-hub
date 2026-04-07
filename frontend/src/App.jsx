import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import UserProfile from './pages/auth/UserProfile';
import NotificationPage from './pages/NotificationPage';
import ResourcesPage from './pages/resources/ResourcesPage';
import BookingsPage from './pages/bookings/BookingsPage';
import TicketsPage from './pages/tickets/TicketsPage';
import ProtectedRoute from './components/ProtectedRoute';
import ResourceFormPage from './pages/resources/ResourceForm/ResourceFormPage';

import Dashboard from './pages/admin/Dashboard';
import ManageUsers from './pages/admin/ManageUsers';
import SystemLogs from './pages/admin/SystemLogs';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <div style={{ minHeight: 'calc(100vh - 64px)' }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Authenticated Routes */}
            <Route path="/profile" element={
              <ProtectedRoute><UserProfile /></ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute><NotificationPage /></ProtectedRoute>
            } />

            {/* Member Module Routes */}
            <Route path="/resources" element={
              <ProtectedRoute><ResourcesPage /></ProtectedRoute>
            } />
            <Route path="/bookings" element={
              <ProtectedRoute><BookingsPage /></ProtectedRoute>
            } />
            <Route path="/tickets" element={
              <ProtectedRoute><TicketsPage /></ProtectedRoute>
            } />

            {/* Admin only */}
            <Route path="/admin" element={
              <ProtectedRoute role="ADMIN">
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute role="ADMIN">
                <ManageUsers />
              </ProtectedRoute>
            } />
            <Route path="/admin/resources" element={
              <ProtectedRoute role="ADMIN">
                <ResourcesPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/logs" element={
              <ProtectedRoute role="ADMIN">
                <SystemLogs />
              </ProtectedRoute>
            } />

            <Route path="/admin/resources/new" element={
              <ProtectedRoute role="ADMIN">
                <ResourceFormPage />
              </ProtectedRoute>
            } />

            <Route path="/admin/resources/edit/:id" element={
              <ProtectedRoute role="ADMIN">
                <ResourceFormPage />
              </ProtectedRoute>
            } />

            {/* Staff-related dashboard (Staff, Lecturers, Technicians) */}
            <Route path="/staff" element={
              <ProtectedRoute role={['STAFF', 'LECTURER', 'TECHNICIAN']}>
                <div style={{ padding: '80px', textAlign: 'center', color: '#fff' }}>
                  <h1>Staff Portal</h1>
                  <p>Faculty, Maintenance & Academic staff resource hub.</p>
                </div>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

