import { checkHealth } from '@/data'
import { useAsync } from '@/hooks/useAsync'
import { SectionHeader } from '@/layout/SectionHeader/SectionHeader'
import { Badge, Button, Card, DataTable } from '@/ui'
import styles from './StatusPage.module.css'
import type { HealthCardProps, StatusPageProps } from './StatusPage.types'

function HealthCard({ report }: HealthCardProps) {
  const tone = report.ok ? 'success' : report.configured ? 'danger' : 'warning'
  const status = report.ok ? 'Conectada' : report.configured ? 'Error' : 'Sin configurar'
  return (
    <Card as="article" variant="soft" className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>{report.label}</h2>
        <Badge tone={tone}>{status}</Badge>
      </div>
      <DataTable
        compact
        rows={[
          { campo: 'Variables de entorno', valor: report.configured ? 'Definidas' : 'Faltan' },
          { campo: 'Última migración', valor: report.version ?? '—' },
          { campo: 'Migraciones registradas', valor: report.migrations ?? '—' },
          { campo: 'Latencia', valor: report.latencyMs !== undefined ? `${report.latencyMs} ms` : '—' },
          { campo: 'Hora del servidor', valor: report.serverTime ?? '—' },
        ]}
        columns={[
          { key: 'campo', header: 'Comprobación' },
          { key: 'valor', header: 'Resultado' },
        ]}
      />
      {report.error && <p className={styles.error}>✕ {report.error}</p>}
    </Card>
  )
}

/** Página de diagnóstico del despliegue: build de Vercel + conexión a las dos BD de Supabase. */
export function StatusPage({ build = __BUILD_INFO__ }: StatusPageProps) {
  const { data, loading, reload } = useAsync(() => Promise.all([checkHealth('p1')]))
  const allOk = data?.every((r) => r.ok) ?? false

  return (
    <>
      <SectionHeader
        eyebrow="Diagnóstico"
        title="Estado del despliegue"
        description="Comprueba que el build de Vercel llega a la base de datos de Supabase y que las migraciones están aplicadas. El punto 2 usa PostgreSQL en el navegador y no necesita conexión."
        actions={
          <Button variant="subtle" onClick={() => void reload()} loading={loading}>
            Volver a comprobar
          </Button>
        }
      />

      <div className={styles.summary}>
        <Badge tone={loading ? 'neutral' : allOk ? 'success' : 'warning'}>
          {loading ? 'Comprobando…' : allOk ? 'Todo funciona' : 'Revisar configuración'}
        </Badge>
        <span className={styles.build}>
          Build {build.commit} · rama {build.branch} · entorno {build.environment} · {build.builtAt}
        </span>
      </div>

      <div className={styles.grid}>{data?.map((r) => <HealthCard key={r.project} report={r} />)}</div>
    </>
  )
}
