import { Router } from 'express';
import { pool } from '../db.js';  // Importa el pool de conexiones

const router = Router();

router.get('/alter-subprocesos-table', async (req, res) => {
    try {
        // Alterar la tabla de subprocesos para agregar la columna estatus como VARCHAR(255)
        const alterSubprocesosTable = `
            ALTER TABLE subprocesos
            ADD COLUMN estatus VARCHAR(255);
        `;

        // Ejecutar la consulta para alterar la tabla
        await pool.query(alterSubprocesosTable);

        res.status(200).json({ message: "La tabla 'subprocesos' fue alterada exitosamente para agregar la columna 'estatus' como VARCHAR(255)." });
    } catch (error) {
        console.error("Error al alterar la tabla 'subprocesos':", error);
        res.status(500).json({ message: "Error al alterar la tabla 'subprocesos'", error });
    }
});

export default router;
