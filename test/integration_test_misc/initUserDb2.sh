#!/bin/bash
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
	CREATE USER sciencedb WITH SUPERUSER PASSWORD 'sciencedb';
	CREATE DATABASE sciencedb_development OWNER sciencedb;
	CREATE DATABASE sciencedb_test OWNER sciencedb;
	CREATE DATABASE sciencedb_production OWNER sciencedb;
EOSQL
psql -U sciencedb -d sciencedb_development <<-EOSQL
CREATE TABLE trino_doctors (
  doctor_id varchar(255) PRIMARY KEY,
  birthday timestamp,
  experience integer,
  rating float,
  on_holiday boolean,
  speciality text,
  telephone text
);
INSERT INTO trino_doctors (doctor_id, birthday, experience, rating, on_holiday, speciality, telephone) VALUES
    ('d1', '1989-12-03T10:15:30.000Z', 3, 4.9, false, '["Tinnitus","Allergology"]', '[152234,137584]'),
    ('d2', '1977-12-03T10:15:30.000Z', 15, 5.0, false, '["Cardiology","Cardiothoracic Surgery"]', '[142234,127584]'),
    ('d3', '1987-12-03T10:15:30.000Z', 5, 4.8, true, '["Dermatology","Allergology"]', '[162234,177584]'),
    ('d4', '1988-12-03T10:15:30.000Z', 4, 4.9, false, '["Child Psychiatry","Adolescent Psychiatry"]', '[192234,197584]'),
    ('d5', '1986-12-03T10:15:30.000Z', 6, 4.7, true, '["Neurology"]', '[122234,187584]');

CREATE TABLE presto_doctors (
  doctor_id varchar(255) PRIMARY KEY,
  birthday timestamp,
  experience integer,
  rating float,
  on_holiday boolean,
  speciality text,
  telephone text
);
INSERT INTO presto_doctors (doctor_id, birthday, experience, rating, on_holiday, speciality, telephone) VALUES
    ('d1', '1989-12-03T10:15:30.000Z', 3, 4.9, false, '["Tinnitus","Allergology"]', '[152234,137584]'),
    ('d2', '1977-12-03T10:15:30.000Z', 15, 5.0, false, '["Cardiology","Cardiothoracic Surgery"]', '[142234,127584]'),
    ('d3', '1987-12-03T10:15:30.000Z', 5, 4.8, true, '["Dermatology","Allergology"]', '[162234,177584]'),
    ('d4', '1988-12-03T10:15:30.000Z', 4, 4.9, false, '["Child Psychiatry","Adolescent Psychiatry"]', '[192234,197584]'),
    ('d5', '1986-12-03T10:15:30.000Z', 6, 4.7, true, '["Neurology"]', '[122234,187584]');

CREATE TABLE dist_trino_doctors (
  doctor_id varchar(255) PRIMARY KEY,
  birthday timestamp,
  experience integer,
  rating float,
  on_holiday boolean,
  speciality text,
  telephone text
);
INSERT INTO dist_trino_doctors (doctor_id, birthday, experience, rating, on_holiday, speciality, telephone) VALUES
    ('instance1-d1', '1989-12-03T10:15:30.000Z', 3, 4.9, false, '["Tinnitus","Allergology"]', '[152234,137584]'),
    ('instance1-d2', '1977-12-03T10:15:30.000Z', 15, 5.0, false, '["Cardiology","Cardiothoracic Surgery"]', '[142234,127584]'),
    ('instance1-d3', '1987-12-03T10:15:30.000Z', 5, 4.8, true, '["Dermatology","Allergology"]', '[162234,177584]'),
    ('instance1-d4', '1988-12-03T10:15:30.000Z', 4, 4.9, false, '["Child Psychiatry","Adolescent Psychiatry"]', '[192234,197584]'),
    ('instance1-d5', '1986-12-03T10:15:30.000Z', 6, 4.7, true, '["Neurology"]', '[122234,187584]');

CREATE TABLE dist_presto_doctors (
  doctor_id varchar(255) PRIMARY KEY,
  birthday timestamp,
  experience integer,
  rating float,
  on_holiday boolean,
  speciality text,
  telephone text
);
INSERT INTO dist_presto_doctors (doctor_id, birthday, experience, rating, on_holiday, speciality, telephone) VALUES
    ('instance1-d1', '1989-12-03T10:15:30.000Z', 3, 4.9, false, '["Tinnitus","Allergology"]', '[152234,137584]'),
    ('instance1-d2', '1977-12-03T10:15:30.000Z', 15, 5.0, false, '["Cardiology","Cardiothoracic Surgery"]', '[142234,127584]'),
    ('instance1-d3', '1987-12-03T10:15:30.000Z', 5, 4.8, true, '["Dermatology","Allergology"]', '[162234,177584]'),
    ('instance1-d4', '1988-12-03T10:15:30.000Z', 4, 4.9, false, '["Child Psychiatry","Adolescent Psychiatry"]', '[192234,197584]'),
    ('instance1-d5', '1986-12-03T10:15:30.000Z', 6, 4.7, true, '["Neurology"]', '[122234,187584]');
EOSQL