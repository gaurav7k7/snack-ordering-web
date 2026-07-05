import { configureStore } from '@reduxjs/toolkit';

import { baseApi } from '@/redux/api/baseApi';
import { productsApi } from '@/redux/api/productsApi';
import authReducer from '@/redux/slices/authSlice';
import cartReducer from '@/redux/slices/cartSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware, productsApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
