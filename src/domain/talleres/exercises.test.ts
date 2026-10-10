import { TALLERES } from './catalog'
import { parseExercises } from './exercises'

describe('parseExercises', () => {
  it('separa los bloques por cabecera, con título, notas y SQL', () => {
    const src = [
      '-- comentario inicial que se ignora',
      '-- =====',
      '-- a. Primero',
      '--   una nota',
      '-- =====',
      'select 1;',
      '',
      '-- =====',
      '-- b. Segundo',
      '-- =====',
      'select 2;',
      'select 3;',
    ].join('\n')
    expect(parseExercises(src)).toEqual([
      { id: 'ej-1', title: 'a. Primero', notes: ['una nota'], sql: 'select 1;' },
      { id: 'ej-2', title: 'b. Segundo', notes: [], sql: 'select 2;\nselect 3;' },
    ])
  })

  it('lee los ejercicios del taller JOINs (a–n y las vistas)', () => {
    const titles = TALLERES.find((t) => t.id === 'joins')!.exercises.map((e) => e.title.split('.')[0])
    expect(titles).toEqual(['a', 'b', 'c', 'd', 'e', 'l (parte 1)', 'f', 'g', 'h', 'i', 'j', 'k', 'm', 'n'])
  })
})
