import { Navigate, Outlet } from 'react-router-dom';

import { useAppSelector } from '@/hooks/redux';
import { ROUTES } from '@/constants/routes';

type ProtectedRouteProps = {
  requireAuth?: boolean;
  allowedRoles?: string[];
};

export function ProtectedRoute({ requireAuth = true, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  if (!requireAuth) {
    return isAuthenticated ? <Navigate to={ROUTES.home} replace /> : <Outlet />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.home} replace />;
  }

  return <Outlet />;
}
