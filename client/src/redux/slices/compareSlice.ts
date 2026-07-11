import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export const COMPARE_STORAGE_KEY = 'snackco-compare-state';
export const MAX_COMPARE_ITEMS = 4;

type CompareState = {
  productIds: string[];
};

const loadPersistedCompare = (): CompareState => {
  if (typeof window === 'undefined') return { productIds: [] };

  try {
    const persisted = window.localStorage.getItem(COMPARE_STORAGE_KEY);
    if (!persisted) return { productIds: [] };
    return JSON.parse(persisted) as CompareState;
  } catch {
    return { productIds: [] };
  }
};

const compareSlice = createSlice({
  name: 'compare',
  initialState: loadPersistedCompare(),
  reducers: {
    toggleCompare(state, action: PayloadAction<string>) {
      if (state.productIds.includes(action.payload)) {
        state.productIds = state.productIds.filter((id) => id !== action.payload);
        return;
      }
      if (state.productIds.length >= MAX_COMPARE_ITEMS) return;
      state.productIds.push(action.payload);
    },
    removeFromCompare(state, action: PayloadAction<string>) {
      state.productIds = state.productIds.filter((id) => id !== action.payload);
    },
    clearCompare(state) {
      state.productIds = [];
    },
  },
});

export const { toggleCompare, removeFromCompare, clearCompare } = compareSlice.actions;
export default compareSlice.reducer;
