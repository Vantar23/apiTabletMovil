import { Router } from 'express';
import { pool } from '../db.js';  // Importa el pool de conexiones

const router = Router();

router.get('/create-tables', async (req, res) => {
    try {
        // Crear la tabla de sensores
        const createSensoresTable = `
            CREATE TABLE IF NOT EXISTS sensores (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre_sensor VARCHAR(255),
                mac_address VARCHAR(255),
                instrumento VARCHAR(255),
                marca VARCHAR(255),
                modelo VARCHAR(255),
                serie VARCHAR(255),
                resolucion VARCHAR(255),
                intervalo_indicacion VARCHAR(255),
                emp VARCHAR(255),
                temp_inicial DECIMAL(5,2),
                temp_final DECIMAL(5,2),
                humedad_relativa_inicial DECIMAL(5,2),
                humedad_relativa_final DECIMAL(5,2),
                presion_atmosferica DECIMAL(7,4),
                numero_informe VARCHAR(255)
            );
        `;
        // Ejecutar la consulta para crear la tabla
        await pool.query(createSensoresTable);

        res.status(200).json({ message: "Tabla 'sensores' creada o ya existente" });
    } catch (error) {
        console.error("Error al crear la tabla 'sensores':", error);
        res.status(500).json({ message: "Error al crear la tabla 'sensores'", error });
    }
});

export default router;
