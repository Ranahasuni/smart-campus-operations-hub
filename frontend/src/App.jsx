import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import ResourcesPage from './pages/resources/ResourcesPage';
import BookingsPage from './pages/bookings/BookingsPage';
import TicketsPage from './pages/tickets/TicketsPage';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/resources" element={
            <ProtectedRoute><ResourcesPage /></ProtectedRoute>
          } />
          <Route path="/bookings" element={
            <ProtectedRoute><BookingsPage /></ProtectedRoute>
          } />
          <Route path="/tickets" element={
            <ProtectedRoute><TicketsPage /></ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
