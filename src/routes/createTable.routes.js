import { Router } from 'express';
import { pool } from '../db.js';  // Importa el pool de conexiones

const router = Router();

router.get('/create-table', async (req, res) => {
    try {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS procesos (
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
        `;

        // Ejecutar la consulta para crear la tabla
        const [result] = await pool.query(createTableQuery);
        res.status(200).json({ message: "Tabla 'procesos' creada o ya existente", result });
    } catch (error) {
        console.error("Error al crear la tabla:", error);
        res.status(500).json({ message: "Error al crear la tabla", error });
    }
});

export default router;
