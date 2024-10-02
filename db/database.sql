CREATE DATABASE TabletMovildb;

use TabletMovildb;

CREATE TABLE procesos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255),
    descripcion VARCHAR(255),
    estandar VARCHAR(255),
    marca VARCHAR(255),
    modelo VARCHAR(255),
    serie VARCHAR(255),
    resolucion DECIMAL(10, 2),
    intervalo_indicacion VARCHAR(255),
    calibrado_patron VARCHAR(255),
    prox_calibracion_patron VARCHAR(255)
);
