import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// Full-width bars that dock to the bottom of the viewport (compare tray,
// the sticky "Add to cart" bar) report their own rendered height here so
// that other fixed-position UI — the Back-to-top and Live Chat buttons,
// and each other — can reserve space instead of overlapping them. Keyed by
// name rather than a single number so more than one bar can be visible at
// once (e.g. the add-to-cart bar while items are also queued to compare).
export type FloatingBarName = 'compareBar' | 'addToCartBar';

type FloatingBarsState = {
  heights: Record<FloatingBarName, number>;
};

const initialState: FloatingBarsState = {
  heights: { compareBar: 0, addToCartBar: 0 },
};

const floatingBarsSlice = createSlice({
  name: 'floatingBars',
  initialState,
  reducers: {
    setFloatingBarHeight(state, action: PayloadAction<{ name: FloatingBarName; height: number }>) {
      state.heights[action.payload.name] = action.payload.height;
    },
  },
});

export const { setFloatingBarHeight } = floatingBarsSlice.actions;
export default floatingBarsSlice.reducer;
