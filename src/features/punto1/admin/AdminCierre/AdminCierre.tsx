import { useState } from 'react'
import { useRunner } from '@/hooks/useRunner'
import { adminService } from '@/services/punto1'
import { Badge, Button, DataTable } from '@/ui'
import { ActionShell } from '../../ActionShell/ActionShell'
import { usePunto1 } from '../../context'

type Cambio = Awaited<ReturnType<typeof adminService.cerrarSemestre>>[number]

/** Cierre: notas finales al historial, promedio integral, créditos y nuevo estado de cada estudiante. */
export function AdminCierre() {
  const { refresh } = usePunto1()
  const { run, busy, notice, clearNotice } = useRunner(refresh)
  const [cambios, setCambios] = useState<Cambio[]>()

  return (
    <ActionShell
      title="Cierre del semestre"
      description="Se registra la nota final de cada asignatura, se recalculan promedio integral y créditos, y se aplica la matriz de estados (prueba, fuera, normal)."
      notice={notice}
      onDismissNotice={clearNotice}
      actions={
        <Button
          disabled={busy || Boolean(cambios)}
          onClick={() =>
            void run(
              async () => {
                const r = await adminService.cerrarSemestre()
                setCambios(r)
                return r
              },
              (r) => `Semestre cerrado: ${r.length} estudiantes procesados`,
            )
          }
        >
          Cerrar semestre
        </Button>
      }
    >
      <DataTable
        rows={cambios ?? []}
        emptyMessage="Ejecuta el cierre para ver los resultados"
        columns={[
          { key: 'nombre', header: 'Estudiante' },
          { key: 'promedio', header: 'Promedio', align: 'right', render: (c) => c.promedio.toFixed(2) },
          { key: 'creditos', header: 'Créditos', align: 'right' },
          {
            key: 'estado',
            header: 'Estado',
            render: (c) => (
              <>
                {c.antes} → <Badge tone={c.despues === 'normal' ? 'success' : c.despues === 'fuera' ? 'danger' : 'warning'}>{c.despues}</Badge>
              </>
            ),
          },
          { key: 'razon', header: 'Regla aplicada' },
        ]}
      />
    </ActionShell>
  )
}
