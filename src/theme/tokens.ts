/**
 * Design tokens — única fuente de valores visuales.
 * Valores tomados de docs/examen/DESIGN.md (sistema de diseño de Uber).
 * applyTheme.ts los expone como variables CSS; los CSS modules solo usan var(--…).
 */

const displayFont = "'Inter', system-ui, 'Helvetica Neue', Arial, sans-serif"
const textFont = "'Inter', system-ui, 'Helvetica Neue', Arial, sans-serif"
const monoFont = "ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace"

export const colors = {
  primary: '#000000',
  onPrimary: '#ffffff',
  ink: '#000000',
  body: '#5e5e5e',
  mute: '#afafaf',
  hairlineMid: '#4b4b4b',
  canvas: '#ffffff',
  canvasSoft: '#efefef',
  canvasSofter: '#f3f3f3',
  surfacePressed: '#e2e2e2',
  link: '#0000ee',
  onDark: '#ffffff',
  blackElevated: '#282828',
  overlay: 'rgba(0, 0, 0, 0.48)',
  // Excepción documentada: estados en escala de grises (el sistema no admite acentos).
  statusSuccess: '#000000',
  statusWarning: '#4b4b4b',
  statusDanger: '#000000',
} as const

export interface TypeStyle {
  family: 'display' | 'text' | 'mono'
  size: number
  weight: number
  lineHeight: number
}

export const fonts = { display: displayFont, text: textFont, mono: monoFont } as const

export const typography = {
  displayXxl: { family: 'display', size: 52, weight: 700, lineHeight: 64 },
  displayXl: { family: 'display', size: 36, weight: 700, lineHeight: 44 },
  displayLg: { family: 'display', size: 32, weight: 700, lineHeight: 40 },
  displayMd: { family: 'display', size: 24, weight: 700, lineHeight: 32 },
  displaySm: { family: 'display', size: 20, weight: 700, lineHeight: 28 },
  bodyLg: { family: 'text', size: 18, weight: 500, lineHeight: 24 },
  bodyMd: { family: 'text', size: 16, weight: 400, lineHeight: 24 },
  bodyMdStrong: { family: 'text', size: 16, weight: 500, lineHeight: 20 },
  bodySm: { family: 'text', size: 14, weight: 400, lineHeight: 20 },
  bodySmStrong: { family: 'text', size: 14, weight: 500, lineHeight: 16 },
  caption: { family: 'text', size: 12, weight: 400, lineHeight: 20 },
  buttonLarge: { family: 'text', size: 18, weight: 500, lineHeight: 24 },
  buttonMd: { family: 'text', size: 16, weight: 500, lineHeight: 20 },
  code: { family: 'mono', size: 14, weight: 400, lineHeight: 20 },
} as const satisfies Record<string, TypeStyle>

export const spacing = {
  none: 0,
  xxs: 4,
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48,
  '5xl': 64,
} as const

export const radii = {
  none: 0,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 999,
  pillTab: 36,
  full: 9999,
} as const

export const borders = {
  hairline: 1,
  strong: 2,
  indicator: 4,
} as const

export const shadows = {
  none: 'none',
  level1: 'rgba(0, 0, 0, 0.12) 0px 4px 16px 0px',
  level2: 'rgba(0, 0, 0, 0.16) 0px 4px 16px 0px',
  level3: 'rgba(0, 0, 0, 0.16) 0px 2px 8px 0px',
} as const

export const sizes = {
  container: 1200,
  sideNav: 264,
  modal: 560,
  controlHeight: 44,
  iconButton: 40,
  avatar: 32,
} as const

export const breakpoints = {
  mobileLarge: 600,
  tablet: 768,
  desktop: 1120,
  desktopLarge: 1136,
} as const

export const motion = {
  fast: '120ms ease-out',
  base: '200ms ease-out',
} as const

export const zIndex = {
  nav: 10,
  overlay: 100,
  toast: 200,
} as const

export const theme = {
  colors,
  fonts,
  typography,
  spacing,
  radii,
  borders,
  shadows,
  sizes,
  breakpoints,
  motion,
  zIndex,
} as const

export type Theme = typeof theme
