import { theme, type Theme } from './tokens'

const kebab = (key: string) => key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
const px = (value: number) => `${value}px`

/** Convierte los tokens en variables CSS (--color-*, --space-*, --radius-*, --shadow-*, --type-*, …). */
export function themeToCssVars(t: Theme = theme): Record<string, string> {
  const vars: Record<string, string> = {}

  for (const [k, v] of Object.entries(t.colors)) vars[`--color-${kebab(k)}`] = v
  for (const [k, v] of Object.entries(t.fonts)) vars[`--font-${k}`] = v
  for (const [k, v] of Object.entries(t.spacing)) vars[`--space-${k}`] = px(v)
  for (const [k, v] of Object.entries(t.radii)) vars[`--radius-${kebab(k)}`] = px(v)
  for (const [k, v] of Object.entries(t.borders)) vars[`--border-${k}`] = px(v)
  for (const [k, v] of Object.entries(t.shadows)) vars[`--shadow-${kebab(k)}`] = v
  for (const [k, v] of Object.entries(t.sizes)) vars[`--size-${kebab(k)}`] = px(v)
  for (const [k, v] of Object.entries(t.motion)) vars[`--motion-${k}`] = v
  for (const [k, v] of Object.entries(t.zIndex)) vars[`--z-${k}`] = String(v)

  for (const [k, s] of Object.entries(t.typography)) {
    const name = kebab(k)
    vars[`--type-${name}`] = `${s.weight} ${px(s.size)}/${px(s.lineHeight)} ${t.fonts[s.family]}`
    vars[`--type-${name}-size`] = px(s.size)
  }

  return vars
}

/** Escribe las variables en :root. Se llama una vez en main.tsx. */
export function applyTheme(root: HTMLElement = document.documentElement, t: Theme = theme) {
  for (const [name, value] of Object.entries(themeToCssVars(t))) root.style.setProperty(name, value)
}
