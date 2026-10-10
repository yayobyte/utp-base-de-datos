--
--  Taller JOINs — tablas del libro "Database Management Systems"
--  (Ramakrishnan & Gehrke). Adaptado de Oracle a PostgreSQL para
--  ejecutarse en el SQL Editor de Supabase.
--
--  Cambios: drop if exists, number→numeric, varchar2→varchar,
--  date→timestamp, to_date(RRRR)→to_timestamp(YYYY), sin quit.
--  El script es re-ejecutable: borra y recrea todo en una transacción.
--
begin;

drop table if exists student cascade;
drop table if exists faculty cascade;
drop table if exists class cascade;
drop table if exists enrolled cascade;
drop table if exists emp cascade;
drop table if exists works cascade;
drop table if exists dept cascade;
drop table if exists flights cascade;
drop table if exists aircraft cascade;
drop table if exists certified cascade;
drop table if exists employees cascade;
drop table if exists suppliers cascade;
drop table if exists parts cascade;
drop table if exists catalog cascade;
drop table if exists sailors cascade;
--
-- Now, add each table.
--
create table student(
	snum numeric(9,0) primary key,
	sname varchar(30),
	major varchar(25),
	standing varchar(2),
	age numeric(3,0)
	);
create table faculty(
	fid numeric(9,0) primary key,
	fname varchar(30),
	deptid numeric(2,0)
	);
create table class(
	name varchar(40) primary key,
	meets_at varchar(20),
	room varchar(10),
	fid numeric(9,0),
	foreign key(fid) references faculty
	);
create table enrolled(
	snum numeric(9,0),
	cname varchar(40),
	primary key(snum,cname),
	foreign key(snum) references student,
	foreign key(cname) references class(name)
	);
create table emp(
	eid numeric(9,0) primary key,
	ename varchar(30),
	age numeric(3,0),
	salary numeric(10,2)
	);
create table dept(
	did numeric(2,0) primary key,
	dname varchar(20),
	budget numeric(10,2),
	managerid numeric(9,0),
	foreign key(managerid) references emp(eid)
	);
create table works(
	eid numeric(9,0),
	did numeric(2,0),
	pct_time numeric(3,0),
	primary key(eid,did),
	foreign key(eid) references emp,
	foreign key(did) references dept
	);
create table flights(
	flno numeric(4,0) primary key,
	origin varchar(20),
	destination varchar(20),
	distance numeric(6,0),
	departs timestamp,
	arrives timestamp,
	price numeric(7,2)
	);
create table aircraft(
	aid numeric(9,0) primary key,
	aname varchar(30),
	cruisingrange numeric(6,0)
	);
create table employees(
	eid numeric(9,0) primary key,
	ename varchar(30),
	salary numeric(10,2)
	);
create table certified(
	eid numeric(9,0),
	aid numeric(9,0),
	primary key(eid,aid),
	foreign key(eid) references employees,
	foreign key(aid) references aircraft
	);
create table suppliers(
	sid numeric(9,0) primary key,
	sname varchar(30),
	address varchar(40)
	);
create table parts(
	pid numeric(9,0) primary key,
	pname varchar(40),
	color varchar(15)
	);
create table catalog(
	sid numeric(9,0),
	pid numeric(9,0),
	cost numeric(10,2),
	primary key(sid,pid),
	foreign key(sid) references suppliers,
	foreign key(pid) references parts
	);
create table sailors(
	sid numeric(9,0) primary key,
	sname varchar(30),
	rating numeric(2,0),
	age numeric(4,1)
	);
	
	
Insert Into student (snum, sname, major, standing, age) values (51135593,'Maria White','English','SR',21);
Insert Into student (snum, sname, major, standing, age) values (60839453,'Charles Harris','Architecture','SR',22);
Insert Into student (snum, sname, major, standing, age) values (99354543,'Susan Martin','Law','JR',20);
Insert Into student (snum, sname, major, standing, age) values (112348546,'Joseph Thompson','Computer Science','SO',19);
Insert Into student (snum, sname, major, standing, age) values (115987938,'Christopher Garcia','Computer Science','JR',20);
Insert Into student (snum, sname, major, standing, age) values (132977562,'Angela Martinez','History','SR',20);
Insert Into student (snum, sname, major, standing, age) values (269734834,'Thomas Robinson','Psychology','SO',18);
Insert Into student (snum, sname, major, standing, age) values (280158572,'Margaret Clark','Animal Science','FR',18);
Insert Into student (snum, sname, major, standing, age) values (301221823,'Juan Rodriguez','Psychology','JR',20);
Insert Into student (snum, sname, major, standing, age) values (318548912,'Dorthy Lewis','Finance','FR',18);
Insert Into student (snum, sname, major, standing, age) values (320874981,'Daniel Lee','Electrical Engineering','FR',17);
Insert Into student (snum, sname, major, standing, age) values (322654189,'Lisa Walker','Computer Science','SO',17);
Insert Into student (snum, sname, major, standing, age) values (348121549,'Paul Hall','Computer Science','JR',18);
Insert Into student (snum, sname, major, standing, age) values (351565322,'Nancy Allen','Accounting','JR',19);
Insert Into student (snum, sname, major, standing, age) values (451519864,'Mark Young','Finance','FR',18);
Insert Into student (snum, sname, major, standing, age) values (455798411,'Luis Hernandez','Electrical Engineering','FR',17);
Insert Into student (snum, sname, major, standing, age) values (462156489,'Donald King','Mechanical Engineering','SO',19);
Insert Into student (snum, sname, major, standing, age) values (550156548,'George Wright','Education','SR',21);
Insert Into student (snum, sname, major, standing, age) values (552455318,'Ana Lopez','Computer Engineering','SR',19);
Insert Into student (snum, sname, major, standing, age) values (556784565,'Kenneth Hill','Civil Engineering','SR',21);
Insert Into student (snum, sname, major, standing, age) values (567354612,'Karen Scott','Computer Engineering','FR',18);
Insert Into student (snum, sname, major, standing, age) values (573284895,'Steven Green','Kinesiology','SO',19);
Insert Into student (snum, sname, major, standing, age) values (574489456,'Betty Adams','Economics','JR',20);
Insert Into student (snum, sname, major, standing, age) values (578875478,'Edward Baker','Veterinary Medicine','SR',21);


Insert Into sailors (sid, sname,rating,age) values (18,'jones',3,30);
Insert Into sailors (sid, sname,rating,age) values (41,'jonah',6,56);
Insert Into sailors (sid, sname,rating,age) values (22,'ahab',7,44);
Insert Into sailors (sid, sname,rating,age) values (63,'moby',null,15);


Insert Into faculty (fid, fname, deptid) values (142519864,'I. Teach',20);
Insert Into faculty (fid, fname, deptid) values (242518965,'James Smith',68);
Insert Into faculty (fid, fname, deptid) values (141582651,'Mary Johnson',20);
Insert Into faculty (fid, fname, deptid) values (11564812,'John Williams',68);
Insert Into faculty (fid, fname, deptid) values (254099823,'Patricia Jones',68);
Insert Into faculty (fid, fname, deptid) values (356187925,'Robert Brown',12);
Insert Into faculty (fid, fname, deptid) values (489456522,'Linda Davis',20);
Insert Into faculty (fid, fname, deptid) values (287321212,'Michael Miller',12);
Insert Into faculty (fid, fname, deptid) values (248965255,'Barbara Wilson',12);
Insert Into faculty (fid, fname, deptid) values (159542516,'William Moore',33);
Insert Into faculty (fid, fname, deptid) values (90873519,'Elizabeth Taylor',11);
Insert Into faculty (fid, fname, deptid) values (486512566,'David Anderson',20);
Insert Into faculty (fid, fname, deptid) values (619023588,'Jennifer Thomas',11);
Insert Into faculty (fid, fname, deptid) values (489221823,'Richard Jackson',33);
Insert Into faculty (fid, fname, deptid) values (548977562,'Ulysses Teach',20);


Insert Into class (name, meets_at, room, fid) values ('Data Structures','MWF 10','R128',489456522);
--Insert Into class (name, meets_at, room, fid) values ('Database Systems','MWF 12:30-1:45','1320 DCL',142519864);
Insert Into class (name, meets_at, room, fid) values ('Operating System Design','TuTh 12-1:20','20 AVW',489456522);
Insert Into class (name, meets_at, room, fid) values ('Psychology',Null,Null,619023588);
Insert Into class (name, meets_at, room, fid) values ('Archaeology of the Incas','MWF 3-4:15','R128',248965255);
Insert Into class (name, meets_at, room, fid) values ('Aviation Accident Investigation','TuTh 1-2:50','Q3',11564812);
Insert Into class (name, meets_at, room, fid) values ('Air Quality Engineering','TuTh 10:30-11:45','R15',11564812);
Insert Into class (name, meets_at, room, fid) values ('Introductory Latin','MWF 3-4:15','R12',248965255);
Insert Into class (name, meets_at, room, fid) values ('American Political Parties','TuTh 2-3:15','20 AVW',619023588);
Insert Into class (name, meets_at, room, fid) values ('Social Cognition','Tu 6:30-8:40','R15',159542516);
Insert Into class (name, meets_at, room, fid) values ('Perception','MTuWTh 3','Q3',489221823);
Insert Into class (name, meets_at, room, fid) values ('Multivariate Analysis','TuTh 2-3:15','R15',90873519);
Insert Into class (name, meets_at, room, fid) values ('Patent Law','F 1-2:50','R128',90873519);
Insert Into class (name, meets_at, room, fid) values ('Urban Economics','MWF 11','20 AVW',489221823);
Insert Into class (name, meets_at, room, fid) values ('Organic Chemistry','TuTh 12:30-1:45','R12',489221823);
Insert Into class (name, meets_at, room, fid) values ('Marketing Research','MW 10-11:15','1320 DCL',489221823);
Insert Into class (name, meets_at, room, fid) values ('Seminar in American Art','M 4','R15',489221823);
Insert Into class (name, meets_at, room, fid) values ('Orbital Mechanics','MWF 8','1320 DCL',11564812);
Insert Into class (name, meets_at, room, fid) values ('Dairy Herd Management','TuTh 12:30-1:45','R128',356187925);
Insert Into class (name, meets_at, room, fid) values ('Communication Networks','MW 9:30-10:45','20 AVW',141582651);
Insert Into class (name, meets_at, room, fid) values ('Optical Electronics','TuTh 12:30-1:45','R15',254099823);
Insert Into class (name, meets_at, room, fid) values ('Artificial Intelligence',Null,'UP328',Null);
Insert Into class (name, meets_at, room, fid) values ('Intoduction to Math','TuTh 8-9:30','R128',489221823);


--Insert Into enrolled (snum, cname) values (112348546,'Database Systems');
--Insert Into enrolled (snum, cname) values (115987938,'Database Systems');
--Insert Into enrolled (snum, cname) values (348121549,'Database Systems');
--Insert Into enrolled (snum, cname) values (322654189,'Database Systems');
--Insert Into enrolled (snum, cname) values (552455318,'Database Systems');
Insert Into enrolled (snum, cname) values (455798411,'Operating System Design');
Insert Into enrolled (snum, cname) values (552455318,'Operating System Design');
Insert Into enrolled (snum, cname) values (567354612,'Operating System Design');
Insert Into enrolled (snum, cname) values (112348546,'Operating System Design');
Insert Into enrolled (snum, cname) values (115987938,'Operating System Design');
Insert Into enrolled (snum, cname) values (322654189,'Operating System Design');
Insert Into enrolled (snum, cname) values (567354612,'Data Structures');
Insert Into enrolled (snum, cname) values (552455318,'Communication Networks');
Insert Into enrolled (snum, cname) values (455798411,'Optical Electronics');
Insert Into enrolled (snum, cname) values (455798411,'Organic Chemistry');
Insert Into enrolled (snum, cname) values (301221823,'Perception');
Insert Into enrolled (snum, cname) values (301221823,'Social Cognition');
Insert Into enrolled (snum, cname) values (301221823,'American Political Parties');
Insert Into enrolled (snum, cname) values (556784565,'Air Quality Engineering');
Insert Into enrolled (snum, cname) values (99354543,'Patent Law');
Insert Into enrolled (snum, cname) values (574489456,'Urban Economics');


Insert Into emp (eid, ename, age, salary) values (142519864,'Susan Martin',39,56990);
Insert Into emp (eid, ename, age, salary) values (242518965,'James Smith',68,27099);
Insert Into emp (eid, ename, age, salary) values (141582651,'Mary Johnson',44,94011);
Insert Into emp (eid, ename, age, salary) values (11564812,'John Williams',35,74098);
Insert Into emp (eid, ename, age, salary) values (254099823,'Patricia Jones',28,42783);
Insert Into emp (eid, ename, age, salary) values (356187925,'Robert Brown',28,35431);
Insert Into emp (eid, ename, age, salary) values (489456522,'Linda Davis',26,25971);
Insert Into emp (eid, ename, age, salary) values (287321212,'Michael Miller',62,131072);
Insert Into emp (eid, ename, age, salary) values (248965255,'Barbara Wilson',48,95021);
Insert Into emp (eid, ename, age, salary) values (159542516,'Matt Nelson',33,48990);
Insert Into emp (eid, ename, age, salary) values (90873519,'Elizabeth Taylor',27,33055);
Insert Into emp (eid, ename, age, salary) values (486512566,'David Anderson',20,25199);
Insert Into emp (eid, ename, age, salary) values (619023588,'Jennifer Thomas',24,34654);
Insert Into emp (eid, ename, age, salary) values (112348546,'Joseph Thompson',26,24998);
Insert Into emp (eid, ename, age, salary) values (115987938,'Christopher Garcia',60,24998);
Insert Into emp (eid, ename, age, salary) values (132977562,'Angela Martinez',31,24998);
Insert Into emp (eid, ename, age, salary) values (269734834,'Rick Carter',38,24998);
Insert Into emp (eid, ename, age, salary) values (280158572,'Margaret Clark',40,24998);
Insert Into emp (eid, ename, age, salary) values (301221823,'Juan Rodriguez',30,32175);
Insert Into emp (eid, ename, age, salary) values (318548912,'Ann Mitchell',23,32175);
Insert Into emp (eid, ename, age, salary) values (320874981,'Daniel Lee',23,32175);
Insert Into emp (eid, ename, age, salary) values (322654189,'Lisa Walker',38,32175);
Insert Into emp (eid, ename, age, salary) values (348121549,'Trey Phillips',69,32175);
Insert Into emp (eid, ename, age, salary) values (351565322,'Nancy Allen',30,39910);
Insert Into emp (eid, ename, age, salary) values (451519864,'Mark Young',34,39910);
Insert Into emp (eid, ename, age, salary) values (455798411,'Luis Hernandez',44,39910);
Insert Into emp (eid, ename, age, salary) values (550156548,'George Wright',42,41008);
Insert Into emp (eid, ename, age, salary) values (552455318,'Ana Lopez',35,41008);
Insert Into emp (eid, ename, age, salary) values (556784565,'Kenneth Hill',81,41008);
Insert Into emp (eid, ename, age, salary) values (567354612,'Karen Scott',70,39910);
Insert Into emp (eid, ename, age, salary) values (573284895,'Steven Green',29,39910);
Insert Into emp (eid, ename, age, salary) values (574489456,'Betty Adams',39,39910);
Insert Into emp (eid, ename, age, salary) values (15645489,'Daniel Evans',25,40312);
Insert Into emp (eid, ename, age, salary) values (15487874,'Gene Edwards',51,41008);
Insert Into emp (eid, ename, age, salary) values (54879887,'Dorthy Lewis',33,41008);
Insert Into emp (eid, ename, age, salary) values (98784544,'Eric Collins',23,41008);
Insert Into emp (eid, ename, age, salary) values (74454898,'Scott Bell',23,70100);
Insert Into emp (eid, ename, age, salary) values (156489494,'Gil Richardson',32,70100);
Insert Into emp (eid, ename, age, salary) values (179887498,'Dorthy Howard',28,40312);
Insert Into emp (eid, ename, age, salary) values (156465461,'Eric Cooper',26,24998);
Insert Into emp (eid, ename, age, salary) values (128778823,'William Ward',33,24998);
Insert Into emp (eid, ename, age, salary) values (178949844,'Chad Stewart',29,24998);
Insert Into emp (eid, ename, age, salary) values (298489484,'Lisa Gray',31,24998);
Insert Into emp (eid, ename, age, salary) values (274878974,'Harry Watson',30,24998);
Insert Into emp (eid, ename, age, salary) values (267894232,'Paul Hall',25,24998);
Insert Into emp (eid, ename, age, salary) values (254898318,'Gim Rogers',25,32175);
Insert Into emp (eid, ename, age, salary) values (489221823,'Richard Jackson',33,32996);
Insert Into emp (eid, ename, age, salary) values (548977562,'Donald King',43,92048);
Insert Into emp (eid, ename, age, salary) values (289562686,'Thomas Robinson',34,32175);
Insert Into emp (eid, ename, age, salary) values (291795563,'Haywood Kelly',36,32175);
Insert Into emp (eid, ename, age, salary) values (578875478,'Edward Baker',50,101071);
Insert Into emp (eid, ename, age, salary) values (51135593,'Maria White',22,24998);
Insert Into emp (eid, ename, age, salary) values (60839453,'Charles Harris',24,24998);
Insert Into emp (eid, ename, age, salary) values (334568786,'William Moore',32,32175);
Insert Into emp (eid, ename, age, salary) values (355548984,'Tom Murphy',41,32175);
Insert Into emp (eid, ename, age, salary) values (310454876,'Milo Brooks',22,39910);
Insert Into emp (eid, ename, age, salary) values (390487451,'Mark Coleman',42,39910);
Insert Into emp (eid, ename, age, salary) values (454565232,'Louis Jenkins',20,39910);
Insert Into emp (eid, ename, age, salary) values (141582657,'Stanley Browne',23,14093);


Insert Into dept (did, dname,budget,managerid) values (1,'Hardware',1048572.12,141582651);
Insert Into dept (did, dname,budget,managerid) values (2,'Operations',4099101,287321212);
Insert Into dept (did, dname,budget,managerid) values (3,'Legal',222988.13,248965255);
Insert Into dept (did, dname,budget,managerid) values (4,'Marketing',538099.54,548977562);
Insert Into dept (did, dname,budget,managerid) values (5,'Software',400011.12,141582651);
Insert Into dept (did, dname,budget,managerid) values (6,'Production',12099101,578875478);
Insert Into dept (did, dname,budget,managerid) values (7,'Shipping',5,489456522);


Insert Into works (eid, did, pct_time) values (142519864,2,100);
Insert Into works (eid, did, pct_time) values (242518965,1,100);
Insert Into works (eid, did, pct_time) values (141582651,1,50);
Insert Into works (eid, did, pct_time) values (141582651,5,50);
Insert Into works (eid, did, pct_time) values (141582657,1,25);
Insert Into works (eid, did, pct_time) values (141582657,5,75);
Insert Into works (eid, did, pct_time) values (11564812,3,100);
Insert Into works (eid, did, pct_time) values (254099823,3,100);
Insert Into works (eid, did, pct_time) values (356187925,2,100);
Insert Into works (eid, did, pct_time) values (489456522,7,100);
Insert Into works (eid, did, pct_time) values (287321212,2,100);
Insert Into works (eid, did, pct_time) values (248965255,3,100);
Insert Into works (eid, did, pct_time) values (159542516,4,100);
Insert Into works (eid, did, pct_time) values (90873519,2,100);
Insert Into works (eid, did, pct_time) values (486512566,4,100);
Insert Into works (eid, did, pct_time) values (619023588,1,100);
Insert Into works (eid, did, pct_time) values (489221823,2,100);
Insert Into works (eid, did, pct_time) values (548977562,4,100);
Insert Into works (eid, did, pct_time) values (578875478,6,100);
Insert Into works (eid, did, pct_time) values (51135593,2,100);
Insert Into works (eid, did, pct_time) values (60839453,2,100);
Insert Into works (eid, did, pct_time) values (112348546,2,100);
Insert Into works (eid, did, pct_time) values (115987938,2,100);
Insert Into works (eid, did, pct_time) values (132977562,2,100);
Insert Into works (eid, did, pct_time) values (269734834,2,100);
Insert Into works (eid, did, pct_time) values (280158572,2,100);
Insert Into works (eid, did, pct_time) values (301221823,2,100);
Insert Into works (eid, did, pct_time) values (318548912,2,100);
Insert Into works (eid, did, pct_time) values (320874981,2,100);
Insert Into works (eid, did, pct_time) values (322654189,2,100);
Insert Into works (eid, did, pct_time) values (348121549,2,100);
Insert Into works (eid, did, pct_time) values (351565322,2,100);
Insert Into works (eid, did, pct_time) values (451519864,2,100);
Insert Into works (eid, did, pct_time) values (455798411,2,100);
Insert Into works (eid, did, pct_time) values (550156548,2,50);
Insert Into works (eid, did, pct_time) values (552455318,2,25);
Insert Into works (eid, did, pct_time) values (556784565,2,25);
Insert Into works (eid, did, pct_time) values (567354612,2,75);
Insert Into works (eid, did, pct_time) values (573284895,2,50);
Insert Into works (eid, did, pct_time) values (574489456,2,50);
Insert Into works (eid, did, pct_time) values (15645489,6,100);
Insert Into works (eid, did, pct_time) values (15487874,6,100);
Insert Into works (eid, did, pct_time) values (54879887,6,100);
Insert Into works (eid, did, pct_time) values (98784544,6,100);
Insert Into works (eid, did, pct_time) values (74454898,6,100);
Insert Into works (eid, did, pct_time) values (156489494,6,100);
Insert Into works (eid, did, pct_time) values (179887498,6,100);
Insert Into works (eid, did, pct_time) values (156465461,6,100);
Insert Into works (eid, did, pct_time) values (128778823,6,100);
Insert Into works (eid, did, pct_time) values (178949844,6,100);
Insert Into works (eid, did, pct_time) values (298489484,6,100);
Insert Into works (eid, did, pct_time) values (274878974,6,100);
Insert Into works (eid, did, pct_time) values (267894232,6,100);
Insert Into works (eid, did, pct_time) values (254898318,6,100);
Insert Into works (eid, did, pct_time) values (289562686,6,100);
Insert Into works (eid, did, pct_time) values (291795563,6,100);
Insert Into works (eid, did, pct_time) values (334568786,6,100);
Insert Into works (eid, did, pct_time) values (355548984,6,100);
Insert Into works (eid, did, pct_time) values (310454876,6,100);
Insert Into works (eid, did, pct_time) values (390487451,6,100);
Insert Into works (eid, did, pct_time) values (454565232,6,50);


Insert Into flights (flno, origin,destination, distance,departs,arrives,price) values (99,'Los Angeles','Washington D.C.',2308,to_timestamp('12/04/2005 09:30','DD/MM/YYYY HH24:MI'),to_timestamp('12/04/2005 21:40','DD/MM/YYYY HH24:MI'),235.98);
Insert Into flights (flno, origin,destination, distance,departs,arrives,price) values (13,'Los Angeles','Chicago',1749,to_timestamp('12/04/2005 08:45','DD/MM/YYYY HH24:MI'),to_timestamp('12/04/2005 20:45','DD/MM/YYYY HH24:MI'),220.98);
Insert Into flights (flno, origin,destination, distance,departs,arrives,price) values (346,'Los Angeles','Dallas',1251,to_timestamp('12/04/2005 11:50','DD/MM/YYYY HH24:MI'),to_timestamp('12/04/2005 19:05','DD/MM/YYYY HH24:MI'),225.43);
Insert Into flights (flno, origin,destination, distance,departs,arrives,price) values (387,'Los Angeles','Boston',2606,to_timestamp('12/04/2005 07:03','DD/MM/YYYY HH24:MI'),to_timestamp('12/04/2005 17:03','DD/MM/YYYY HH24:MI'),261.56);
Insert Into flights (flno, origin,destination, distance,departs,arrives,price) values (7,'Los Angeles','Sydney',7487,to_timestamp('12/04/2005 22:30','DD/MM/YYYY HH24:MI'),to_timestamp('14/04/2005 06:10','DD/MM/YYYY HH24:MI'),1278.56);
Insert Into flights (flno, origin,destination, distance,departs,arrives,price) values (2,'Los Angeles','Tokyo',5478,to_timestamp('12/04/2005 12:30','DD/MM/YYYY HH24:MI'),to_timestamp('13/04/2005 15:55','DD/MM/YYYY HH24:MI'),780.99);
Insert Into flights (flno, origin,destination, distance,departs,arrives,price) values (33,'Los Angeles','Honolulu',2551,to_timestamp('12/04/2005 09:15','DD/MM/YYYY HH24:MI'),to_timestamp('12/04/2005 11:15','DD/MM/YYYY HH24:MI'),375.23);
Insert Into flights (flno, origin,destination, distance,departs,arrives,price) values (34,'Los Angeles','Honolulu',2551,to_timestamp('12/04/2005 12:45','DD/MM/YYYY HH24:MI'),to_timestamp('12/04/2005 15:18','DD/MM/YYYY HH24:MI'),425.98);
Insert Into flights (flno, origin,destination, distance,departs,arrives,price) values (76,'Chicago','Los Angeles',1749,to_timestamp('12/04/2005 08:32','DD/MM/YYYY HH24:MI'),to_timestamp('12/04/2005 10:03','DD/MM/YYYY HH24:MI'),220.98);
Insert Into flights (flno, origin,destination, distance,departs,arrives,price) values (68,'Chicago','New York',802,to_timestamp('12/04/2005 09:00','DD/MM/YYYY HH24:MI'),to_timestamp('12/04/2005 12:02','DD/MM/YYYY HH24:MI'),202.45);
Insert Into flights (flno, origin,destination, distance,departs,arrives,price) values (7789,'Madison','Detroit',319,to_timestamp('12/04/2005 06:15','DD/MM/YYYY HH24:MI'),to_timestamp('12/04/2005 08:19','DD/MM/YYYY HH24:MI'),120.33);
Insert Into flights (flno, origin,destination, distance,departs,arrives,price) values (701,'Detroit','New York',470,to_timestamp('12/04/2005 08:55','DD/MM/YYYY HH24:MI'),to_timestamp('12/04/2005 10:26','DD/MM/YYYY HH24:MI'),180.56);
Insert Into flights (flno, origin,destination, distance,departs,arrives,price) values (702,'Madison','New York',789,to_timestamp('12/04/2005 07:05','DD/MM/YYYY HH24:MI'),to_timestamp('12/04/2005 10:12','DD/MM/YYYY HH24:MI'),202.34);
Insert Into flights (flno, origin,destination, distance,departs,arrives,price) values (4884,'Madison','Chicago',84,to_timestamp('12/04/2005 22:12','DD/MM/YYYY HH24:MI'),to_timestamp('12/04/2005 23:02','DD/MM/YYYY HH24:MI'),112.45);
Insert Into flights (flno, origin,destination, distance,departs,arrives,price) values (2223,'Madison','Pittsburgh',517,to_timestamp('12/04/2005 08:02','DD/MM/YYYY HH24:MI'),to_timestamp('12/04/2005 10:01','DD/MM/YYYY HH24:MI'),189.98);
Insert Into flights (flno, origin,destination, distance,departs,arrives,price) values (5694,'Madison','Minneapolis',247,to_timestamp('12/04/2005 08:32','DD/MM/YYYY HH24:MI'),to_timestamp('12/04/2005 09:33','DD/MM/YYYY HH24:MI'),120.11);
Insert Into flights (flno, origin,destination, distance,departs,arrives,price) values (304,'Minneapolis','New York',991,to_timestamp('12/04/2005 10:00','DD/MM/YYYY HH24:MI'),to_timestamp('12/04/2005 01:39','DD/MM/YYYY HH24:MI'),101.56);
Insert Into flights (flno, origin,destination, distance,departs,arrives,price) values (149,'Pittsburgh','New York',303,to_timestamp('12/04/2005 09:42','DD/MM/YYYY HH24:MI'),to_timestamp('12/04/2005 12:09','DD/MM/YYYY HH24:MI'),116.5);


Insert Into aircraft (aid, aname, cruisingrange) values (1,'Boeing 747-400',8430);
Insert Into aircraft (aid, aname, cruisingrange) values (2,'Boeing 737-800',3383);
Insert Into aircraft (aid, aname, cruisingrange) values (3,'Airbus A340-300',7120);
Insert Into aircraft (aid, aname, cruisingrange) values (4,'British Aerospace Jetstream 41',1502);
Insert Into aircraft (aid, aname, cruisingrange) values (5,'Embraer ERJ-145',1530);
Insert Into aircraft (aid, aname, cruisingrange) values (6,'SAAB 340',2128);
Insert Into aircraft (aid, aname, cruisingrange) values (7,'Piper Archer III',520);
Insert Into aircraft (aid, aname, cruisingrange) values (8,'Tupolev 154',4103);
Insert Into aircraft (aid, aname, cruisingrange) values (16,'Schwitzer 2-33',30);
Insert Into aircraft (aid, aname, cruisingrange) values (9,'Lockheed L1011',6900);
Insert Into aircraft (aid, aname, cruisingrange) values (10,'Boeing 757-300',4010);
Insert Into aircraft (aid, aname, cruisingrange) values (11,'Boeing 777-300',6441);
Insert Into aircraft (aid, aname, cruisingrange) values (12,'Boeing 767-400ER',6475);
Insert Into aircraft (aid, aname, cruisingrange) values (13,'Airbus A320',2605);
Insert Into aircraft (aid, aname, cruisingrange) values (14,'Airbus A319',1805);
Insert Into aircraft (aid, aname, cruisingrange) values (15,'Boeing 727',1504);


Insert Into employees (eid, ename, salary) values (242518965,'James Smith',120433);
Insert Into employees (eid, ename, salary) values (141582651,'Mary Johnson',178345);
Insert Into employees (eid, ename, salary) values (11564812,'John Williams',153972);
Insert Into employees (eid, ename, salary) values (567354612,'Lisa Walker',256481);
Insert Into employees (eid, ename, salary) values (552455318,'Larry West',101745);
Insert Into employees (eid, ename, salary) values (550156548,'Karen Scott',205187);
Insert Into employees (eid, ename, salary) values (390487451,'Lawrence Sperry',212156);
Insert Into employees (eid, ename, salary) values (274878974,'Michael Miller',99890);
Insert Into employees (eid, ename, salary) values (254099823,'Patricia Jones',24450);
Insert Into employees (eid, ename, salary) values (356187925,'Robert Brown',44740);
Insert Into employees (eid, ename, salary) values (355548984,'Angela Martinez',212156);
Insert Into employees (eid, ename, salary) values (310454876,'Joseph Thompson',212156);
Insert Into employees (eid, ename, salary) values (489456522,'Linda Davis',27984);
Insert Into employees (eid, ename, salary) values (489221823,'Richard Jackson',23980);
Insert Into employees (eid, ename, salary) values (548977562,'William Ward',84476);
Insert Into employees (eid, ename, salary) values (310454877,'Chad Stewart',33546);
Insert Into employees (eid, ename, salary) values (142519864,'Betty Adams',227489);
Insert Into employees (eid, ename, salary) values (269734834,'George Wright',289950);
Insert Into employees (eid, ename, salary) values (287321212,'Michael Miller',48090);
Insert Into employees (eid, ename, salary) values (552455348,'Dorthy Lewis',152013);
Insert Into employees (eid, ename, salary) values (248965255,'Barbara Wilson',43723);
Insert Into employees (eid, ename, salary) values (159542516,'William Moore',48250);
Insert Into employees (eid, ename, salary) values (348121549,'Haywood Kelly',32899);
Insert Into employees (eid, ename, salary) values (90873519,'Elizabeth Taylor',32021);
Insert Into employees (eid, ename, salary) values (486512566,'David Anderson',43001);
Insert Into employees (eid, ename, salary) values (619023588,'Jennifer Thomas',54921);
Insert Into employees (eid, ename, salary) values (15645489,'Donald King',18050);
Insert Into employees (eid, ename, salary) values (556784565,'Mark Young',205187);
Insert Into employees (eid, ename, salary) values (573284895,'Eric Cooper',114323);
Insert Into employees (eid, ename, salary) values (574489456,'William Jones',105743);
Insert Into employees (eid, ename, salary) values (574489457,'Milo Brooks',20);


Insert Into certified (eid, aid) values (567354612,1);
Insert Into certified (eid, aid) values (567354612,2);
Insert Into certified (eid, aid) values (567354612,10);
Insert Into certified (eid, aid) values (567354612,11);
Insert Into certified (eid, aid) values (567354612,12);
Insert Into certified (eid, aid) values (567354612,15);
Insert Into certified (eid, aid) values (567354612,7);
Insert Into certified (eid, aid) values (567354612,9);
Insert Into certified (eid, aid) values (567354612,3);
Insert Into certified (eid, aid) values (567354612,4);
Insert Into certified (eid, aid) values (567354612,5);
Insert Into certified (eid, aid) values (552455318,2);
Insert Into certified (eid, aid) values (552455318,14);
Insert Into certified (eid, aid) values (550156548,1);
Insert Into certified (eid, aid) values (550156548,12);
Insert Into certified (eid, aid) values (390487451,3);
Insert Into certified (eid, aid) values (390487451,13);
Insert Into certified (eid, aid) values (390487451,14);
Insert Into certified (eid, aid) values (274878974,10);
Insert Into certified (eid, aid) values (274878974,12);
Insert Into certified (eid, aid) values (355548984,8);
Insert Into certified (eid, aid) values (355548984,9);
Insert Into certified (eid, aid) values (310454876,8);
Insert Into certified (eid, aid) values (310454876,9);
Insert Into certified (eid, aid) values (548977562,7);
Insert Into certified (eid, aid) values (142519864,1);
Insert Into certified (eid, aid) values (142519864,11);
Insert Into certified (eid, aid) values (142519864,12);
Insert Into certified (eid, aid) values (142519864,10);
Insert Into certified (eid, aid) values (142519864,3);
Insert Into certified (eid, aid) values (142519864,2);
Insert Into certified (eid, aid) values (142519864,13);
Insert Into certified (eid, aid) values (142519864,7);
Insert Into certified (eid, aid) values (269734834,1);
Insert Into certified (eid, aid) values (269734834,2);
Insert Into certified (eid, aid) values (269734834,3);
Insert Into certified (eid, aid) values (269734834,4);
Insert Into certified (eid, aid) values (269734834,5);
Insert Into certified (eid, aid) values (269734834,6);
Insert Into certified (eid, aid) values (269734834,7);
Insert Into certified (eid, aid) values (269734834,8);
Insert Into certified (eid, aid) values (269734834,9);
Insert Into certified (eid, aid) values (269734834,10);
Insert Into certified (eid, aid) values (269734834,11);
Insert Into certified (eid, aid) values (269734834,12);
Insert Into certified (eid, aid) values (269734834,13);
Insert Into certified (eid, aid) values (269734834,14);
Insert Into certified (eid, aid) values (269734834,15);
Insert Into certified (eid, aid) values (552455318,7);
Insert Into certified (eid, aid) values (556784565,5);
Insert Into certified (eid, aid) values (556784565,2);
Insert Into certified (eid, aid) values (556784565,3);
Insert Into certified (eid, aid) values (573284895,3);
Insert Into certified (eid, aid) values (573284895,4);
Insert Into certified (eid, aid) values (573284895,5);
Insert Into certified (eid, aid) values (574489456,8);
Insert Into certified (eid, aid) values (574489456,6);
Insert Into certified (eid, aid) values (574489457,7);
Insert Into certified (eid, aid) values (242518965,2);
Insert Into certified (eid, aid) values (242518965,10);
Insert Into certified (eid, aid) values (141582651,2);
Insert Into certified (eid, aid) values (141582651,10);
Insert Into certified (eid, aid) values (141582651,12);
Insert Into certified (eid, aid) values (11564812,2);
Insert Into certified (eid, aid) values (11564812,10);
Insert Into certified (eid, aid) values (356187925,6);
Insert Into certified (eid, aid) values (159542516,5);
Insert Into certified (eid, aid) values (159542516,7);
Insert Into certified (eid, aid) values (90873519,6);


Insert Into suppliers (sid, sname, address) values  (1,'Acme Widget Suppliers','1 Grub St., Potemkin Village, IL 61801');
Insert Into suppliers (sid, sname, address) values  (2,'Big Red Tool and Die','4 My Way, Bermuda Shorts, OR 90305');
Insert Into suppliers (sid, sname, address) values  (3,'Perfunctory Parts','99999 Short Pier, Ter Del Fuego TX 41299');
Insert Into suppliers (sid, sname, address) values  (4,'Alien Aircaft Inc.','2 Groom Lake, Rachel, NV 51902');


Insert Into parts (pid, pname, color) values (1,'Left Handed Bacon Stretcher Cover','Red');
Insert Into parts (pid, pname, color) values (2,'Smoke Shifter End','Black');
Insert Into parts (pid, pname, color) values (3,'Acme Widget Washer','Red');
Insert Into parts (pid, pname, color) values (4,'Acme Widget Washer','Silver');
Insert Into parts (pid, pname, color) values (5,'I Brake for Crop Circles Sticker','Translucent');
Insert Into parts (pid, pname, color) values (6,'Anti-Gravity Turbine Generator','Cyan');
Insert Into parts (pid, pname, color) values (7,'Anti-Gravity Turbine Generator','Magenta');
Insert Into parts (pid, pname, color) values (8,'Fire Hydrant Cap','Red');
Insert Into parts (pid, pname, color) values (9,'7 Segment Display','Green');


Insert Into catalog (sid, pid, cost) values (1,1,36.1);
Insert Into catalog (sid, pid, cost) values (1,2,42.3);
Insert Into catalog (sid, pid, cost) values (1,3,15.3);
Insert Into catalog (sid, pid, cost) values (1,4,20.5);
Insert Into catalog (sid, pid, cost) values (1,5,20.5);
Insert Into catalog (sid, pid, cost) values (1,6,124.23);
Insert Into catalog (sid, pid, cost) values (1,7,124.23);
Insert Into catalog (sid, pid, cost) values (1,8,11.7);
Insert Into catalog (sid, pid, cost) values (1,9,75.2);
Insert Into catalog (sid, pid, cost) values (2,1,16.5);
Insert Into catalog (sid, pid, cost) values (2,7,0.55);
Insert Into catalog (sid, pid, cost) values (2,8,7.95);
Insert Into catalog (sid, pid, cost) values (3,8,12.5);
Insert Into catalog (sid, pid, cost) values (3,9,1);
Insert Into catalog (sid, pid, cost) values (4,4,57.3);
Insert Into catalog (sid, pid, cost) values (4,5,22.2);
Insert Into catalog (sid, pid, cost) values (4,8,48.6);

commit;
