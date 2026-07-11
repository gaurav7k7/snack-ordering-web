import { useEffect } from 'react';

import MaintenancePage from '@/pages/shared/MaintenancePage';
import { useAppDispatch } from '@/hooks/redux';
import { useGetCurrentUserQuery } from '@/redux/api/authApi';
import { useGetHealthQuery } from '@/redux/api/healthApi';
import { clearUser, setUser } from '@/redux/slices/authSlice';
import { AppRoutes } from '@/routes/AppRoutes';

export function App() {
  const dispatch = useAppDispatch();
  const { data, isError, isSuccess } = useGetCurrentUserQuery();
  const { data: healthData } = useGetHealthQuery();

  useEffect(() => {
    if (isSuccess && data?.data?.user) {
      dispatch(setUser(data.data.user));
      return;
    }

    if (isError) {
      dispatch(clearUser());
    }
  }, [data, dispatch, isError, isSuccess]);

  if (healthData?.data?.maintenance) {
    return <MaintenancePage />;
  }

  return <AppRoutes />;
}
