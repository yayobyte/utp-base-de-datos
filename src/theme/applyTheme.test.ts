import { themeToCssVars } from './applyTheme'

describe('themeToCssVars', () => {
  const vars = themeToCssVars()

  it('expone colores, espaciado, bordes y sombras de DESIGN.md', () => {
    expect(vars['--color-primary']).toBe('#000000')
    expect(vars['--color-canvas-soft']).toBe('#efefef')
    expect(vars['--space-3xl']).toBe('32px')
    expect(vars['--radius-pill']).toBe('999px')
    expect(vars['--radius-pill-tab']).toBe('36px')
    expect(vars['--shadow-level2']).toBe('rgba(0, 0, 0, 0.16) 0px 4px 16px 0px')
  })

  it('genera el shorthand de tipografía', () => {
    expect(vars['--type-display-xxl']).toMatch(/^700 52px\/64px /)
    expect(vars['--type-body-md']).toMatch(/^400 16px\/24px /)
  })
})
