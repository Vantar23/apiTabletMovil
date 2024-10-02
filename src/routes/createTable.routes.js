import { Router } from 'express';
import { pool } from '../db.js';  // Importa el pool de conexiones

const router = Router();

router.get('/alter-sensores-table', async (req, res) => {
    try {
        // Alterar la tabla de sensores para que todos los campos sean VARCHAR(255)
        const alterSensoresTable = `
            ALTER TABLE sensores
            MODIFY COLUMN nombre_sensor VARCHAR(255),
            MODIFY COLUMN mac_address VARCHAR(255),
            MODIFY COLUMN instrumento VARCHAR(255),
            MODIFY COLUMN marca VARCHAR(255),
            MODIFY COLUMN modelo VARCHAR(255),
            MODIFY COLUMN serie VARCHAR(255),
            MODIFY COLUMN resolucion VARCHAR(255),
            MODIFY COLUMN intervalo_indicacion VARCHAR(255),
            MODIFY COLUMN emp VARCHAR(255),
            MODIFY COLUMN temp_inicial VARCHAR(255),
            MODIFY COLUMN temp_final VARCHAR(255),
            MODIFY COLUMN humedad_relativa_inicial VARCHAR(255),
            MODIFY COLUMN humedad_relativa_final VARCHAR(255),
            MODIFY COLUMN presion_atmosferica VARCHAR(255),
            MODIFY COLUMN numero_informe VARCHAR(255);
        `;

        // Ejecutar la consulta para alterar la tabla
        await pool.query(alterSensoresTable);

        res.status(200).json({ message: "La tabla 'sensores' fue alterada exitosamente para que todas las columnas sean VARCHAR(255)." });
    } catch (error) {
        console.error("Error al alterar la tabla 'sensores':", error);
        res.status(500).json({ message: "Error al alterar la tabla 'sensores'", error });
    }
});

export default router;
