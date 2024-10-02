import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// Ruta para verificar que el servidor y la base de datos están activos
router.get('/ping', async (req, res) => {
    try {
        // Ejecutar la consulta 'SELECT 1 + 1'
        const [result] = await pool.query('SELECT 1 + 1 AS result');
        res.json({ message: 'Pong! El servidor y la base de datos están activos.', resultado: result[0].result });
    } catch (error) {
        console.error('Error en la consulta de ping:', error);
        res.status(500).json({ message: 'Error al realizar el ping a la base de datos.' });
    }
});

export default router;
