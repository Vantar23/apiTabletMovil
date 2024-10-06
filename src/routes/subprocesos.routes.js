import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// Obtener todos los subprocesos sin filtrar por proceso
router.get('/subprocesses', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM subprocesos');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener todos los subprocesos:', error);
        res.status(500).json({ message: 'Error al obtener los subprocesos' });
    }
});

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

// Obtener un subproceso por su ID único
router.get('/subprocesses/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM subprocesos WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Subproceso no encontrado' });
        }
        res.json(rows[0]); // Devolver solo el primer resultado, ya que el id es único
    } catch (error) {
        console.error('Error al obtener el subproceso:', error);
        res.status(500).json({ message: 'Error al obtener el subproceso' });
    }
});

// Crear un subproceso asociado a un proceso específico
router.post('/processes/:proceso_id/subprocesses', async (req, res) => {
    const { proceso_id } = req.params;
    const { nombre, descripcion, valor_referencia, incertidumbre_patron, estatus } = req.body;  // Agregamos estatus al body
    try {
        const result = await pool.query(
            'INSERT INTO subprocesos (nombre, descripcion, proceso_id, valor_referencia, incertidumbre_patron, estatus) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre, descripcion, proceso_id, valor_referencia, incertidumbre_patron, estatus]
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
    const { nombre, descripcion, valor_referencia, incertidumbre_patron, estatus } = req.body;  // Incluimos estatus
    try {
        const result = await pool.query(
            'UPDATE subprocesos SET nombre = ?, descripcion = ?, valor_referencia = ?, incertidumbre_patron = ?, estatus = ? WHERE id = ?',
            [nombre, descripcion, valor_referencia, incertidumbre_patron, estatus, id]
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
