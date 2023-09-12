CREATE DATABASE recipeBuddy;
USE recipeBuddy;
CREATE TABLE foods (id INT AUTO_INCREMENT, name VARCHAR(50), valuesper DECIMAL(5, 2) unsigned, unit VARCHAR(50), carbs DECIMAL(5, 2) unsigned, 
                    fat DECIMAL(5, 2) unsigned, protein DECIMAL(5, 2) unsigned, salt DECIMAL(5, 2) unsigned, sugar DECIMAL(5, 2) unsigned, user VARCHAR(50), PRIMARY KEY(id));
INSERT INTO foods (name, valuesper, unit, carbs, fat, protein, salt, sugar)VALUES('flour', 100, 'gram', 81, 1.4, 9.1, 0.01, 0.6);
CREATE TABLE users (id INT AUTO_INCREMENT, firstname VARCHAR(50), lastname VARCHAR(50), username VARCHAR(50) UNIQUE NOT NULL, hashedpassword varchar(100), 
                    email varchar(50), PRIMARY KEY(id));
CREATE USER 'appuser'@'localhost' IDENTIFIED WITH mysql_native_password BY 'app2027';
GRANT ALL PRIVILEGES ON recipeBuddy.* TO 'appuser'@'localhost';