import { Router } from 'express';
import { pool } from '../db.js';  // Asegúrate de que la conexión a la base de datos esté correctamente exportada

const router = Router();

// Limpiar las tablas procesos, subprocesos y sensores
router.get('/clean-database', async (req, res) => {
    try {
        // Eliminar registros de la tabla de sensores
        await pool.query('DELETE FROM sensores');

        // Eliminar registros de la tabla de subprocesos
        await pool.query('DELETE FROM subprocesos');

        // Eliminar registros de la tabla de procesos
        await pool.query('DELETE FROM procesos');

        res.status(200).json({ message: 'Las tablas procesos, subprocesos y sensores han sido limpiadas con éxito.' });
    } catch (error) {
        console.error('Error al limpiar las tablas:', error);
        res.status(500).json({ message: 'Error al limpiar las tablas', error });
    }
});

export default router;
