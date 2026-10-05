import { useAsync } from '@/hooks/useAsync'
import { useRunner } from '@/hooks/useRunner'
import { franjaTexto } from '@/domain/punto1/horario'
import { estudianteService } from '@/services/punto1'
import { Badge, Button, DataTable, Select } from '@/ui'
import { ActionShell } from '../../ActionShell/ActionShell'
import { usePunto1 } from '../../context'
import styles from './EstAjustes.module.css'

/** Ajustes de matrícula: adicionar, cambiar de grupo o retirar asignaturas (sin cruces y con cupo). */
export function EstAjustes() {
  const { persona } = usePunto1()
  const { data, loading, error, reload } = useAsync(() => estudianteService.opcionesAjuste(persona.id_persona), [persona.id_persona])
  const { run, busy, notice, clearNotice } = useRunner(reload)
  const asignadas = (data?.mias ?? []).filter((s) => s.estado === 'asignada')
  const tengo = new Set(asignadas.map((s) => s.cod_asignatura))
  const paraAdicionar = (data?.grupos ?? []).filter((g) => !tengo.has(g.cod_asignatura))

  return (
    <ActionShell
      title="Ajustes de matrícula"
      description="Revisa tu horario y ajústalo: los grupos deben tener cupo y no cruzarse con tus otras asignaturas."
      loading={loading && !data}
      error={error?.message}
      notice={notice}
      onDismissNotice={clearNotice}
    >
      <h3 className={styles.subtitle}>Mis asignaturas</h3>
      <DataTable
        compact
        rows={asignadas}
        emptyMessage="No tienes asignaturas asignadas"
        columns={[
          { key: 'asignatura', header: 'Asignatura', render: (s) => `${s.cod_asignatura} · ${s.asignatura}` },
          { key: 'grupo', header: 'Grupo', render: (s) => `G${s.num_grupo} · ${franjaTexto(s)}` },
          {
            key: 'cambiar',
            header: 'Cambiar de grupo',
            render: (s) => {
              const otros = (data?.grupos ?? []).filter((g) => g.cod_asignatura === s.cod_asignatura && g.id_grupo !== s.id_grupo)
              return otros.length ? (
                <Select
                  aria-label={`Cambiar grupo de ${s.asignatura}`}
                  placeholder="Elegir…"
                  disabled={busy}
                  value=""
                  options={otros.map((g) => ({ value: String(g.id_grupo), label: `G${g.num_grupo} · ${franjaTexto(g)} (${g.inscritos}/${g.cupo})`, disabled: !data!.disponible(g, s.id_franja) }))}
                  onChange={(e) => void run(() => estudianteService.cambiarGrupo(persona.id_persona, s.id_solicitud, Number(e.target.value)), 'Grupo cambiado')}
                />
              ) : (
                <span className={styles.muted}>Único grupo</span>
              )
            },
          },
          {
            key: 'retirar',
            header: '',
            render: (s) => (
              <Button size="sm" variant="subtle" disabled={busy} onClick={() => void run(() => estudianteService.retirar(persona.id_persona, s.id_solicitud), 'Asignatura retirada')}>
                Retirar
              </Button>
            ),
          },
        ]}
      />
      <h3 className={styles.subtitle}>Adicionar</h3>
      <DataTable
        compact
        rows={paraAdicionar}
        emptyMessage="No hay otros grupos abiertos"
        columns={[
          { key: 'asignatura', header: 'Asignatura', render: (g) => `${g.cod_asignatura} · ${g.asignatura}` },
          { key: 'grupo', header: 'Grupo', render: (g) => `G${g.num_grupo} · ${franjaTexto(g)}` },
          { key: 'cupo', header: 'Cupo', render: (g) => <Badge tone={Number(g.inscritos) < Number(g.cupo) ? 'neutral' : 'danger'}>{`${g.inscritos}/${g.cupo}`}</Badge> },
          {
            key: 'adicionar',
            header: '',
            render: (g) => (
              <Button size="sm" disabled={busy || !data!.disponible(g)} onClick={() => void run(() => estudianteService.adicionar(persona.id_persona, g.id_grupo), 'Asignatura adicionada')}>
                Adicionar
              </Button>
            ),
          },
        ]}
      />
    </ActionShell>
  )
}
