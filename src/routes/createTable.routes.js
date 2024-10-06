import { Router } from 'express';
import { pool } from '../db.js';  // Asegúrate de que la conexión a la base de datos esté correctamente exportada

const router = Router();

// Limpiar las tablas procesos, subprocesos y sensores
router.get('/clean-database', async (req, res) => {
    try {
        // Truncar (limpiar) la tabla de sensores
        await pool.query('TRUNCATE TABLE sensores');

        // Truncar (limpiar) la tabla de subprocesos
        await pool.query('TRUNCATE TABLE subprocesos');

        // Truncar (limpiar) la tabla de procesos
        await pool.query('TRUNCATE TABLE procesos');

        res.status(200).json({ message: 'Las tablas procesos, subprocesos y sensores han sido limpiadas con éxito.' });
    } catch (error) {
        console.error('Error al limpiar las tablas:', error);
        res.status(500).json({ message: 'Error al limpiar las tablas', error });
    }
});

export default router;
