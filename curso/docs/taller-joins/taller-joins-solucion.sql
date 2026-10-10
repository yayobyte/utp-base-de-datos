--
--  Taller JOINs — solución del punto 6 (PostgreSQL / Supabase).
--  Requisito: haber ejecutado taller-joins.sql (tablas + registros).
--  Ejecutar cada bloque por separado y tomar captura de la consulta y su salida.
--

-- ============================================================
-- a. Elementos del catálogo con su respectivo proveedor
-- ============================================================
select s.sid, s.sname as proveedor, p.pid, p.pname as parte, p.color, c.cost as costo
from catalog c
join suppliers s on s.sid = c.sid
join parts p     on p.pid = c.pid
order by s.sname, p.pname;

-- ============================================================
-- b. Personas que certifican la revisión de un avión
-- ============================================================
select e.eid, e.ename as empleado, a.aid, a.aname as avion
from certified ce
join employees e on e.eid = ce.eid
join aircraft a  on a.aid = ce.aid
order by e.ename, a.aname;

-- ============================================================
-- c. Tabla que relaciona vuelos con el avión usado + 10 registros
--    (las llaves foráneas se crean en el punto e)
-- ============================================================
create table flight_aircraft(
	flno numeric(4,0) primary key,   -- un vuelo usa un solo avión
	aid  numeric(9,0) not null
	);

insert into flight_aircraft (flno, aid) values
	(99, 1),    -- Los Angeles → Washington D.C. (2308) · Boeing 747-400
	(13, 2),    -- Los Angeles → Chicago (1749)         · Boeing 737-800
	(346, 2),   -- Los Angeles → Dallas (1251)          · Boeing 737-800
	(387, 3),   -- Los Angeles → Boston (2606)          · Airbus A340-300
	(7, 1),     -- Los Angeles → Sydney (7487)          · Boeing 747-400
	(2, 3),     -- Los Angeles → Tokyo (5478)           · Airbus A340-300
	(33, 12),   -- Los Angeles → Honolulu (2551)        · Boeing 767-400ER
	(68, 13),   -- Chicago → New York (802)             · Airbus A320
	(7789, 4),  -- Madison → Detroit (319)              · BAe Jetstream 41
	(702, 5);   -- Madison → New York (789)             · Embraer ERJ-145

select * from flight_aircraft;

-- ============================================================
-- d. Campos nuevos sin recrear las tablas (ALTER TABLE) y actualización
-- ============================================================
alter table aircraft
	add column capacity     numeric(4,0),
	add column brand        varchar(30),
	add column company      varchar(40),
	add column aircraft_type varchar(20);

alter table flights add column passengers numeric(4,0);

update aircraft set
	capacity = case aid
		when 1 then 416 when 2 then 189 when 3 then 295 when 4 then 29
		when 5 then 50  when 6 then 34  when 7 then 4   when 8 then 180
		when 9 then 400 when 10 then 243 when 11 then 550 when 12 then 375
		when 13 then 180 when 14 then 156 when 15 then 189 when 16 then 2 end,
	brand = case
		when aname like 'Boeing%' then 'Boeing'
		when aname like 'Airbus%' then 'Airbus'
		when aname like 'British Aerospace%' then 'British Aerospace'
		when aname like 'Embraer%' then 'Embraer'
		when aname like 'SAAB%' then 'Saab'
		when aname like 'Piper%' then 'Piper'
		when aname like 'Tupolev%' then 'Tupolev'
		when aname like 'Lockheed%' then 'Lockheed'
		else 'Schweizer' end,
	company = case
		when aid in (1, 7, 11) then 'United Airlines'
		when aid in (2, 10, 15) then 'American Airlines'
		when aid in (3, 12, 13) then 'Delta Air Lines'
		when aid in (4, 5, 6, 14) then 'Avianca'
		else 'Particular' end,
	aircraft_type = case
		when aid in (1, 3, 9, 11, 12) then 'Fuselaje ancho'
		when aid in (2, 8, 10, 13, 14, 15) then 'Fuselaje estrecho'
		when aid in (4, 5, 6) then 'Regional'
		when aid = 7 then 'Avioneta'
		else 'Planeador' end;

update flights f set passengers = v.p
from (values (99, 380), (13, 170), (346, 150), (387, 280), (7, 400),
	(2, 290), (33, 360), (34, 300), (76, 165), (68, 175), (7789, 25),
	(701, 120), (702, 45), (4884, 30), (2223, 40), (5694, 35),
	(304, 140), (149, 60)) as v(flno, p)
where f.flno = v.flno;

select * from aircraft order by aid;
select flno, origin, destination, passengers from flights order by flno;

-- ============================================================
-- e. Llaves foráneas de la tabla creada en c
-- ============================================================
alter table flight_aircraft
	add constraint fk_flight_aircraft_flight   foreign key (flno) references flights(flno),
	add constraint fk_flight_aircraft_aircraft foreign key (aid)  references aircraft(aid);

select conname, pg_get_constraintdef(oid)
from pg_constraint
where conrelid = 'flight_aircraft'::regclass;

-- ============================================================
-- l (parte 1). Vistas de f, g y j
--   La vista de g se crea ANTES de borrar: muestra las partes rojas
--   (y en qué catálogo están); después del borrado debe quedar vacía.
-- ============================================================
create view v_inscritos_por_curso as
select cl.name as curso, cl.meets_at as horario, cl.room as salon,
	fa.fname as profesor, st.snum, st.sname as estudiante, st.major as carrera
from enrolled en
join student st     on st.snum = en.snum
join class cl       on cl.name = en.cname
left join faculty fa on fa.fid = cl.fid;

create view v_partes_rojas as
select p.pid, p.pname as parte, p.color, s.sname as proveedor, c.cost as costo
from parts p
left join catalog c   on c.pid = p.pid
left join suppliers s on s.sid = c.sid
where p.color = 'Red';

create view v_salario_incrementado as
select eid, ename, age, salary as salario_actual,
	case
		when age < 20 then 2.3
		when age between 21 and 51 then 5
		else 6 end as porcentaje,
	round(salary * case
		when age < 20 then 1.023
		when age between 21 and 51 then 1.05
		else 1.06 end, 2) as salario_nuevo
from emp;

-- ============================================================
-- f. Personas inscritas en cada curso (orden: curso/grupo y estudiante)
-- ============================================================
select * from v_inscritos_por_curso order by curso, estudiante;

-- ============================================================
-- g. Eliminar todas las partes rojas
--   catalog tiene FK hacia parts, así que primero se borran sus filas
--   del catálogo; si no, PostgreSQL rechaza el DELETE.
-- ============================================================
select * from v_partes_rojas;   -- antes

begin;
delete from catalog where pid in (select pid from parts where color = 'Red');
delete from parts where color = 'Red';
commit;

select * from v_partes_rojas;   -- después (vacía)

-- ============================================================
-- h. Daniel Evans: edad = 30
-- ============================================================
select * from emp where ename = 'Daniel Evans';
update emp set age = 30 where ename = 'Daniel Evans';
select * from emp where ename = 'Daniel Evans';

-- ============================================================
-- i. Eliminar a "Lisa Walker"
--   Aparece en student (322654189), emp (322654189) y employees (567354612).
--   Se borran primero las filas que la referencian (enrolled, works, certified).
-- ============================================================
select 'student' as tabla, snum as id, sname from student where sname = 'Lisa Walker'
union all select 'emp', eid, ename from emp where ename = 'Lisa Walker'
union all select 'employees', eid, ename from employees where ename = 'Lisa Walker';

begin;
delete from enrolled  where snum in (select snum from student where sname = 'Lisa Walker');
delete from student   where sname = 'Lisa Walker';
delete from works     where eid in (select eid from emp where ename = 'Lisa Walker');
delete from emp       where ename = 'Lisa Walker';
delete from certified where eid in (select eid from employees where ename = 'Lisa Walker');
delete from employees where ename = 'Lisa Walker';
commit;

-- ============================================================
-- j. Mostrar el salario con el incremento (sin modificar datos)
-- ============================================================
select * from v_salario_incrementado order by eid;

-- ============================================================
-- k. Actualizar el salario con la misma regla
-- ============================================================
update emp set salary = round(salary * case
	when age < 20 then 1.023
	when age between 21 and 51 then 1.05
	else 1.06 end, 2);

select eid, ename, age, salary from emp order by eid;

-- ============================================================
-- m. Avión que más millas ha recorrido (GROUP BY / HAVING)
-- ============================================================
select a.aid, a.aname, sum(f.distance) as millas
from flight_aircraft fa
join flights f  on f.flno = fa.flno
join aircraft a on a.aid = fa.aid
group by a.aid, a.aname
having sum(f.distance) = (
	select max(t.total) from (
		select sum(f2.distance) as total
		from flight_aircraft fa2 join flights f2 on f2.flno = fa2.flno
		group by fa2.aid) t);

-- ============================================================
-- n. Ruta con más pasajeros movilizados
-- ============================================================
select origin, destination, sum(passengers) as pasajeros
from flights
group by origin, destination
having sum(passengers) = (
	select max(t.total) from (
		select sum(passengers) as total from flights group by origin, destination) t);
