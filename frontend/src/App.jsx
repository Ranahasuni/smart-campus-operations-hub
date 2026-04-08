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
import ResourceFormPage from './pages/resources/ResourceForm/ResourceFormPage';

import Dashboard from './pages/admin/Dashboard';
import ManageUsers from './pages/admin/ManageUsers';
import SystemLogs from './pages/admin/SystemLogs';
import ManageBookings from './pages/admin/ManageBookings';
import BookingReview from './pages/admin/BookingReview';
import BookingCalendar from './pages/admin/BookingCalendar';
import ManageTickets from './pages/admin/ManageTickets';
import TicketReview from './pages/admin/TicketReview';
import AdminResourcesPage from './pages/resources/AdminResourcesPage';

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
            <Route path="/tickets" element={
              <ProtectedRoute><TicketsPage /></ProtectedRoute>
            } />
            <Route path="/tickets/new" element={
              <ProtectedRoute><CreateTicketPage /></ProtectedRoute>
            } />
            <Route path="/tickets/:id" element={
              <ProtectedRoute><TicketDetailsPage /></ProtectedRoute>
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
                <AdminResourcesPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/bookings" element={
              <ProtectedRoute role="ADMIN">
                <ManageBookings />
              </ProtectedRoute>
            } />
            <Route path="/admin/bookings/:id" element={
              <ProtectedRoute role="ADMIN">
                <BookingReview />
              </ProtectedRoute>
            } />
            <Route path="/admin/bookings/calendar" element={
              <ProtectedRoute role="ADMIN">
                <BookingCalendar />
              </ProtectedRoute>
            } />
            <Route path="/admin/tickets" element={
              <ProtectedRoute role="ADMIN">
                <ManageTickets />
              </ProtectedRoute>
            } />
            <Route path="/admin/tickets/:id" element={
              <ProtectedRoute role="ADMIN">
                <TicketReview />
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
