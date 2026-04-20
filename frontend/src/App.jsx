import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SettingsProvider } from './context/SettingsContext';
import { AuthGuard, GuestGuard, AdminGuard } from './components/guards/AuthGuard';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Billing from './pages/Billing';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Settings from './pages/Settings';
import Members from './pages/Members';
import Candidates from './pages/Candidates';
import Gallery from './pages/Gallery';
import PaymentDummy from './pages/PaymentDummy';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import NotFound from './pages/NotFound';

function OptionalLayout() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Layout /> : <Outlet />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <SettingsProvider>
          <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<GuestGuard><Login /></GuestGuard>} />
            <Route path="/forgot-password" element={<GuestGuard><ForgotPassword /></GuestGuard>} />
            <Route path="/reset-password/:token" element={<GuestGuard><ResetPassword /></GuestGuard>} />
            
            <Route element={<OptionalLayout />}>
              <Route path="/events/:id" element={<EventDetail />} />
            </Route>
  
            {/* Protected */}
            <Route element={<AuthGuard><Layout /></AuthGuard>}>
              <Route index element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="billing" element={<Billing />} />
              <Route path="events" element={<Events />} />
              <Route path="settings" element={<AdminGuard><Settings /></AdminGuard>} />
              <Route path="members" element={<Members />} />
              <Route path="candidates" element={<AdminGuard><Candidates /></AdminGuard>} />
              <Route path="gallery" element={<AdminGuard><Gallery /></AdminGuard>} />
              <Route path="pay/:id" element={<PaymentDummy />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </SettingsProvider>
    </ThemeProvider>
  </BrowserRouter>
  );
}
