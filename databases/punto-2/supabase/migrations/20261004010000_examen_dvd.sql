-- ═══════════════════════════════════════════════════════════════════════════
-- Punto 2 · Base de datos StayHome (películas, actores, alquileres, miembros)
-- Fuente: docs/examen/Imagen1.jpg e imagen2.jpg · Respuestas: docs/especificacion-punto-2.md
--
-- • Esquema `examen`: las 11 tablas del enunciado, SIN llaves foráneas (el esquema
--   del examen no está relacionado ni normalizado).
-- • Esquema `baseline`: copia intacta para restablecer los datos (reset_data).
-- • El esquema `public` (tablas DreamHome de clase) NO se modifica.
-- • Los datos van en la migración: Supabase no aplica seed.sql en producción.
-- ═══════════════════════════════════════════════════════════════════════════

create schema if not exists examen;
create schema if not exists baseline;

-- ─── Tablas ────────────────────────────────────────────────────────────────

create table examen.distributioncenter (
  dcenterno  varchar(5),
  dstreet    varchar(40),
  dcity      varchar(30),
  dstate     char(2),
  dzipcode   varchar(10),
  mgrstaffno varchar(6)
);

create table examen.staff (
  staffno   varchar(6),
  name      varchar(40),
  position  varchar(20),
  salary    numeric(9, 2),
  email     varchar(60),
  dcenterno varchar(5)
);

create table examen.dvd (
  catalogno varchar(6),
  title     varchar(60),
  genre     varchar(20),
  rating    varchar(6)
);

create table examen.actor (
  actorno   varchar(6),
  actorname varchar(40)
);

create table examen.dvdactor (
  actorno   varchar(6),
  catalogno varchar(6),
  character varchar(40)
);

create table examen.member (
  memberno  varchar(8),
  mfname    varchar(20),
  mlname    varchar(20),
  mstreet   varchar(40),
  mcity     varchar(30),
  mstate    char(2),
  mzipcode  varchar(10),
  memail    varchar(60),
  clave     varchar(20),
  mtypeno   varchar(4),
  dcenterno varchar(5)
);

create table examen.tipomembrecia (
  mtypeno    varchar(4),
  mtypedesc  varchar(20),
  maxrentals smallint,
  cargomes   numeric(5, 2)
);

create table examen.deseo (
  memberno  varchar(8),
  catalogno varchar(6),
  ranking   smallint
);

create table examen.alquiler (
  deliveryno  varchar(10),
  memberno    varchar(8),
  fechasalida date
);

create table examen.dvdrental (
  deliveryno   varchar(10),
  dvdno        varchar(10),
  fechaentrega date
);

create table examen.dvdcopy (
  dvdno      varchar(10),
  disponible char(1),
  catalogno  varchar(6),
  dcenterno  varchar(5)
);

-- ─── Datos (transcritos de las imágenes del examen) ───────────────────────

insert into examen.distributioncenter values
  ('D001', '8 Jefferson Way',   'Portland',      'OR', '97201', 'S1500'),
  ('D002', 'City Center Plaza', 'Seattle',       'WA', '98122', 'S0010'),
  ('D003', '14 – 8th Avenue',   'New York',      'NY', '10012', 'S0415'),
  ('D004', '2 W. El Camino',    'San Francisco', 'CA', '94087', 'S2250');

insert into examen.staff values
  ('S1500', 'Tom Daniels',   'Manager',   48000, 'tdaniels@stayhome.com',  'D001'),
  ('S0003', 'Sally Adams',   'Assistant', 30000, 'sadams@stayhome.com',    'D001'),
  ('S0010', 'Mary Martinez', 'Manager',   51000, 'mmartinez@stayhome.com', 'D002'),
  ('S3250', 'Robert Chin',   'Assistant', 33000, 'rchin@stayhome.com',     'D002'),
  ('S2250', 'Sally Stern',   'Manager',   48000, 'sstern@stayhome.com',    'D004'),
  ('S0415', 'Art Peters',    'Manager',   42000, 'apeters@stayhome.com',   'D003');

insert into examen.dvd values
  ('207132', 'Casino Royale',            'Action',   'PG-13'),
  ('902355', 'Harry Potter and the GOF', 'Children', 'PG'),
  ('330553', 'Lord of the Rings III',    'Action',   'PG-13'),
  ('781132', 'Shrek 2',                  'Children', 'PG'),
  ('445624', 'Mission Impossible III',   'Action',   'PG-13'),
  ('634817', 'War of the Worlds',        'Sci-Fi',   'PG-13');

insert into examen.actor values
  ('A1002', 'Judi Dench'),
  ('A3006', 'Elijah Wood'),
  ('A2019', 'Tom Cruise'),
  ('A7525', 'Ian McKellen'),
  ('A4343', 'Mike Myers'),
  ('A8401', 'Daniel Radcliffe');

insert into examen.dvdactor values
  ('A1002', '207132', 'M'),
  ('A3006', '330553', 'Frodo Baggins'),
  ('A2019', '445624', 'Ethan Hunt'),
  ('A2019', '634817', 'Ray Ferrier'),
  ('A7525', '330553', 'Gandalf'),
  ('A4343', '781132', 'Shrek'),
  ('A8401', '902355', 'Harry Potter');

insert into examen.member values
  ('M250178', 'Bob',    'Adams',  '57 – 11th Avenue', 'Seattle',  'WA', '98105', 'badams@yahoo.com',    '*******', 'MT2', 'D002'),
  ('M166884', 'Ann',    'Peters', '89 Redmond Rd',    'Portland', 'OR', '97117', 'apeters@hotmail.com', '*******', 'MT3', 'D001'),
  ('M115656', 'Serena', 'Parker', '2 W. Capital Way', 'Portland', 'OR', '97201', 'sparker@port.edu',    '*******', 'MT1', 'D001'),
  ('M284354', 'Don',    'Nelson', '123 Suffolk Lane', 'Seattle',  'WA', '98117', 'dnelson1@msoft.com',  '*******', 'MT1', 'D002');

insert into examen.tipomembrecia values
  ('MT1', '5-at-a-time', 5, 14.99),
  ('MT2', '3-at-a-time', 3, 11.99),
  ('MT3', '1-at-a-time', 1,  9.99);

insert into examen.deseo values
  ('M250178', '330553', 1),
  ('M250178', '634817', 2),
  ('M166884', '207132', 1),
  ('M166884', '330553', 2),
  ('M166884', '634817', 3);

insert into examen.alquiler values
  ('R75346191', 'M284354', '2006-02-04'),
  ('R75346282', 'M284354', '2006-02-04'),
  ('R66825673', 'M115656', '2006-02-05'),
  ('R66818964', 'M115656', '2006-02-02');

insert into examen.dvdrental values
  ('R75346191', '24545663', '2006-02-06'),
  ('R75346282', '24343196', '2006-02-06'),
  ('R66825673', '19900422', '2006-02-07'),
  ('R66818964', '17864331', null);

insert into examen.dvdcopy values
  ('19900422', 'Y', '207132', 'D001'),
  ('24545663', 'Y', '207132', 'D002'),
  ('17864331', 'N', '634817', 'D001'),
  ('24343196', 'Y', '634817', 'D002');

-- ─── Copia intacta para restablecer ───────────────────────────────────────

create table baseline.distributioncenter as table examen.distributioncenter;
create table baseline.staff              as table examen.staff;
create table baseline.dvd                as table examen.dvd;
create table baseline.actor              as table examen.actor;
create table baseline.dvdactor           as table examen.dvdactor;
create table baseline.member             as table examen.member;
create table baseline.tipomembrecia      as table examen.tipomembrecia;
create table baseline.deseo              as table examen.deseo;
create table baseline.alquiler           as table examen.alquiler;
create table baseline.dvdrental          as table examen.dvdrental;
create table baseline.dvdcopy            as table examen.dvdcopy;

-- ─── Permisos ─────────────────────────────────────────────────────────────
-- `examen` no se expone en la Data API: solo se llega a él por las funciones.
-- La consola corre con los privilegios del que llama (anon): DML sobre `examen`,
-- ningún acceso a `baseline`, sin permiso para crear objetos.

grant usage on schema examen to anon, authenticated;
grant select, insert, update, delete on all tables in schema examen to anon, authenticated;
revoke all on schema baseline from public, anon, authenticated;

-- ─── public.punto2_tables(): todas las tablas en una sola llamada ─────────

create or replace function public.punto2_tables()
returns json
language sql
stable
security invoker
set search_path = examen
as $$
  select json_build_object(
    'distributioncenter', (select coalesce(json_agg(t), '[]') from (select * from examen.distributioncenter order by dcenterno) t),
    'staff',              (select coalesce(json_agg(t), '[]') from (select * from examen.staff order by staffno) t),
    'dvd',                (select coalesce(json_agg(t), '[]') from (select * from examen.dvd order by catalogno) t),
    'actor',              (select coalesce(json_agg(t), '[]') from (select * from examen.actor order by actorno) t),
    'dvdactor',           (select coalesce(json_agg(t), '[]') from (select * from examen.dvdactor order by catalogno, actorno) t),
    'member',             (select coalesce(json_agg(t), '[]') from (select * from examen.member order by memberno) t),
    'tipomembrecia',      (select coalesce(json_agg(t), '[]') from (select * from examen.tipomembrecia order by mtypeno) t),
    'deseo',              (select coalesce(json_agg(t), '[]') from (select * from examen.deseo order by memberno, ranking) t),
    'alquiler',           (select coalesce(json_agg(t), '[]') from (select * from examen.alquiler order by deliveryno) t),
    'dvdrental',          (select coalesce(json_agg(t), '[]') from (select * from examen.dvdrental order by deliveryno) t),
    'dvdcopy',            (select coalesce(json_agg(t), '[]') from (select * from examen.dvdcopy order by dvdno) t)
  );
$$;

-- ─── public.run_sql(statements): consola SQL del punto 2 ──────────────────
-- • Solo SELECT / WITH / INSERT / UPDATE / DELETE, una sentencia por elemento.
-- • Corre como el que llama (anon) con search_path = examen, public y timeout de 3 s.
-- • Todas las sentencias van en la misma transacción: si una falla, no se aplica ninguna.
-- • Devuelve las filas de la última sentencia (DML sin RETURNING devuelve las filas afectadas).

create or replace function public.run_sql(statements text[])
returns json
language plpgsql
volatile
security invoker
set search_path = examen, public
set statement_timeout = '3s'
as $$
declare
  stmt      text;
  clean     text;
  verb      text;
  rows_json json := '[]';
  n         bigint := 0;
begin
  if statements is null or cardinality(statements) = 0 then
    raise exception 'No hay sentencias para ejecutar';
  end if;
  if cardinality(statements) > 20 then
    raise exception 'Máximo 20 sentencias por ejecución';
  end if;

  foreach stmt in array statements loop
    -- quitar comentarios de línea y el ';' final
    clean := btrim(regexp_replace(stmt, '--[^\n]*', '', 'g'));
    clean := btrim(regexp_replace(clean, ';\s*$', ''));
    if clean = '' then
      continue;
    end if;
    if position(';' in regexp_replace(clean, '''[^'']*''', '', 'g')) > 0 then
      raise exception 'Una sentencia por elemento: separa las sentencias con ";" al final de la línea';
    end if;

    verb := lower(substring(clean from '^\s*([A-Za-z]+)'));
    if verb not in ('select', 'with', 'insert', 'update', 'delete') then
      raise exception 'Sentencia no permitida: %. Solo SELECT, WITH, INSERT, UPDATE y DELETE.', upper(coalesce(verb, '?'));
    end if;

    if verb in ('select', 'with') then
      execute format('select coalesce(json_agg(t), ''[]''), count(*) from (%s) t', clean) into rows_json, n;
    else
      if clean !~* '\mreturning\M' then
        clean := clean || ' returning *';
      end if;
      execute format('with t as (%s) select coalesce(json_agg(t), ''[]''), count(*) from t', clean) into rows_json, n;
    end if;
  end loop;

  return json_build_object('rows', rows_json, 'rowCount', n);
end;
$$;

-- ─── public.reset_data(): restaura `examen` desde `baseline` ──────────────

create or replace function public.reset_data()
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  t text;
begin
  foreach t in array array[
    'distributioncenter', 'staff', 'dvd', 'actor', 'dvdactor', 'member',
    'tipomembrecia', 'deseo', 'alquiler', 'dvdrental', 'dvdcopy'
  ] loop
    execute format('truncate examen.%I', t);
    execute format('insert into examen.%I select * from baseline.%I', t, t);
  end loop;
end;
$$;

revoke all on function public.punto2_tables() from public;
revoke all on function public.run_sql(text[]) from public;
revoke all on function public.reset_data() from public;
grant execute on function public.punto2_tables() to anon, authenticated;
grant execute on function public.run_sql(text[]) to anon, authenticated;
grant execute on function public.reset_data() to anon, authenticated;

insert into app.despliegue (version, descripcion)
values ('20261004010000', 'Punto 2: esquema examen (StayHome) + run_sql + reset_data')
on conflict (version) do nothing;
