import { useProjectStatus } from '@/hooks/useProjectStatus'
import { CodeBlock, EmptyState } from '@/ui'
import styles from './SupabaseGuard.module.css'
import type { SupabaseGuardProps } from './SupabaseGuard.types'

/** Muestra un aviso en lugar del contenido cuando faltan las credenciales de Supabase del proyecto. */
export function SupabaseGuard({ project, children }: SupabaseGuardProps) {
  const { configured, label, missing } = useProjectStatus(project)
  if (configured) return <>{children}</>

  return (
    <div className={styles.guard}>
      <EmptyState
        icon="⚙"
        title="Configura .env.local"
        description={`Faltan las credenciales de ${label}. Copia .env.example a .env.local, completa estas variables y reinicia npm run dev.`}
      />
      <CodeBlock language="text" title=".env.local" code={missing.map((v) => `${v}=`).join('\n')} />
    </div>
  )
}
