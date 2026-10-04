import { useNavigate } from 'react-router-dom'
import { Button, EmptyState } from '@/ui'
import type { NotFoundProps } from './NotFound.types'

export function NotFound({ homePath = '/' }: NotFoundProps) {
  const navigate = useNavigate()
  return (
    <EmptyState
      icon="404"
      title="Página no encontrada"
      description="La ruta no existe. Vuelve al inicio para elegir un punto del examen."
      action={<Button onClick={() => navigate(homePath)}>Ir al inicio</Button>}
    />
  )
}
