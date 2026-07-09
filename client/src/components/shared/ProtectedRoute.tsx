import { Navigate, Outlet } from 'react-router-dom';

import { useAppSelector } from '@/hooks/redux';
import { ROUTES } from '@/constants/routes';
import { useGetCurrentUserQuery } from '@/redux/api/authApi';

type ProtectedRouteProps = {
  requireAuth?: boolean;
  allowedRoles?: string[];
};

export function ProtectedRoute({ requireAuth = true, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  // App.tsx already fires this on mount to restore the session from the httpOnly
  // cookie; RTK Query dedupes this against that same cache entry. Without waiting
  // on it here, a hard reload briefly sees the pre-hydration isAuthenticated=false
  // and bounces an already-logged-in user to /login.
  const { isLoading, isUninitialized } = useGetCurrentUserQuery();

  if (!requireAuth) {
    return isAuthenticated ? <Navigate to={ROUTES.home} replace /> : <Outlet />;
  }

  if ((isLoading || isUninitialized) && !isAuthenticated) {
    return (
      <div className="grid min-h-[50vh] place-items-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.home} replace />;
  }

  return <Outlet />;
}
