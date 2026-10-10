/**************************************************/
/* ESTRUCTURA Y TABLAS PARA DREAMHOUSE PostgreSQL */
/**************************************************/

/**************************************************/
/* Borrando las tablas para iniciar desde 0       */ 
/*
DROP TABLE Branch;
DROP TABLE Staff;
DROP TABLE Client;
DROP TABLE PropertyForRent;
DROP TABLE PrivateOwner;
DROP TABLE Viewing;
DROP TABLE Registration;
DROP TABLE Lease;
*/
/**************************************************/

/***************************** Branch ***********************************************************/

CREATE TABLE Branch (
  branchNo VARCHAR(5),
  street VARCHAR(25),
  city VARCHAR(15),
  postcode VARCHAR(8)
);


INSERT INTO Branch (branchNo,street,city,postcode)
     VALUES ('B005','22 Deer Rd','London','SW1 AEH');
INSERT INTO Branch (branchNo,street,city,postcode)
     VALUES ('B007','A6 Argyll St','Aberdeen','AB2 3SU');
INSERT INTO Branch (branchNo,street,city,postcode)
     VALUES ('B003','163 Main St','Glasgow','G11 9QX');
INSERT INTO Branch (branchNo,street,city,postcode)
     VALUES ('B004','32 Manse Rd','Bristol','BS99 1NZ');
INSERT INTO Branch (branchNo,street,city,postcode)
    VALUES ('B002','56 Clover Dr','London','NW10 6EU');
/***********************************************************************************************/	
	
	
/***************************** Staff ***********************************************************/	

CREATE TABLE Staff (
  staffNo VARCHAR(5), 
  fname VARCHAR(20), 
  lName VARCHAR(25),
  position VARCHAR(15),
  sex VARCHAR(1),
  DOB DATE,
  salary DECIMAL(7,2),
  branchNo VARCHAR(5)
);

Insert INTO staff (staffNo,fName,lName,position,sex,DOB,salary,branchNo)
            values('SL21','Jhon','White','Manager','M','1-Oct-45',30000,'B005');
Insert INTO staff (staffNo,fName,lName,position,sex,DOB,salary,branchNo)
            values('SG37','Ann','Beech','Assistant','F','10-Nov-60',12000,'B003');
Insert INTO staff (staffNo,fName,lName,position,sex,DOB,salary,branchNo)
            values('SG14','David','Ford','Supervisor','M','24-Mar-58',18000,'B003');
Insert INTO staff (staffNo,fName,lName,position,sex,DOB,salary,branchNo)
            values('SA9','Mary','Howe','Assistant','F','19-Feb-70',9000,'B007');
Insert INTO staff (staffNo,fName,lName,position,sex,DOB,salary,branchNo)
            values('SG5','Susan','Brand','Manager','F','3-Jun-40',24000,'B003');
Insert INTO staff (staffNo,fName,lName,position,sex,DOB,salary,branchNo)
            values('SL41','Julie','Lee','Assistant','F','13-Jun-65',9000,'B005');

/***********************************************************************************************/	


/***************************** Client ***********************************************************/	

CREATE TABLE Client (
  clientNo VARCHAR(5),
  fname VARCHAR(15),
  lname VARCHAR(15),
  telNo VARCHAR(15),
  prefType VARCHAR(15),
  maxRent DECIMAL(7, 0)
);

INSERT INTO Client(clientNo,fName,lName,telNo, prefType,maxRent)
	VALUES('CR76','John','Kay','0207-774-5632','Flat',425);
INSERT INTO Client(clientNo,fName,lName,telNo, prefType,maxRent)  
	VALUES('CR56','Aline','Stewart','0141-848-1825','Flat',350);
INSERT INTO Client(clientNo,fName,lName,telNo, prefType,maxRent)  
	VALUES('CR74','Mike','Ritchie','01475-392178','House',750);
INSERT INTO Client(clientNo,fName,lName,telNo, prefType,maxRent)  
	VALUES('CR62','Mary','Tregear','01224-196720','Flat',600);
/***********************************************************************************************/	

/***************************** propertyforrent ***********************************************************/			

CREATE TABLE PropertyForRent(
  propertyNo VARCHAR(4),
  street VARCHAR(25),
  city VARCHAR(15),
  postcode VARCHAR(8),
  type VARCHAR(15),
  rooms DECIMAL(2,0),
  rent DECIMAL(7,0),
  ownerNo VARCHAR(5),
  staffNo VARCHAR(5),
  branchNo VARCHAR(5)
);

insert into propertyforrent (propertyNo, street, city, postcode, type, rooms, rent, ownerNo, staffNo, branchNo)
       Values ('PA14', '16 Holhead', 'Aberdeen', 'AB7 SSU', 'House', 6, 650, 'CO46', 'SA9', 'B007');
insert into propertyforrent (propertyNo, street, city, postcode, type, rooms, rent, ownerNo, staffNo, branchNo)
       Values ('PL94', '6 Argyll St', 'London', 'NW2', 'Flat', 4, 400, 'CO87', 'SL41', 'B005');	   
insert into propertyforrent (propertyNo, street, city, postcode, type, rooms, rent, ownerNo, staffNo, branchNo)
       Values ('PG4', '6 Lawrence St', 'Glasgow', 'G11 9QX', 'Flat', 3, 350, 'CO40', NULL, 'B003');	   	   
insert into propertyforrent (propertyNo, street, city, postcode, type, rooms, rent, ownerNo, staffNo, branchNo)
       Values ('PG36', '2 Manor Rd', 'Glasgow', 'G32 4QX', 'Flat', 3, 375, 'CO93', 'SG37', 'B003');	   	
insert into propertyforrent (propertyNo, street, city, postcode, type, rooms, rent, ownerNo, staffNo, branchNo)
       Values ('PG21', '18 Dale Rd', 'Glasgow', 'G12', 'House', 5, 600, 'CO87', 'SG37', 'B003');	
insert into propertyforrent (propertyNo, street, city, postcode, type, rooms, rent, ownerNo, staffNo, branchNo)
       Values ('PG16', '5 Novar Dr', 'Glasgow', 'G12 9AX', 'Flat', 4, 450, 'CO93', 'SG14', 'B003');	   
/***********************************************************************************************/	

/***************************** privateowner ***********************************************************/

CREATE TABLE PrivateOwner(
  ownerNo VARCHAR(5),
  fname VARCHAR(20), 
  lName VARCHAR(25),
  address VARCHAR(40),
  telNo VARCHAR(15)
);

INSERT INTO privateowner (ownerNo, fName,lName,address, telNo)
		Values ('CO46','Joe','Keogh', '2 Fergus Dr,Aberdeen AB2 75X', '01224-861212');
INSERT INTO privateowner (ownerNo, fName,lName,address, telNo)
		Values ('CO87', 'Carol', 'Farrel', '6 Achray St, Glasgow G32 9DX', '0141-357-7419');
INSERT INTO privateowner (ownerNo, fName,lName,address, telNo)
		Values ('CO40', 'Tina', 'Murphy', '63 Well St, Glasgow G42', '0141-943-1728');
INSERT INTO privateowner (ownerNo, fName,lName,address, telNo)
		Values ('CO93', 'Tony', 'Shaw', '12 Park Pl, Glasgow G4 0QR', '0141-225-7025');
/***********************************************************************************************/


/***************************** Viewing ***********************************************************/	

CREATE TABLE Viewing (
  clientNo VARCHAR(5),
  propertyNo VARCHAR(5),
  viewDate DATE,
  "comment" VARCHAR(40)
);

INSERT INTO viewing (clientNo, propertyNo, viewDate, "comment")
	VALUES ('CR56', 'PA14', '24-May-04', 'too small');
INSERT INTO viewing (clientNo, propertyNo, viewDate, "comment")
	VALUES ('CR76', 'PG4', '20-Apr-04', 'too remote');
INSERT INTO viewing (clientNo, propertyNo, viewDate, "comment")
	VALUES ('CR56', 'PG4', '26-May-04', NULL);
INSERT INTO viewing (clientNo, propertyNo, viewDate, "comment")
	VALUES ('CR62', 'PA14', '14-May-04', 'no dining room');
INSERT INTO viewing (clientNo, propertyNo, viewDate, "comment")
	VALUES ('CR56', 'PG36', '28-Apr-04', NULL);
/***********************************************************************************************/


/***************************** Registration ***********************************************************/

CREATE TABLE Registration(
  clientNo VARCHAR(5),
  branchNo VARCHAR(5),
  staffNo VARCHAR(5),
  dateJoined DATE
);

INSERT INTO Registration (clientNo, branchNo, staffNo, dateJoined)
	VALUES ('CR76', 'B005', 'SL41', '02-Jan-04');
INSERT INTO Registration (clientNo, branchNo, staffNo, dateJoined)
	VALUES ('CR56', 'B003', 'SG37', '11-Apr-03');
INSERT INTO Registration (clientNo, branchNo, staffNo, dateJoined)
	VALUES ('CR74', 'B003', 'SG37', '16-Nov-02');
INSERT INTO Registration (clientNo, branchNo, staffNo, dateJoined)
	VALUES ('CR62', 'B007', 'SA9', '7-Mar-03');
/***********************************************************************************************/
	
	
/***************************** Lease ***********************************************************/		

CREATE TABLE Lease(
  leaseNo  DECIMAL,
  propertyNo VARCHAR(5),
  clientNo VARCHAR(5),
  rent DECIMAL(7,0),
  paymentMethod VARCHAR(10),
  deposit DECIMAL(7,0),
  paid CHAR(1),
  rentStart DATE,
  rentFinish DATE,
  duration DECIMAL(3,0)
);

Insert INTO lease  (leaseNo, propertyNo, clientNo, rent, paymentMethod, deposit, paid, rentStart, rentFinish, duration) 
       values ('10024', 'PA14', 'CR62', 650, 'visa', 1300, 'Y', '1-jun-05', '31-may-05', 12);
Insert INTO lease  (leaseNo, propertyNo, clientNo, rent, paymentMethod, deposit, paid, rentStart, rentFinish, duration) 
       values ('10075', 'PL94', 'CR76', 400, 'cash', 800, 'N', '1-aug-05', '31-jan-05', 6);
Insert INTO lease  (leaseNo, propertyNo, clientNo, rent, paymentMethod, deposit, paid, rentStart, rentFinish, duration) 
       values ('10012', 'PG21', 'CR74', 600, 'cheque', 1200, 'Y', '1-jul-05', '30-jun-05', 12);
/***********************************************************************************************/