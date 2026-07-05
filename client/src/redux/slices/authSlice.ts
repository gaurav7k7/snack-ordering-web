import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { User } from '@/types/auth';

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'failed';
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  status: 'idle',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.status = 'idle';
    },
    clearUser(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.status = 'idle';
    },
    setAuthLoading(state) {
      state.status = 'loading';
    },
    setAuthError(state) {
      state.status = 'failed';
    },
  },
});

export const { setUser, clearUser, setAuthLoading, setAuthError } = authSlice.actions;
export default authSlice.reducer;
