import { getClient } from './clients'
import { DataError } from './orm/DataError'
import type { ProjectId } from './orm/types'

/** Llama a una función de base de datos (RPC) del proyecto y devuelve su resultado. */
export async function callRpc<T = unknown>(project: ProjectId, fn: string, params: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await getClient(project).rpc(fn, params)
  if (error) throw DataError.from(error)
  return data as T
}
