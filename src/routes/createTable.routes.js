import { Router } from 'express';
import { pool } from '../db.js';  // Asegúrate de que la conexión a la base de datos esté correctamente exportada

const router = Router();

router.get('/alter-subprocesos-table', async (req, res) => {
    try {
        // Consulta para eliminar las columnas
        const alterSubprocesosTable = `
            ALTER TABLE subprocesos
            DROP COLUMN fecha_verificacion,
            DROP COLUMN proxima_verificacion;
        `;

        // Ejecutar la consulta para alterar la tabla
        await pool.query(alterSubprocesosTable);

        res.status(200).json({ message: "Las columnas 'fecha_verificacion' y 'proxima_verificacion' fueron eliminadas de la tabla 'subprocesos'." });
    } catch (error) {
        console.error("Error al alterar la tabla 'subprocesos':", error);
        res.status(500).json({ message: "Error al alterar la tabla 'subprocesos'", error });
    }
});

export default router;
