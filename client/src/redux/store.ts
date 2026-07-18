import { configureStore, type Middleware } from '@reduxjs/toolkit';

import { baseApi } from '@/redux/api/baseApi';
import authReducer from '@/redux/slices/authSlice';
import cartReducer, { CART_STORAGE_KEY } from '@/redux/slices/cartSlice';
import compareReducer, { COMPARE_STORAGE_KEY } from '@/redux/slices/compareSlice';
import floatingBarsReducer from '@/redux/slices/floatingBarsSlice';

const persistCartMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(store.getState().cart));
  }

  return result;
};

const persistCompareMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(store.getState().compare));
  }

  return result;
};

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    compare: compareReducer,
    auth: authReducer,
    floatingBars: floatingBarsReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware, persistCartMiddleware, persistCompareMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
