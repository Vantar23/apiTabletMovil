import { Router } from 'express';
import { pool } from '../db.js';  // Importa el pool de conexiones

const router = Router();

router.get('/create-tables', async (req, res) => {
    try {

        // Crear la tabla de subprocesos con una relación a la tabla de procesos
        const createSubprocesosTable = `
            CREATE TABLE IF NOT EXISTS subprocesos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(255),
                descripcion VARCHAR(255),
                proceso_id INT,  -- Llave foránea que referencia a la tabla procesos
                valor_referencia DECIMAL(5, 2),  -- Valor de referencia con 2 decimales
                incertidumbre_patron DECIMAL(7, 4),  -- Incertidumbre patrón con 4 decimales
                FOREIGN KEY (proceso_id) REFERENCES procesos(id) ON DELETE CASCADE
            );
        `;

        // Ejecutar la consulta para crear las tablas
        await pool.query(createProcesosTable);
        await pool.query(createSubprocesosTable);

        res.status(200).json({ message: "Tablas 'procesos' y 'subprocesos' creadas o ya existentes" });
    } catch (error) {
        console.error("Error al crear las tablas:", error);
        res.status(500).json({ message: "Error al crear las tablas", error });
    }
});

export default router;
