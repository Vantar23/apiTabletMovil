import { Router } from 'express';
import { pool } from '../db.js';  // Importa el pool de conexiones

const router = Router();

router.get('/create-tables', async (req, res) => {
    try {
        // Crear la tabla de procesos
        const alterProcesosTable = `
            ALTER TABLE procesos
            MODIFY COLUMN resolucion VARCHAR(255);
        `;
        // Ejecutar las consultas para crear las tablas
        await pool.query(alterProcesosTable);

        res.status(200).json({ message: "Tablas 'procesos' y 'subprocesos' creadas o ya existentes" });
    } catch (error) {
        console.error("Error al crear las tablas:", error);
        res.status(500).json({ message: "Error al crear las tablas", error });
    }
});

export default router;
