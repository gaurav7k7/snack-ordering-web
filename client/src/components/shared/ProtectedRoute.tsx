import { Navigate, Outlet } from 'react-router-dom';

import { PageLoader } from '@/components/shared/PageLoader';
import { useAppSelector } from '@/hooks/redux';
import { ROUTES } from '@/constants/routes';
import { useGetCurrentUserQuery } from '@/redux/api/authApi';

type ProtectedRouteProps = {
  requireAuth?: boolean;
  allowedRoles?: string[];
};

export function ProtectedRoute({ requireAuth = true, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  // App.tsx also calls this to restore the session from the httpOnly cookie and
  // sync it into `state.auth` via a useEffect — but that sync lands one render
  // after the query itself resolves. Reading only `data`/`isSuccess` here (not
  // relying on `state.auth` to have caught up yet) closes that race: without it,
  // there's a render where isLoading has gone false but state.auth is still
  // stale, and this component would incorrectly redirect an authenticated user
  // to /login.
  const { data, isLoading, isUninitialized } = useGetCurrentUserQuery();
  const queryUser = data?.data?.user;
  const resolvedIsAuthenticated = isAuthenticated || Boolean(queryUser);
  const resolvedRole = user?.role ?? queryUser?.role;

  if (!requireAuth) {
    return resolvedIsAuthenticated ? <Navigate to={ROUTES.home} replace /> : <Outlet />;
  }

  if ((isLoading || isUninitialized) && !resolvedIsAuthenticated) {
    return <PageLoader />;
  }

  if (!resolvedIsAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  if (allowedRoles && resolvedRole && !allowedRoles.includes(resolvedRole)) {
    return <Navigate to={ROUTES.home} replace />;
  }

  return <Outlet />;
}
