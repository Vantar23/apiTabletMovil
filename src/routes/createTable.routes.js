import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

router.get('/add-id-proceso-to-sensores', async (req, res) => {
    try {
        const alterSensoresTable = `
            ALTER TABLE sensores 
            ADD COLUMN id_proceso INT,
            ADD CONSTRAINT fk_proceso
            FOREIGN KEY (id_proceso) REFERENCES procesos(id)
            ON DELETE CASCADE;
        `;

        // Ejecutar la consulta para alterar la tabla
        await pool.query(alterSensoresTable);

        res.status(200).json({ message: "La columna 'id_proceso' fue agregada a la tabla 'sensores' con éxito." });
    } catch (error) {
        console.error("Error al agregar la columna 'id_proceso' a la tabla 'sensores':", error);
        res.status(500).json({ message: "Error al agregar la columna 'id_proceso'", error });
    }
});

export default router;
