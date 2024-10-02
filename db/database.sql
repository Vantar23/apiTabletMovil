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

CREATE TABLE subprocesos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255),
    descripcion VARCHAR(255),
    proceso_id INT,  -- Llave foránea que referencia a la tabla procesos
    valor_referencia DECIMAL(5, 2),  -- Valor de referencia con 2 decimales
    incertidumbre_patron DECIMAL(7, 4),  -- Incertidumbre patrón con 4 decimales
    FOREIGN KEY (proceso_id) REFERENCES procesos(id) ON DELETE CASCADE
);