import { useEffect } from 'react';

import { useAppDispatch } from '@/hooks/redux';
import { useGetCurrentUserQuery } from '@/redux/api/authApi';
import { clearUser, setUser } from '@/redux/slices/authSlice';
import { AppRoutes } from '@/routes/AppRoutes';

export function App() {
  const dispatch = useAppDispatch();
  const { data, isError, isSuccess } = useGetCurrentUserQuery();

  useEffect(() => {
    if (isSuccess && data?.data?.user) {
      dispatch(setUser(data.data.user));
      return;
    }

    if (isError) {
      dispatch(clearUser());
    }
  }, [data, dispatch, isError, isSuccess]);

  return <AppRoutes />;
}
