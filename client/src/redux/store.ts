import { configureStore } from '@reduxjs/toolkit';

import { baseApi } from '@/redux/api/baseApi';
import cartReducer from '@/redux/slices/cartSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
