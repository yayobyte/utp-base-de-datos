import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { accionesDe, accionPorId, disponibilidad } from '@/domain/punto1/permisos'
import { SupabaseGuard } from '@/features/shared/SupabaseGuard/SupabaseGuard'
import { useAsync } from '@/hooks/useAsync'
import { useProjectStatus } from '@/hooks/useProjectStatus'
import { EXAM_POINTS } from '@/layout/navigation'
import { SectionHeader } from '@/layout/SectionHeader/SectionHeader'
import { calendarioActual, personas as cargarPersonas, reiniciarDemo } from '@/services/punto1'
import { useImpersonationStore } from '@/state/impersonationStore'
import { Button, Card, EmptyState, Modal, Toast } from '@/ui'
import { useRunner } from '@/hooks/useRunner'
import { ACTION_PAGES } from '../actionPages'
import { Punto1Context } from '../context'
import { PersonaSwitcher } from '../PersonaSwitcher/PersonaSwitcher'
import { PhaseBanner } from '../PhaseBanner/PhaseBanner'
import { RoleNav } from '../RoleNav/RoleNav'
import styles from './Punto1Layout.module.css'

const POINT = EXAM_POINTS.find((p) => p.id === 'punto-1')!
const DESCRIPTION =
  'Sistema de registro de notas a partir del modelo E-ER. Elige a quién suplantar y recorre el calendario académico: cada persona solo ve lo que puede hacer en la fase actual.'

function Punto1Content() {
  const navigate = useNavigate()
  const accionId = useParams()['*'] ?? ''
  const { personaId, impersonate } = useImpersonationStore()
  const ctx = useAsync(() => Promise.all([calendarioActual(), cargarPersonas()]))
  const [calendario, personas] = ctx.data ?? []
  const persona = personas?.find((p) => p.id_persona === personaId)
  const refresh = useCallback(() => ctx.reload(), [ctx])

  // Acción por defecto del rol (la primera) si la URL no tiene una válida para esta persona.
  const accion = accionPorId(accionId)
  useEffect(() => {
    if (persona && (!accion || accion.rol !== persona.rol)) navigate(`/punto-1/${accionesDe(persona.rol)[0].id}`, { replace: true })
  }, [persona, accion, navigate])

  const value = useMemo(() => (calendario && persona && personas ? { calendario, persona, personas, refresh } : null), [calendario, persona, personas, refresh])

  if (ctx.error) return <EmptyState icon="✕" title="No se pudo cargar el punto 1" description={ctx.error.message} />
  if (!calendario || !personas) return <p className={styles.muted}>Cargando sistema…</p>

  const Page = accion && persona && accion.rol === persona.rol ? ACTION_PAGES[accion.id] : undefined
  const disp = accion && disponibilidad(accion, calendario)

  return (
    <div className={styles.layout}>
      <PersonaSwitcher personas={personas} activeId={personaId} onSelect={impersonate} />
      <PhaseBanner calendario={calendario} />

      {!value ? (
        <EmptyState icon="👤" title="Elige a quién suplantar" description="Selecciona una persona arriba para ver las acciones que puede realizar." />
      ) : (
        <Punto1Context.Provider value={value}>
          <div className={styles.body}>
            <aside className={styles.nav}>
              <RoleNav rol={value.persona.rol} calendario={calendario} activeId={accion?.id} onSelect={(id) => navigate(`/punto-1/${id}`)} />
            </aside>
            <Card variant="content" className={styles.content}>
              {Page && disp?.ok && <Page key={`${value.persona.id_persona}-${accion!.id}`} />}
              {Page && disp && !disp.ok && <EmptyState icon="⏳" title={accion!.label} description={`${disp.motivo}. Fase actual: el Admin la avanza desde «Calendario».`} />}
            </Card>
          </div>
        </Punto1Context.Provider>
      )}
    </div>
  )
}

/** Punto 1: sistema de registro de notas con suplantación de personas (BD #1). */
export function Punto1Layout() {
  const { configured } = useProjectStatus('p1')
  const [version, setVersion] = useState(0)
  const [confirm, setConfirm] = useState(false)
  // Tras restaurar se vuelve a montar el contenido: todo se recarga desde la BD.
  const { run, busy, notice, clearNotice } = useRunner(() => setVersion((v) => v + 1))

  return (
    <>
      <SectionHeader
        eyebrow={`Punto ${POINT.number} · ${POINT.shortLabel}`}
        title={POINT.title}
        description={DESCRIPTION}
        actions={
          configured && (
            <Button variant="secondary" loading={busy} onClick={() => setConfirm(true)}>
              ↺ Restaurar
            </Button>
          )
        }
      />
      {notice && (
        <div className={styles.notice}>
          <Toast message={notice.message} tone={notice.tone} onDismiss={clearNotice} />
        </div>
      )}
      {configured ? <Punto1Content key={version} /> : <SupabaseGuard project="p1">{null}</SupabaseGuard>}
      <Modal
        open={confirm}
        title="¿Restaurar la demostración?"
        onClose={() => setConfirm(false)}
        footer={
          <>
            <Button variant="subtle" onClick={() => setConfirm(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setConfirm(false)
                void run(() => reiniciarDemo(), 'Demostración restaurada: periodo en planeación y datos iniciales')
              }}
            >
              Restaurar
            </Button>
          </>
        }
      >
        Se borran prematrículas, pagos, grupos, notas y cambios de estado, y se vuelve a los datos iniciales (fase de planeación).
      </Modal>
    </>
  )
}
