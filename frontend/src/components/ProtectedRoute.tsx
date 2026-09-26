import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children, allowedRoles }: { children: JSX.Element; allowedRoles?: Role[] }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner label="Checking your session..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />;
  }
  return children;
}
