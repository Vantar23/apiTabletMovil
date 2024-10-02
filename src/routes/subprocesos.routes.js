import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// Obtener todos los subprocesos de un proceso específico
router.get('/processes/:proceso_id/subprocesses', async (req, res) => {
    const { proceso_id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM subprocesos WHERE proceso_id = ?', [proceso_id]);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener los subprocesos:', error);
        res.status(500).json({ message: 'Error al obtener los subprocesos' });
    }
});

// Crear un subproceso asociado a un proceso específico
router.post('/processes/:proceso_id/subprocesses', async (req, res) => {
    const { proceso_id } = req.params;
    const { nombre, descripcion, valor_referencia, incertidumbre_patron } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO subprocesos (nombre, descripcion, proceso_id, valor_referencia, incertidumbre_patron) VALUES (?, ?, ?, ?, ?)',
            [nombre, descripcion, proceso_id, valor_referencia, incertidumbre_patron]
        );
        res.json({ id: result.insertId, message: 'Subproceso creado con éxito' });
    } catch (error) {
        console.error('Error al crear el subproceso:', error);
        res.status(500).json({ message: 'Error al crear el subproceso' });
    }
});

// Editar un subproceso por su ID
router.put('/subprocesses/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, valor_referencia, incertidumbre_patron } = req.body;
    try {
        const result = await pool.query(
            'UPDATE subprocesos SET nombre = ?, descripcion = ?, valor_referencia = ?, incertidumbre_patron = ? WHERE id = ?',
            [nombre, descripcion, valor_referencia, incertidumbre_patron, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Subproceso no encontrado' });
        }
        res.json({ message: 'Subproceso actualizado con éxito' });
    } catch (error) {
        console.error('Error al actualizar el subproceso:', error);
        res.status(500).json({ message: 'Error al actualizar el subproceso' });
    }
});

// Eliminar un subproceso por su ID
router.delete('/subprocesses/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM subprocesos WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Subproceso no encontrado' });
        }
        res.json({ message: 'Subproceso eliminado con éxito' });
    } catch (error) {
        console.error('Error al eliminar el subproceso:', error);
        res.status(500).json({ message: 'Error al eliminar el subproceso' });
    }
});

export default router;
