import { useState } from 'react'
import { FASES, faseLabel, siguienteFase } from '@/domain/punto1/fases'
import { useRunner } from '@/hooks/useRunner'
import { adminService } from '@/services/punto1'
import { Button, Modal, Select } from '@/ui'
import { ActionShell } from '../../ActionShell/ActionShell'
import { usePunto1 } from '../../context'
import styles from './AdminCalendario.module.css'

const SEMANAS = Array.from({ length: 16 }, (_, i) => ({ value: String(i + 1), label: `Semana ${i + 1}` }))

/** Calendario académico: aprobación del Consejo, avance de fases, semana simulada y matrícula extemporánea. */
export function AdminCalendario() {
  const { calendario, refresh } = usePunto1()
  const { run, busy, notice, clearNotice } = useRunner(refresh)
  const [confirmReset, setConfirmReset] = useState(false)
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
        <p>Para repetir la presentación, vuelve al escenario inicial (planeación, sin prematrículas).</p>
        <Button variant="subtle" onClick={() => setConfirmReset(true)} disabled={busy}>
          Reiniciar demostración
        </Button>
      </div>

      <Modal
        open={confirmReset}
        title="¿Reiniciar la demostración?"
        onClose={() => setConfirmReset(false)}
        footer={
          <>
            <Button variant="subtle" onClick={() => setConfirmReset(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setConfirmReset(false)
                void run(() => adminService.reiniciarDemo(), 'Demostración reiniciada')
              }}
            >
              Reiniciar
            </Button>
          </>
        }
      >
        Se borran prematrículas, pagos, grupos, notas y cambios de estado del periodo, y se restauran los datos iniciales.
      </Modal>
    </ActionShell>
  )
}
