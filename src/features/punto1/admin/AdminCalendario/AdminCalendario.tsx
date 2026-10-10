import { useState } from 'react'
import { periodoSiguiente } from '@/domain/punto1/cierre'
import { FASES, faseLabel, siguienteFase } from '@/domain/punto1/fases'
import { useRunner } from '@/hooks/useRunner'
import { adminService } from '@/services/punto1'
import { Button, Modal, Select } from '@/ui'
import { ActionShell } from '../../ActionShell/ActionShell'
import { usePunto1 } from '../../context'
import { REINICIO_LABEL, REINICIO_TITULO, ReinicioAdvertencia } from '../../reinicio'
import styles from './AdminCalendario.module.css'

const SEMANAS = Array.from({ length: 16 }, (_, i) => ({ value: String(i + 1), label: `Semana ${i + 1}` }))

/** Calendario académico: aprobación del Consejo, avance de fases, semana simulada y matrícula extemporánea. */
export function AdminCalendario() {
  const { calendario, refresh } = usePunto1()
  const { run, busy, notice, clearNotice } = useRunner(refresh)
  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmNext, setConfirmNext] = useState(false)
  const nuevoPeriodo = periodoSiguiente(calendario.periodo)
  const next = siguienteFase(calendario.fase)

  return (
    <ActionShell
      title="Calendario académico"
      description="El Consejo Académico aprueba el calendario; Registro avanza las fases del proceso."
      notice={notice}
      onDismissNotice={clearNotice}
    >
      <ol className={styles.fases}>
        {FASES.map((f) => (
          <li key={f.id} className={f.id === calendario.fase ? styles.current : undefined}>
            <strong>{f.label}</strong> — {f.descripcion}
          </li>
        ))}
      </ol>

      <div className={styles.actions}>
        {!calendario.aprobado_en && (
          <Button variant="secondary" disabled={busy} onClick={() => void run(() => adminService.aprobarCalendario(), 'Calendario aprobado por el Consejo Académico')}>
            Aprobar calendario
          </Button>
        )}
        {next && (
          <Button disabled={busy} onClick={() => void run(() => adminService.avanzarFase(), (f) => `Fase actual: ${faseLabel(f)}`)}>
            Avanzar a {faseLabel(next)}
          </Button>
        )}
        {calendario.fase === 'cierre' && (
          <Button disabled={busy} onClick={() => setConfirmNext(true)}>
            Abrir semestre {nuevoPeriodo}
          </Button>
        )}
      </div>

      <div className={styles.row}>
        <Select
          label="Semana simulada (regla de cancelación)"
          options={SEMANAS}
          value={String(calendario.semana_actual)}
          onChange={(e) => void run(() => adminService.fijarSemana(Number(e.target.value)), `Semana ${e.target.value}`)}
        />
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={calendario.extemporanea}
            onChange={(e) =>
              void run(() => adminService.habilitarExtemporanea(e.target.checked), e.target.checked ? 'Matrícula extemporánea habilitada' : 'Matrícula extemporánea cerrada')
            }
          />
          Matrícula extemporánea habilitada
        </label>
      </div>

      <div className={styles.danger}>
        <p>Para repetir la presentación desde cero, vuelve al escenario inicial (se pierden todos los semestres).</p>
        <Button variant="subtle" onClick={() => setConfirmReset(true)} disabled={busy}>
          {REINICIO_LABEL}
        </Button>
      </div>

      <Modal
        open={confirmReset}
        title={REINICIO_TITULO}
        onClose={() => setConfirmReset(false)}
        footer={
          <>
            <Button variant="subtle" onClick={() => setConfirmReset(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setConfirmReset(false)
                void run(() => adminService.reiniciarDemo(), 'Base de datos reiniciada')
              }}
            >
              Sí, reiniciar
            </Button>
          </>
        }
      >
        <ReinicioAdvertencia />
      </Modal>

      <Modal
        open={confirmNext}
        title={`¿Abrir el semestre ${nuevoPeriodo}?`}
        onClose={() => setConfirmNext(false)}
        footer={
          <>
            <Button variant="subtle" onClick={() => setConfirmNext(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setConfirmNext(false)
                void run(() => adminService.abrirSiguientePeriodo(), (p) => `Semestre ${p} abierto en planeación`)
              }}
            >
              Abrir semestre
            </Button>
          </>
        }
      >
        <p>
          <strong>Se conserva:</strong> el historial de notas de {calendario.periodo} y anteriores, los estados de los estudiantes
          (prueba, transición, fuera) y los planes de estudio. Las asignaturas aprobadas cuentan como prerrequisitos.
        </p>
        <p>
          <strong>Empieza vacío:</strong> la programación de horarios, las prematrículas, los pagos, los grupos y las notas del
          nuevo periodo. El calendario de {nuevoPeriodo} debe volver a aprobarse.
        </p>
      </Modal>
    </ActionShell>
  )
}
