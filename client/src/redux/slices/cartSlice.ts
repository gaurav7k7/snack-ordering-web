import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { CartItem, CartState } from '@/types/cart';

export const CART_STORAGE_KEY = 'snackco-cart-state';

const loadPersistedCart = (): CartState => {
  if (typeof window === 'undefined') {
    return {
      items: [],
      savedItems: [],
      couponCode: '',
    };
  }

  try {
    const persisted = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!persisted) {
      return {
        items: [],
        savedItems: [],
        couponCode: '',
      };
    }

    return JSON.parse(persisted) as CartState;
  } catch {
    return {
      items: [],
      savedItems: [],
      couponCode: '',
    };
  }
};

const initialState: CartState = loadPersistedCart();

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
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.productId !== action.payload);
    },
    updateQuantity(state, action: PayloadAction<{ productId: string; quantity: number }>) {
      const targetItem = state.items.find((item) => item.productId === action.payload.productId);
      if (!targetItem) return;

      if (action.payload.quantity <= 0) {
        state.items = state.items.filter((item) => item.productId !== action.payload.productId);
        return;
      }

      targetItem.quantity = action.payload.quantity;
    },
    moveToSaved(state, action: PayloadAction<string>) {
      const targetItem = state.items.find((item) => item.productId === action.payload);
      if (!targetItem) return;

      state.items = state.items.filter((item) => item.productId !== action.payload);
      const existingSaved = state.savedItems.find((item) => item.productId === action.payload);
      if (!existingSaved) {
        state.savedItems.push({ ...targetItem });
      }
    },
    moveBackToCart(state, action: PayloadAction<string>) {
      const targetItem = state.savedItems.find((item) => item.productId === action.payload);
      if (!targetItem) return;

      state.savedItems = state.savedItems.filter((item) => item.productId !== action.payload);
      const existingCartItem = state.items.find((item) => item.productId === action.payload);
      if (existingCartItem) {
        existingCartItem.quantity += 1;
        return;
      }

      state.items.push({ ...targetItem, quantity: 1 });
    },
    removeSavedItem(state, action: PayloadAction<string>) {
      state.savedItems = state.savedItems.filter((item) => item.productId !== action.payload);
    },
    setCouponCode(state, action: PayloadAction<string>) {
      state.couponCode = action.payload;
    },
    clearCart(state) {
      state.items = [];
      state.savedItems = [];
      state.couponCode = '';
    },
  },
});

export const {
  addItem,
  removeItem,
  updateQuantity,
  moveToSaved,
  moveBackToCart,
  removeSavedItem,
  setCouponCode,
  clearCart,
} = cartSlice.actions;
export default cartSlice.reducer;
