import { Router } from 'express';
import { pool } from '../db.js';  // Asegúrate de que la conexión a la base de datos esté correctamente exportada

const router = Router();

// Obtener todos los procesos
router.get('/processes', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM procesos');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener los procesos:', error);
        res.status(500).json({ message: 'Error al obtener los procesos' });
    }
});

// Obtener los ids y nombres de los procesos
router.get('/processes/names', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, nombre FROM procesos');
        res.json(rows);  // Devuelve los ids y nombres
    } catch (error) {
        console.error('Error al obtener los nombres de los procesos:', error);
        res.status(500).json({ message: 'Error al obtener los nombres' });
    }
});

// Crear un nuevo proceso
router.post('/processes', async (req, res) => {
    const { nombre, descripcion, estandar, marca, modelo, serie, resolucion, intervalo_indicacion, calibrado_patron, prox_calibracion_patron, fecha_verificacion, proxima_verificacion } = req.body;
    try {
        const result = await pool.query('INSERT INTO procesos (nombre, descripcion, estandar, marca, modelo, serie, resolucion, intervalo_indicacion, calibrado_patron, prox_calibracion_patron, fecha_verificacion, proxima_verificacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
        [nombre, descripcion, estandar, marca, modelo, serie, resolucion, intervalo_indicacion, calibrado_patron, prox_calibracion_patron, fecha_verificacion, proxima_verificacion]);
        res.json({ id: result.insertId, message: 'Proceso creado con éxito' });
    } catch (error) {
        console.error('Error al crear proceso:', error);
        res.status(500).json({ message: 'Error al crear el proceso' });
    }
});

// Editar un proceso por ID
router.put('/processes/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, estandar, marca, modelo, serie, resolucion, intervalo_indicacion, calibrado_patron, prox_calibracion_patron } = req.body;
    try {
        const result = await pool.query('UPDATE procesos SET nombre = ?, descripcion = ?, estandar = ?, marca = ?, modelo = ?, serie = ?, resolucion = ?, intervalo_indicacion = ?, calibrado_patron = ?, prox_calibracion_patron = ? WHERE id = ?', 
        [nombre, descripcion, estandar, marca, modelo, serie, resolucion, intervalo_indicacion, calibrado_patron, prox_calibracion_patron, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Proceso no encontrado' });
        }
        res.json({ message: 'Proceso actualizado con éxito' });
    } catch (error) {
        console.error('Error al actualizar el proceso:', error);
        res.status(500).json({ message: 'Error al actualizar el proceso' });
    }
});

// Eliminar un proceso por ID
router.delete('/processes/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM procesos WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Proceso no encontrado' });
        }
        res.json({ message: 'Proceso eliminado con éxito' });
    } catch (error) {
        console.error('Error al eliminar el proceso:', error);
        res.status(500).json({ message: 'Error al eliminar el proceso' });
    }
});

export default router;
