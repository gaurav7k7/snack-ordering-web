// Validated data-viz palette (see dataviz skill: references/palette.md).
// Kept separate from the shadcn/Tailwind brand theme (--primary etc.) because
// chart marks need CVD-safe, contrast-checked hues — not brand colors.

export const CHART_SEQUENTIAL = {
  light: '#2a78d6',
  dark: '#3987e5',
  fillLight: 'rgba(42, 120, 214, 0.1)',
  fillDark: 'rgba(57, 135, 229, 0.12)',
};

// Reserved status colors — never reused for generic series, always paired with
// an icon + label (some fall under 3:1 contrast on a light surface by design).
export const CHART_STATUS = {
  good: '#0ca30c',
  warning: '#fab219',
  serious: '#ec835a',
  critical: '#d03b3b',
};

export const CHART_CATEGORICAL_LIGHT = [
  '#2a78d6',
  '#1baf7a',
  '#eda100',
  '#008300',
  '#4a3aa7',
  '#e34948',
  '#e87ba4',
  '#eb6834',
];

export const CHART_CATEGORICAL_DARK = [
  '#3987e5',
  '#199e70',
  '#c98500',
  '#008300',
  '#9085e9',
  '#e66767',
  '#d55181',
  '#d95926',
];

export const CHART_GRID_LIGHT = '#e1e0d9';
export const CHART_GRID_DARK = '#2c2c2a';

// Axis tick/label text — same muted tone in both themes since chart chrome
// (unlike the marks themselves) doesn't need a light/dark variant here.
export const CHART_AXIS_TEXT = '#898781';
