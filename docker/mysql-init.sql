CREATE DATABASE IF NOT EXISTS msc_demo;
CREATE DATABASE IF NOT EXISTS msc_production;
CREATE USER IF NOT EXISTS 'msc_demo_user'@'%' IDENTIFIED BY 'password';
CREATE USER IF NOT EXISTS 'msc_app_user'@'%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON msc_demo.* TO 'msc_demo_user'@'%';
GRANT ALL PRIVILEGES ON msc_production.* TO 'msc_app_user'@'%';
FLUSH PRIVILEGES;
