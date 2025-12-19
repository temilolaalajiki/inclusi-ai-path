import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/hooks/useAuth';
import { LoadingScreen } from '@/components/LoadingScreen';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  // Redirect to auth if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If no specific roles required, allow any authenticated user
  if (!allowedRoles || allowedRoles.length === 0) {
    return <>{children}</>;
  }

  // Check if user has an allowed role
  if (userRole && allowedRoles.includes(userRole)) {
    return <>{children}</>;
  }

  // Redirect to appropriate dashboard based on role
  if (userRole === 'learner') {
    return <Navigate to="/learner" replace />;
  } else if (userRole === 'teacher') {
    return <Navigate to="/teacher" replace />;
  } else if (userRole === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  // Fallback to home if no role
  return <Navigate to="/" replace />;
}
