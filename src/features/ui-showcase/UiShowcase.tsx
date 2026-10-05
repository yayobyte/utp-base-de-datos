import { useState } from 'react'
import {
  AvatarButton,
  Badge,
  Button,
  Card,
  Chip,
  CodeBlock,
  DataTable,
  EmptyState,
  Input,
  Modal,
  NavBar,
  Select,
  SideNav,
  Stat,
  Stepper,
  Tabs,
  TextArea,
  Toast,
} from '@/ui'
import styles from './UiShowcase.module.css'
import type { SampleRow, ShowcaseSectionProps } from './UiShowcase.types'

const SAMPLE_ROWS: SampleRow[] = [
  { staffNo: 'S1500', name: 'Tom Daniels', position: 'Manager', salary: 48000, eMail: 'tdaniels@stayhome.com' },
  { staffNo: 'S0003', name: 'Sally Adams', position: 'Assistant', salary: 30000, eMail: null },
]

function Section({ title, children }: ShowcaseSectionProps) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <div className={styles.row}>{children}</div>
    </section>
  )
}

/** Página de desarrollo (/ui) que muestra todos los elementos del kit. */
export function UiShowcase() {
  const [tab, setTab] = useState('sql')
  const [chip, setChip] = useState('normal')
  const [nav, setNav] = useState('prematricula')
  const [step, setStep] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className={styles.page}>
      <NavBar brand="Kit UI">
        <Button variant="subtle" size="sm">Enlace</Button>
        <Button size="sm">Acción</Button>
      </NavBar>

      <main className={styles.content}>
        <h1>Kit de interfaz</h1>
        <p className={styles.lead}>Elementos de src/ui construidos con los tokens de docs/examen/DESIGN.md.</p>

        <Section title="Button">
          <Button>Primario</Button>
          <Button variant="secondary">Secundario</Button>
          <Button variant="subtle">Sutil</Button>
          <Button variant="floating">Flotante</Button>
          <Button variant="large">Grande</Button>
          <Button size="sm">Pequeño</Button>
          <Button loading>Guardar</Button>
          <Button disabled>Deshabilitado</Button>
        </Section>

        <Section title="AvatarButton">
          {['Laura Ortiz', 'Carlos Restrepo', 'Ana Martínez', 'Juan Pérez'].map((n, i) => (
            <AvatarButton key={n} name={n} selected={i === 2} badge="★" />
          ))}
        </Section>

        <Section title="Chip">
          {['normal', 'prueba', 'transicion', 'fuera'].map((c) => (
            <Chip key={c} selected={chip === c} onClick={() => setChip(c)}>
              {c}
            </Chip>
          ))}
        </Section>

        <Section title="Badge">
          <Badge>Neutral</Badge>
          <Badge tone="strong">Activo</Badge>
          <Badge tone="outline">Fase: pago</Badge>
          <Badge tone="success">Pagado</Badge>
          <Badge tone="warning">Pendiente</Badge>
          <Badge tone="danger">Rechazada</Badge>
        </Section>

        <Section title="Tabs">
          <Tabs
            ariaLabel="Ejemplo"
            value={tab}
            onChange={setTab}
            items={[
              { id: 'sql', label: 'SQL' },
              { id: 'js', label: 'supabase-js' },
              { id: 'off', label: 'Deshabilitada', disabled: true },
            ]}
          />
        </Section>

        <Section title="Card">
          <Card className={styles.cardSample}>Contenido</Card>
          <Card variant="elevated" className={styles.cardSample}>Elevada</Card>
          <Card variant="soft" className={styles.cardSample}>Suave</Card>
          <Card variant="dark" className={styles.cardSample}>Oscura</Card>
        </Section>

        <Section title="Input · TextArea · Select">
          <div className={styles.form}>
            <Input label="Nombre" placeholder="Escribe un nombre" hint="Texto de ayuda" />
            <Input label="Nota" placeholder="0.0 – 5.0" error="Fuera de rango" tone="softer" />
            <Select
              label="Asignatura"
              placeholder="Selecciona…"
              options={[
                { value: 'IS644', label: 'Bases de Datos I' },
                { value: 'IS453', label: 'Estructuras de Datos' },
              ]}
            />
            <TextArea label="Consulta SQL" monospace defaultValue="SELECT * FROM dvd;" />
          </div>
        </Section>

        <Section title="DataTable">
          <DataTable
            rows={SAMPLE_ROWS}
            columns={[
              { key: 'staffNo', header: 'staffNo', highlight: true },
              { key: 'name', header: 'name' },
              { key: 'position', header: 'position' },
              { key: 'salary', header: 'salary', align: 'right' },
              { key: 'eMail', header: 'eMail' },
            ]}
            caption="Staff (ejemplo)"
          />
          <DataTable rows={[]} compact />
        </Section>

        <Section title="CodeBlock">
          <div className={styles.full}>
            <CodeBlock code={'SELECT SUM(t.cargoMes) AS ingreso_mensual\n  FROM member m\n  JOIN tipomembrecia t ON t.mTypeNo = m.mTypeNo;'} />
          </div>
        </Section>

        <Section title="Stat">
          <Stat label="Promedio integral" value="3.85" progress={3.85 / 5} helper="Escala 0.0 – 5.0" />
          <Stat label="Créditos aprobados" value={64} />
        </Section>

        <Section title="Stepper">
          <div className={styles.full}>
            <Stepper
              current={step}
              onSelect={setStep}
              steps={[
                { id: '0', label: '0FN', description: 'Tabla original' },
                { id: '1', label: '1FN', description: 'Valores atómicos' },
                { id: '2', label: '2FN', description: 'Sin dep. parciales' },
                { id: '3', label: '3FN', description: 'Sin dep. transitivas' },
              ]}
            />
          </div>
        </Section>

        <Section title="SideNav">
          <SideNav
            ariaLabel="Ejemplo"
            activeId={nav}
            onSelect={setNav}
            sections={[
              {
                title: 'Estudiante',
                items: [
                  { id: 'prematricula', label: 'Prematrícula', badge: <Badge tone="strong">Activa</Badge> },
                  { id: 'pago', label: 'Pagar matrícula', description: 'Normal o extemporánea' },
                  { id: 'cancelar', label: 'Cancelar asignaturas', disabled: true, disabledReason: 'Disponible en fase evaluación' },
                ],
              },
            ]}
          />
        </Section>

        <Section title="Toast">
          <Toast message="Consulta ejecutada en 12 ms" tone="success" onDismiss={() => undefined} />
          <Toast message="Información general" />
          <Toast message="Error: relación no existe" tone="error" />
        </Section>

        <Section title="EmptyState · Modal">
          <div className={styles.full}>
            <EmptyState
              icon="∅"
              title="Configura .env.local"
              description="Faltan las variables de Supabase para este punto."
              action={<Button onClick={() => setModalOpen(true)}>Abrir modal</Button>}
            />
          </div>
          <Modal
            open={modalOpen}
            title="¿Ejecutar DELETE?"
            onClose={() => setModalOpen(false)}
            footer={
              <>
                <Button variant="subtle" onClick={() => setModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setModalOpen(false)}>Confirmar</Button>
              </>
            }
          >
            Esta acción modifica los datos. Puedes restablecerlos después.
          </Modal>
        </Section>
      </main>
    </div>
  )
}
