import { setClientForTesting } from '../clients'
import { fakeSupabase } from '../testing/fakeSupabase'
import { DataError } from './DataError'
import { Repository } from './Repository'

interface Dvd extends Record<string, unknown> {
  catalogno: string
  title: string
  genre: string
}

afterEach(() => setClientForTesting('p2', null))

describe('Repository', () => {
  it('findBy aplica filtros, orden y límite', async () => {
    const fake = fakeSupabase({ data: [{ catalogno: '207132', title: 'Casino Royale', genre: 'Action' }] })
    setClientForTesting('p2', fake.client)
    const repo = new Repository<Dvd>('p2', 'dvd')

    const rows = await repo.findBy({ genre: 'Action' }, { orderBy: { column: 'title' }, limit: 5 })

    expect(rows).toHaveLength(1)
    expect(fake.methods()).toEqual(['from', 'select', 'eq', 'order', 'limit'])
    expect(fake.calls[0].args).toEqual(['dvd'])
    expect(fake.calls[2].args).toEqual(['genre', 'Action'])
    expect(fake.calls[3].args).toEqual(['title', { ascending: true }])
  })

  it('usa IS NULL para filtros null', async () => {
    const fake = fakeSupabase({ data: [] })
    setClientForTesting('p2', fake.client)
    await new Repository<Dvd>('p2', 'dvd').findBy({ genre: null as unknown as string })
    expect(fake.methods()).toContain('is')
  })

  it('findOne devuelve null cuando no hay filas y getOne lanza not_found', async () => {
    setClientForTesting('p2', fakeSupabase({ data: [] }).client)
    const repo = new Repository<Dvd>('p2', 'dvd')
    expect(await repo.findOne({ catalogno: 'x' })).toBeNull()
    await expect(repo.getOne({ catalogno: 'x' })).rejects.toMatchObject({ code: 'not_found' })
  })

  it('convierte errores de supabase en DataError', async () => {
    setClientForTesting('p2', fakeSupabase({ error: { message: 'relation "dvdx" does not exist' } }).client)
    const err = await new Repository<Dvd>('p2', 'dvdx').findAll().catch((e: unknown) => e)
    expect(err).toBeInstanceOf(DataError)
    expect((err as DataError).message).toContain('does not exist')
  })

  it('update y remove exigen filtros', async () => {
    setClientForTesting('p2', fakeSupabase().client)
    const repo = new Repository<Dvd>('p2', 'dvd')
    await expect(repo.update({}, { title: 'x' })).rejects.toBeInstanceOf(DataError)
    await expect(repo.remove({})).rejects.toBeInstanceOf(DataError)
  })

  it('insert, update y remove encadenan select() para devolver filas', async () => {
    const fake = fakeSupabase({ data: [{ catalogno: '1', title: 'A', genre: 'B' }] })
    setClientForTesting('p2', fake.client)
    const repo = new Repository<Dvd>('p2', 'dvd')
    await repo.insert({ catalogno: '1', title: 'A', genre: 'B' })
    await repo.update({ catalogno: '1' }, { title: 'B' })
    await repo.remove({ catalogno: '1' })
    expect(fake.methods().filter((m) => m === 'select')).toHaveLength(3)
  })

  it('count usa head + count exact', async () => {
    const fake = fakeSupabase({ count: 6 })
    setClientForTesting('p2', fake.client)
    expect(await new Repository<Dvd>('p2', 'dvd').count()).toBe(6)
    expect(fake.calls[1].args).toEqual(['*', { count: 'exact', head: true }])
  })

  it('lanza not_configured si no hay variables de entorno', async () => {
    const err = await new Repository<Dvd>('p1', 'persona').findAll().catch((e: unknown) => e)
    expect(err).toMatchObject({ code: 'not_configured' })
  })
})
