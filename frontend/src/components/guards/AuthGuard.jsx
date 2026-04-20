import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function AuthGuard({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export function GuestGuard({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;
  return children;
}

export function AdminGuard({ children }) {
  const { user } = useAuth();
  if (user?.role !== 'club_admin' && user?.role !== 'superadmin') {
    return <Navigate to="/" replace />;
  }
  return children;
}
