-- ═══════════════════════════════════════════════════════════════════════════
-- Punto 1 · Sistema de registro de notas UTP (modelo E-ER → relacional)
-- Fuente: docs/especificacion-punto-1.md · curso/docs/punto-1-modelado-utp.md · docs/examen/spec-punto-1-agents.md
--
-- • Especialización de PERSONA (disjunta): estudiante | docente | administrativo (columna `rol`).
-- • Especialización de ESTUDIANTE por estado (total y disjunta): normal | prueba | transicion | fuera,
--   con subtablas para los atributos propios de cada subclase.
-- • Atributos derivados (promedio integral, créditos) en la vista v_estudiante_resumen.
-- • Datos de demostración en cargar_datos_demo(); reiniciar_demo() los restaura (presentación).
-- • Sin autenticación real: la app suplanta personas; anon tiene acceso completo (decisión documentada).
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Personas ──────────────────────────────────────────────────────────────

create table public.persona (
  id_persona varchar(12) primary key,
  nombres    varchar(60)  not null,
  apellidos  varchar(60)  not null,
  email      varchar(100) not null unique,
  rol        varchar(15)  not null check (rol in ('estudiante', 'docente', 'administrativo'))
);

create table public.docente (
  id_persona varchar(12) primary key references public.persona on delete cascade,
  titulo     varchar(80) not null
);

-- ─── Estructura académica ──────────────────────────────────────────────────

create table public.programa_academico (
  cod_programa varchar(10) primary key,
  nombre       varchar(100) not null
);

create table public.plan_estudio (
  cod_plan     varchar(10) primary key,
  cod_programa varchar(10) not null references public.programa_academico,
  version      varchar(10) not null
);

create table public.asignatura (
  cod_asignatura    varchar(10) primary key,
  nombre            varchar(100) not null,
  creditos          smallint not null check (creditos between 1 and 6),
  semestre          smallint not null check (semestre between 1 and 10),
  cupo_maximo_grupo smallint not null check (cupo_maximo_grupo > 0)
);

create table public.plan_asignatura (
  cod_plan       varchar(10) references public.plan_estudio,
  cod_asignatura varchar(10) references public.asignatura,
  primary key (cod_plan, cod_asignatura)
);

-- Relación recursiva M:N de ASIGNATURA
create table public.requisito_asignatura (
  cod_asignatura varchar(10) references public.asignatura,
  cod_requisito  varchar(10) references public.asignatura,
  tipo           varchar(15) not null check (tipo in ('prerrequisito', 'simultaneidad')),
  primary key (cod_asignatura, cod_requisito),
  check (cod_asignatura <> cod_requisito)
);

-- ─── Estudiante y su especialización por estado ────────────────────────────

create table public.estudiante (
  id_persona varchar(12) primary key references public.persona on delete cascade,
  cod_plan   varchar(10) not null references public.plan_estudio,
  estado     varchar(15) not null default 'normal' check (estado in ('normal', 'prueba', 'transicion', 'fuera')),
  en_bloque  boolean not null default false
);

create table public.estudiante_prueba (
  id_persona         varchar(12) primary key references public.estudiante on delete cascade,
  periodos_en_prueba smallint not null default 1 check (periodos_en_prueba >= 0)
);

create table public.estudiante_transicion (
  id_persona    varchar(12) primary key references public.estudiante on delete cascade,
  plan_anterior varchar(10) not null
);

create table public.estudiante_fuera (
  id_persona    varchar(12) primary key references public.estudiante on delete cascade,
  motivo_retiro varchar(200) not null,
  -- "Fuera por un semestre": periodo hasta el que dura la sanción (null = fuera definitivo)
  hasta_periodo varchar(6)
);

-- Notas finales de periodos cerrados (base de prerrequisitos y promedio integral)
create table public.historial_nota (
  id_estudiante  varchar(12) references public.estudiante on delete cascade,
  cod_asignatura varchar(10) references public.asignatura,
  periodo        varchar(6) not null check (periodo ~ '^\d{4}-[12]$'),
  nota_final     numeric(3, 2) not null check (nota_final between 0 and 5),
  primary key (id_estudiante, cod_asignatura, periodo)
);

-- ─── Calendario y programación ─────────────────────────────────────────────

create table public.calendario_academico (
  periodo        varchar(6) primary key check (periodo ~ '^\d{4}-[12]$'),
  fase           varchar(15) not null default 'planeacion'
                 check (fase in ('planeacion', 'prematricula', 'pago', 'asignacion', 'ajustes', 'evaluacion', 'cierre')),
  semana_actual  smallint not null default 1 check (semana_actual between 1 and 16),
  extemporanea   boolean not null default false,
  aprobado_en    timestamptz
);

create table public.franja_horaria (
  id_franja   smallint primary key,
  dia         varchar(10) not null check (dia in ('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado')),
  hora_inicio time not null,
  hora_fin    time not null,
  check (hora_fin > hora_inicio)
);

create table public.programacion_franja (
  periodo        varchar(6)  references public.calendario_academico on delete cascade,
  cod_asignatura varchar(10) references public.asignatura,
  id_franja      smallint    references public.franja_horaria,
  max_grupos     smallint not null check (max_grupos >= 1),
  primary key (periodo, cod_asignatura, id_franja)
);

-- ─── Matrícula ─────────────────────────────────────────────────────────────

create table public.matricula_estudiante (
  periodo       varchar(6)  references public.calendario_academico on delete cascade,
  id_estudiante varchar(12) references public.estudiante on delete cascade,
  estado_pago   varchar(15) not null default 'pendiente' check (estado_pago in ('pendiente', 'pagado', 'extemporaneo')),
  retirado      boolean not null default false,
  primary key (periodo, id_estudiante)
);

create table public.grupo (
  id_grupo       serial primary key,
  periodo        varchar(6)  not null references public.calendario_academico on delete cascade,
  cod_asignatura varchar(10) not null references public.asignatura,
  num_grupo      smallint not null check (num_grupo >= 1),
  id_franja      smallint not null references public.franja_horaria,
  id_docente     varchar(12) references public.docente,
  unique (periodo, cod_asignatura, num_grupo)
);

-- Solicitud de prematrícula = inscripción del estudiante en una asignatura del periodo
create table public.solicitud_prematricula (
  id_solicitud       serial primary key,
  periodo            varchar(6)  not null references public.calendario_academico on delete cascade,
  id_estudiante      varchar(12) not null references public.estudiante on delete cascade,
  cod_asignatura     varchar(10) not null references public.asignatura,
  estado             varchar(15) not null default 'pendiente'
                     check (estado in ('pendiente', 'asignada', 'rechazada', 'retirada', 'cancelada')),
  motivo_rechazo     varchar(200),
  id_grupo           integer references public.grupo on delete set null,
  semana_cancelacion smallint check (semana_cancelacion between 1 and 16),
  unique (periodo, id_estudiante, cod_asignatura),
  check (estado <> 'rechazada' or motivo_rechazo is not null),
  check (estado <> 'asignada' or id_grupo is not null)
);

-- ─── Evaluación ────────────────────────────────────────────────────────────

create table public.forma_evaluacion (
  id_evaluacion serial primary key,
  id_grupo      integer not null references public.grupo on delete cascade,
  descripcion   varchar(60) not null,
  porcentaje    smallint not null check (porcentaje between 1 and 100),
  fecha         date
);

create table public.registro_nota (
  id_evaluacion integer references public.forma_evaluacion on delete cascade,
  id_estudiante varchar(12) references public.estudiante on delete cascade,
  valor         numeric(3, 2) not null check (valor between 0 and 5),
  primary key (id_evaluacion, id_estudiante)
);

create table public.registro_asistencia (
  id_grupo      integer references public.grupo on delete cascade,
  id_estudiante varchar(12) references public.estudiante on delete cascade,
  fecha         date not null,
  asistio       boolean not null,
  primary key (id_grupo, id_estudiante, fecha)
);

create table public.seguimiento_transicion (
  id_grupo            integer references public.grupo on delete cascade,
  id_estudiante       varchar(12) references public.estudiante on delete cascade,
  nota_comportamiento numeric(3, 2) not null check (nota_comportamiento between 0 and 5),
  nota_dedicacion     numeric(3, 2) not null check (nota_dedicacion between 0 and 5),
  primary key (id_grupo, id_estudiante)
);

-- ─── Vistas (lecturas con JOIN para la app) ────────────────────────────────

-- Atributos derivados: /promedioIntegral = Σ(nota·créditos)/Σcréditos, /créditosAprobados (nota ≥ 3.0)
create view public.v_estudiante_resumen with (security_invoker = true) as
select e.id_persona,
       p.nombres,
       p.apellidos,
       e.cod_plan,
       e.estado,
       e.en_bloque,
       coalesce(round(sum(h.nota_final * a.creditos) / nullif(sum(a.creditos), 0), 2), 0)::numeric(3, 2) as promedio_integral,
       coalesce(sum(a.creditos) filter (where h.nota_final >= 3.0), 0)::integer as creditos_aprobados,
       coalesce(sum(a.creditos), 0)::integer as creditos_cursados,
       ep.periodos_en_prueba,
       et.plan_anterior,
       ef.motivo_retiro,
       ef.hasta_periodo
  from public.estudiante e
  join public.persona p on p.id_persona = e.id_persona
  left join public.historial_nota h on h.id_estudiante = e.id_persona
  left join public.asignatura a on a.cod_asignatura = h.cod_asignatura
  left join public.estudiante_prueba ep on ep.id_persona = e.id_persona
  left join public.estudiante_transicion et on et.id_persona = e.id_persona
  left join public.estudiante_fuera ef on ef.id_persona = e.id_persona
 group by e.id_persona, p.nombres, p.apellidos, ep.periodos_en_prueba, et.plan_anterior, ef.motivo_retiro, ef.hasta_periodo;

create view public.v_grupo_detalle with (security_invoker = true) as
select g.id_grupo,
       g.periodo,
       g.cod_asignatura,
       a.nombre as asignatura,
       a.creditos,
       a.cupo_maximo_grupo as cupo,
       g.num_grupo,
       g.id_franja,
       f.dia,
       to_char(f.hora_inicio, 'HH24:MI') as hora_inicio,
       to_char(f.hora_fin, 'HH24:MI') as hora_fin,
       g.id_docente,
       nullif(trim(coalesce(pd.nombres, '') || ' ' || coalesce(pd.apellidos, '')), '') as docente,
       (select count(*) from public.solicitud_prematricula s
         where s.id_grupo = g.id_grupo and s.estado = 'asignada')::integer as inscritos
  from public.grupo g
  join public.asignatura a on a.cod_asignatura = g.cod_asignatura
  join public.franja_horaria f on f.id_franja = g.id_franja
  left join public.persona pd on pd.id_persona = g.id_docente;

create view public.v_solicitud_detalle with (security_invoker = true) as
select s.id_solicitud,
       s.periodo,
       s.id_estudiante,
       p.nombres || ' ' || p.apellidos as estudiante,
       s.cod_asignatura,
       a.nombre as asignatura,
       a.creditos,
       s.estado,
       s.motivo_rechazo,
       s.semana_cancelacion,
       s.id_grupo,
       g.num_grupo,
       f.dia,
       to_char(f.hora_inicio, 'HH24:MI') as hora_inicio,
       to_char(f.hora_fin, 'HH24:MI') as hora_fin,
       g.id_franja
  from public.solicitud_prematricula s
  join public.persona p on p.id_persona = s.id_estudiante
  join public.asignatura a on a.cod_asignatura = s.cod_asignatura
  left join public.grupo g on g.id_grupo = s.id_grupo
  left join public.franja_horaria f on f.id_franja = g.id_franja;

-- ─── Funciones ─────────────────────────────────────────────────────────────

-- Cambio de subclase atómico (especialización total y disjunta): un estudiante está en una sola subtabla.
create or replace function public.cambiar_estado(
  p_id_estudiante varchar,
  p_estado varchar,
  p_periodos_en_prueba smallint default null,
  p_plan_anterior varchar default null,
  p_motivo_retiro varchar default null,
  p_hasta_periodo varchar default null
) returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if p_estado not in ('normal', 'prueba', 'transicion', 'fuera') then
    raise exception 'Estado inválido: %', p_estado;
  end if;
  delete from estudiante_prueba where id_persona = p_id_estudiante;
  delete from estudiante_transicion where id_persona = p_id_estudiante;
  delete from estudiante_fuera where id_persona = p_id_estudiante;
  update estudiante set estado = p_estado where id_persona = p_id_estudiante;
  if not found then
    raise exception 'No existe el estudiante %', p_id_estudiante;
  end if;
  if p_estado = 'prueba' then
    insert into estudiante_prueba values (p_id_estudiante, coalesce(p_periodos_en_prueba, 1));
  elsif p_estado = 'transicion' then
    insert into estudiante_transicion values (p_id_estudiante, coalesce(p_plan_anterior, 'P2019'));
  elsif p_estado = 'fuera' then
    insert into estudiante_fuera values (p_id_estudiante, coalesce(p_motivo_retiro, 'Bajo rendimiento académico'), p_hasta_periodo);
  end if;
end;
$$;

-- Datos de demostración (también usados por reiniciar_demo)
create or replace function public.cargar_datos_demo()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  truncate seguimiento_transicion, registro_asistencia, registro_nota, forma_evaluacion,
           solicitud_prematricula, grupo, matricula_estudiante, programacion_franja, calendario_academico,
           franja_horaria, historial_nota, estudiante_fuera, estudiante_transicion, estudiante_prueba,
           estudiante, requisito_asignatura, plan_asignatura, asignatura, plan_estudio, programa_academico,
           docente, persona
  restart identity cascade;

  insert into programa_academico values ('ISC', 'Ingeniería de Sistemas y Computación');
  insert into plan_estudio values ('P2026', 'ISC', '2026');

  insert into asignatura values
    ('IS101', 'Programación I',              4, 1, 3),
    ('IS102', 'Matemáticas Discretas',       3, 1, 3),
    ('IS201', 'Programación II',             4, 2, 3),
    ('IS202', 'Estructuras de Datos',        4, 2, 3),
    ('IS301', 'Bases de Datos I',            4, 3, 2),
    ('IS302', 'Sistemas Operativos',         3, 3, 2),
    ('IS303', 'Ingeniería de Software I',    3, 3, 2),
    ('IS401', 'Bases de Datos II',           4, 4, 2),
    ('IS402', 'Redes de Computadores',       3, 4, 2),
    ('IS403', 'Ingeniería de Software II',   3, 4, 2);
  insert into plan_asignatura select 'P2026', cod_asignatura from asignatura;

  insert into requisito_asignatura values
    ('IS201', 'IS101', 'prerrequisito'),
    ('IS202', 'IS101', 'prerrequisito'),
    ('IS301', 'IS202', 'prerrequisito'),
    ('IS302', 'IS201', 'prerrequisito'),
    ('IS303', 'IS201', 'prerrequisito'),
    ('IS303', 'IS301', 'simultaneidad'),
    ('IS401', 'IS301', 'prerrequisito'),
    ('IS402', 'IS302', 'prerrequisito'),
    ('IS403', 'IS303', 'prerrequisito');

  insert into persona values
    ('A001', 'Laura',     'Ortiz',     'laura.ortiz@utp.edu.co',     'administrativo'),
    ('D001', 'Carlos',    'Restrepo',  'carlos.restrepo@utp.edu.co', 'docente'),
    ('D002', 'María',     'Gómez',     'maria.gomez@utp.edu.co',     'docente'),
    ('D003', 'Andrés',    'Ríos',      'andres.rios@utp.edu.co',     'docente'),
    ('E001', 'Ana',       'Martínez',  'ana.martinez@utp.edu.co',    'estudiante'),
    ('E002', 'Juan',      'Pérez',     'juan.perez@utp.edu.co',      'estudiante'),
    ('E003', 'Sofía',     'Ramírez',   'sofia.ramirez@utp.edu.co',   'estudiante'),
    ('E004', 'Mateo',     'Gómez',     'mateo.gomez@utp.edu.co',     'estudiante'),
    ('E005', 'Valentina', 'Cruz',      'valentina.cruz@utp.edu.co',  'estudiante'),
    ('E006', 'Samuel',    'Torres',    'samuel.torres@utp.edu.co',   'estudiante');

  insert into docente values
    ('D001', 'Magíster en Ingeniería de Software'),
    ('D002', 'Doctora en Ciencias de la Computación'),
    ('D003', 'Ingeniero de Sistemas, especialista en Redes');

  insert into estudiante values
    ('E001', 'P2026', 'normal',     true),
    ('E002', 'P2026', 'normal',     false),
    ('E003', 'P2026', 'prueba',     false),
    ('E004', 'P2026', 'transicion', false),
    ('E005', 'P2026', 'normal',     false),
    ('E006', 'P2026', 'normal',     false);
  insert into estudiante_prueba values ('E003', 1);
  insert into estudiante_transicion values ('E004', 'P2019');

  insert into historial_nota values
    ('E001', 'IS101', '2025-1', 4.2), ('E001', 'IS102', '2025-1', 3.8), ('E001', 'IS201', '2025-2', 4.0), ('E001', 'IS202', '2025-2', 4.5),
    ('E002', 'IS101', '2025-1', 3.5), ('E002', 'IS102', '2025-1', 3.2), ('E002', 'IS201', '2025-2', 3.1), ('E002', 'IS202', '2025-2', 2.5),
    ('E003', 'IS101', '2025-1', 3.0), ('E003', 'IS102', '2025-1', 2.4), ('E003', 'IS201', '2025-2', 2.8), ('E003', 'IS202', '2025-2', 3.2),
    ('E004', 'IS101', '2025-1', 4.0), ('E004', 'IS201', '2025-2', 3.6), ('E004', 'IS202', '2025-2', 3.4),
    ('E005', 'IS101', '2025-1', 4.6), ('E005', 'IS102', '2025-1', 4.1), ('E005', 'IS201', '2025-2', 4.4), ('E005', 'IS202', '2025-2', 4.0),
    ('E006', 'IS101', '2025-1', 4.0), ('E006', 'IS102', '2025-1', 3.9), ('E006', 'IS201', '2025-2', 3.6), ('E006', 'IS202', '2025-2', 4.1),
    ('E006', 'IS301', '2026-1', 4.0), ('E006', 'IS302', '2026-1', 3.9), ('E006', 'IS303', '2026-1', 3.7);

  insert into franja_horaria values
    (1, 'Lunes',     '07:00', '09:00'),
    (2, 'Lunes',     '09:00', '11:00'),
    (3, 'Martes',    '07:00', '09:00'),
    (4, 'Martes',    '09:00', '11:00'),
    (5, 'Miércoles', '07:00', '09:00'),
    (6, 'Jueves',    '14:00', '16:00');

  insert into calendario_academico (periodo, fase, semana_actual) values ('2026-2', 'planeacion', 1);

  -- Programación inicial (el admin puede cambiarla en la fase de planeación)
  insert into programacion_franja values
    ('2026-2', 'IS201', 5, 1),
    ('2026-2', 'IS202', 6, 1),
    ('2026-2', 'IS301', 1, 1),
    ('2026-2', 'IS301', 3, 1),
    ('2026-2', 'IS302', 1, 1),
    ('2026-2', 'IS303', 2, 2),
    ('2026-2', 'IS401', 4, 1),
    ('2026-2', 'IS402', 2, 1),
    ('2026-2', 'IS403', 3, 1);
end;
$$;

-- Restaura el escenario de demostración completo (botón del Admin)
create or replace function public.reiniciar_demo()
returns void
language sql
security definer
set search_path = public
as $$
  select public.cargar_datos_demo();
$$;

-- ─── Permisos (demo sin autenticación: la app suplanta personas) ───────────

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;
revoke all on function public.cargar_datos_demo() from public, anon, authenticated;
grant execute on function public.reiniciar_demo() to anon, authenticated;
grant execute on function public.cambiar_estado(varchar, varchar, smallint, varchar, varchar, varchar) to anon, authenticated;

select public.cargar_datos_demo();

insert into app.despliegue (version, descripcion)
values ('20261005000000', 'Punto 1: registro de notas (modelo E-ER, vistas, datos demo)')
on conflict (version) do nothing;
