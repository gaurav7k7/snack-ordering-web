import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { CartItem } from '@/types/cart';

type CartState = {
  items: CartItem[];
};

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<CartItem>) {
      const existingItem = state.items.find((item) => item.productId === action.payload.productId);

      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
        return;
      }

      state.items.push(action.payload);
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

export const { addItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
