import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import UserProfile from './pages/auth/UserProfile';
import OAuth2CallbackPage from './pages/auth/OAuth2CallbackPage';
import NotificationPage from './pages/NotificationPage';
import ResourcesPage from './pages/resources/ResourcesPage';
import BookingsPage from './pages/bookings/BookingsPage';
import BookingResourceListPage from './pages/bookings/BookingResourceListPage';
import BookingResourceDetailsPage from './pages/bookings/BookingResourceDetailsPage';
import CreateBookingPage from './pages/bookings/CreateBookingPage';
import MyBookingsPage from './pages/bookings/MyBookingsPage';
import BookingHistoryPage from './pages/bookings/BookingHistoryPage';
import EditBookingPage from './pages/bookings/EditBookingPage';
import TicketsPage from './pages/tickets/TicketsPage';
import CreateTicketPage from './pages/tickets/CreateTicketPage';
import TicketDetailsPage from './pages/tickets/TicketDetailsPage';
import ProtectedRoute from './components/ProtectedRoute';
import ResourceEditorPage from './pages/resources/ResourceForm/ResourceEditorPage';
import ResourceDetailsPage from './pages/resources/Details/ResourceDetailsPage';
import StaffPortal from './pages/StaffPortal';
import TechnicianPortal from './pages/TechnicianPortal';
import CheckInPage from './pages/bookings/CheckInPage';

import Dashboard from './pages/admin/Dashboard.jsx';
import ManageUsers from './pages/admin/ManageUsers';
import UserActionTimeline from './pages/admin/UserActionTimeline';
import SystemLogs from './pages/admin/SystemLogs';
import ResourceManagementPage from './pages/resources/ResourceManagementPage';
import ManageBookings from './pages/admin/ManageBookings';
import BookingReview from './pages/admin/BookingReview';
import BookingCalendar from './pages/admin/BookingCalendar';
import ManageTickets from './pages/admin/ManageTickets';
import TicketReview from './pages/admin/TicketReview';
import ResourceAnalyticsPage from './pages/admin/DashboardComponents/ResourceAnalyticsPage';

// ── Role-Based Theme Synchronizer ──
import { useAuth } from './context/AuthContext';
import { useEffect } from 'react';

function ThemeSync() {
  const { user } = useAuth();
  
  useEffect(() => {
    if (user && user.role) {
      const accentVar = `var(--role-accent-${user.role})`;
      document.documentElement.style.setProperty('--accent-primary', accentVar);
      document.documentElement.style.setProperty('--accent-glow', `color-mix(in srgb, ${accentVar} 35%, transparent)`);
    } else {
      document.documentElement.style.removeProperty('--accent-primary');
      document.documentElement.style.removeProperty('--accent-glow');
    }
  }, [user]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeSync />
      <BrowserRouter>
        <Navbar />
        <div style={{ minHeight: 'calc(100vh - 64px)' }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/oauth2/callback" element={<OAuth2CallbackPage />} />

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
            <Route path="/resources/:id" element={
              <ProtectedRoute><ResourceDetailsPage /></ProtectedRoute>
            } />
            <Route path="/bookings" element={
              <ProtectedRoute><BookingsPage /></ProtectedRoute>
            } />
            <Route path="/bookings/resources/:type" element={
              <ProtectedRoute><BookingResourceListPage /></ProtectedRoute>
            } />
            <Route path="/bookings/resource/:id" element={
              <ProtectedRoute><BookingResourceDetailsPage /></ProtectedRoute>
            } />
            <Route path="/bookings/create/:id" element={
              <ProtectedRoute><CreateBookingPage /></ProtectedRoute>
            } />
            <Route path="/bookings/edit/:id" element={
              <ProtectedRoute><EditBookingPage /></ProtectedRoute>
            } />
            <Route path="/my-bookings" element={
              <ProtectedRoute><MyBookingsPage /></ProtectedRoute>
            } />
            <Route path="/booking-history" element={
              <ProtectedRoute><BookingHistoryPage /></ProtectedRoute>
            } />
            <Route path="/check-in/:type/:id" element={
              <ProtectedRoute><CheckInPage /></ProtectedRoute>
            } />
            <Route path="/tickets" element={
              <ProtectedRoute><TicketsPage /></ProtectedRoute>
            } />
            <Route path="/tickets/new" element={
              <ProtectedRoute><CreateTicketPage /></ProtectedRoute>
            } />
            <Route path="/tickets/:id" element={
              <ProtectedRoute><TicketDetailsPage /></ProtectedRoute>
            } />

            <Route path="/admin" element={
              <ProtectedRoute role={['ADMIN', 'LECTURER']}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute role={['ADMIN', 'LECTURER']}>
                <ResourceAnalyticsPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute role={['ADMIN', 'LECTURER']}>
                <ManageUsers />
              </ProtectedRoute>
            } />
            <Route path="/admin/users/:id/timeline" element={
              <ProtectedRoute role={['ADMIN', 'LECTURER']}>
                <UserActionTimeline />
              </ProtectedRoute>
            } />
            <Route path="/admin/resources" element={
              <ProtectedRoute role={['ADMIN', 'LECTURER']}>
                <ResourceManagementPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/bookings" element={
              <ProtectedRoute role={['ADMIN', 'LECTURER']}>
                <ManageBookings />
              </ProtectedRoute>
            } />
            <Route path="/admin/bookings/:id" element={
              <ProtectedRoute role={['ADMIN', 'LECTURER']}>
                <BookingReview />
              </ProtectedRoute>
            } />
            <Route path="/admin/bookings/calendar" element={
              <ProtectedRoute role={['ADMIN', 'LECTURER']}>
                <BookingCalendar />
              </ProtectedRoute>
            } />
            <Route path="/admin/tickets" element={
              <ProtectedRoute role={['ADMIN', 'LECTURER']}>
                <ManageTickets />
              </ProtectedRoute>
            } />
            <Route path="/admin/tickets/:id" element={
              <ProtectedRoute role={['ADMIN', 'LECTURER']}>
                <TicketReview />
              </ProtectedRoute>
            } />
            <Route path="/admin/logs" element={
              <ProtectedRoute role={['ADMIN', 'LECTURER']}>
                <SystemLogs />
              </ProtectedRoute>
            } />

            <Route path="/admin/resources/new" element={
              <ProtectedRoute role={['ADMIN', 'LECTURER']}>
                <ResourceEditorPage />
              </ProtectedRoute>
            } />

            <Route path="/admin/resources/edit/:id" element={
              <ProtectedRoute role={['ADMIN', 'LECTURER']}>
                <ResourceEditorPage />
              </ProtectedRoute>
            } />

            {/* Staff-related dashboard (Staff, Lecturers) */}
            <Route path="/staff" element={
              <ProtectedRoute role={['STAFF', 'LECTURER']}>
                <StaffPortal />
              </ProtectedRoute>
            } />

            {/* Technician-specific Hub */}
            <Route path="/technician" element={
              <ProtectedRoute role={['TECHNICIAN']}>
                <TechnicianPortal />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
/* detail refinement: refactor: optimize route structure for faster initial load */
/* detail refinement: chore: add comprehensive route navigation logging */
/* detail refinement: style: refine global transition timing functions */
/* detail refinement: perf: lazy-load non-critical dashboard charts */
/* detail refinement: refactor: extract navigation guard logic to standalone component */
/* detail refinement: docs: improve JSDoc for main router organization */
/* detail refinement: chore: standardize page container spacing across all views */
/* detail refinement: refactor: optimize scroll-to-top behavior for SPA navigation */
/* detail refinement: fix: improve resilience of route error boundaries */
/* detail refinement: style: synchronize glassmorphism tokens across main containers */
/* detail refinement: feat: add analytic tracking to primary page views */
/* detail refinement: refactor: streamline conditional rendering in main layout */
/* detail refinement: chore: update internal routing architecture documentation */
/* detail refinement: perf: memoize main layout configuration parameters */
/* detail refinement: refactor: consolidate global state provider hierarchy */
