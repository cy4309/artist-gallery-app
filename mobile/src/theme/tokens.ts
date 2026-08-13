/**
 * CYC ZINE brand tokens — aligned with web Tailwind theme
 * (primary #000, primaryGray, primaryBlue; dark default look)
 */
export const colors = {
  bg: '#000000',
  surface: '#111111',
  surfaceElevated: '#1a1a1a',
  border: '#d1d5db',
  borderMuted: '#333333',
  text: '#ffffff',
  textMuted: '#9ca3af',
  textDim: '#6b7280',
  accent: '#3b82f6',
  accentSoft: '#93c5fd',
  danger: '#ef4444',
  placeholder: '#374151',
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  md: 12,
  lg: 16,
  xl: 20,
  card: 16,
} as const;

export const type = {
  display: 28,
  title: 22,
  heading: 18,
  body: 15,
  meta: 13,
  chip: 14,
  caption: 12,
} as const;
