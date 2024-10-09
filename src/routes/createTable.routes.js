import { Router } from 'express';
import { pool } from '../db.js';  // Asegúrate de que la conexión a la base de datos esté correctamente exportada

const router = Router();

// Función para eliminar columnas de la tabla sensores
router.get('/elimina-columnas', async (req, res) => {
    try {
        // Consulta para eliminar las columnas especificadas
        const query = `
            ALTER TABLE sensores
            DROP COLUMN temp_inicial,
            DROP COLUMN temp_final,
            DROP COLUMN humedad_relativa_inicial,
            DROP COLUMN humedad_relativa_final,
            DROP COLUMN presion_atmosferica,
            DROP COLUMN numero_informe,
            DROP COLUMN serie
        `;

        // Ejecutar la consulta
        await pool.query(query);

        // Enviar respuesta de éxito
        res.status(200).json({ message: 'Las columnas especificadas han sido eliminadas con éxito.' });
    } catch (error) {
        console.error('Error al eliminar las columnas:', error);
        res.status(500).json({ message: 'Error al eliminar las columnas', error });
    }
});

export default router;
