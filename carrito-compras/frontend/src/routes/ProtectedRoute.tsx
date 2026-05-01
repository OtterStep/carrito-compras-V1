import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.rol?.toUpperCase())) {
    console.log('ProtectedRoute: Role not allowed', { userRole: user?.rol, allowedRoles });
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
