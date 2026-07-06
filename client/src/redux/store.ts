import { configureStore, type Middleware } from '@reduxjs/toolkit';

import { baseApi } from '@/redux/api/baseApi';
import { productsApi } from '@/redux/api/productsApi';
import authReducer from '@/redux/slices/authSlice';
import cartReducer, { CART_STORAGE_KEY } from '@/redux/slices/cartSlice';

const persistCartMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(store.getState().cart));
  }

  return result;
};

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      baseApi.middleware,
      productsApi.middleware,
      persistCartMiddleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
