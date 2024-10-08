import { Router } from 'express';
import { pool } from '../db.js';  // Asegúrate de que la conexión a la base de datos esté correctamente exportada

const router = Router();

// Obtener todos los procesos
router.get('/processes', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM procesos');
        if (rows.length === 0) {
            return res.status(204).json({ message: 'No hay procesos disponibles' });  // 204 No Content
        }
        // Si quieres devolver solo el primer objeto en caso de que sea un solo proceso
        if (rows.length === 1) {
            return res.json(rows[0]);  // Devuelve el único objeto sin []
        }
        // Si hay más de un proceso, devolver todos
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener los procesos:', error);
        res.status(500).json({ message: 'Error al obtener los procesos' });
    }
});

// Obtener un proceso específico por ID
router.get('/processes/:id', async (req, res) => {
    const { id } = req.params;
    if (isNaN(id)) {
        return res.status(400).json({ message: 'ID no válido' });
    }
    try {
        const [rows] = await pool.query('SELECT * FROM procesos WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Proceso no encontrado' });
        }
        res.json(rows[0]);  // Devolver solo el primer (y único) resultado
    } catch (error) {
        console.error('Error al obtener el proceso por ID:', error);
        res.status(500).json({ message: 'Error al obtener el proceso' });
    }
});

// Crear un nuevo proceso
router.post('/processes', async (req, res) => {
    const { nombre, descripcion, estandar, marca, modelo, serie, resolucion, intervalo_indicacion, calibrado_patron, prox_calibracion_patron, fecha_verificacion, proxima_verificacion } = req.body;

    // Verificación de que todos los campos estén presentes
    if (!nombre || !descripcion || !estandar || !marca || !modelo || !serie || !resolucion || !intervalo_indicacion || !calibrado_patron || !prox_calibracion_patron || !fecha_verificacion || !proxima_verificacion) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO procesos (nombre, descripcion, estandar, marca, modelo, serie, resolucion, intervalo_indicacion, calibrado_patron, prox_calibracion_patron, fecha_verificacion, proxima_verificacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
            [nombre, descripcion, estandar, marca, modelo, serie, resolucion, intervalo_indicacion, calibrado_patron, prox_calibracion_patron, fecha_verificacion, proxima_verificacion]
        );
        // Devuelve el ID y el nombre del proceso creado
        res.json({ id: result.insertId, nombre: nombre });
    } catch (error) {
        console.error('Error al crear proceso:', error);
        res.status(500).json({ message: 'Error al crear el proceso' });
    }
});

// Editar un proceso por ID
router.put('/processes/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, estandar, marca, modelo, serie, resolucion, intervalo_indicacion, calibrado_patron, prox_calibracion_patron, fecha_verificacion, proxima_verificacion } = req.body;

    // Verificación de que todos los campos estén presentes
    if (!nombre || !descripcion || !estandar || !marca || !modelo || !serie || !resolucion || !intervalo_indicacion || !calibrado_patron || !prox_calibracion_patron || !fecha_verificacion || !proxima_verificacion) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    try {
        const result = await pool.query(
            'UPDATE procesos SET nombre = ?, descripcion = ?, estandar = ?, marca = ?, modelo = ?, serie = ?, resolucion = ?, intervalo_indicacion = ?, calibrado_patron = ?, prox_calibracion_patron = ?, fecha_verificacion = ?, proxima_verificacion = ? WHERE id = ?', 
            [nombre, descripcion, estandar, marca, modelo, serie, resolucion, intervalo_indicacion, calibrado_patron, prox_calibracion_patron, fecha_verificacion, proxima_verificacion, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Proceso no encontrado' });
        }
        res.json({ message: 'Proceso actualizado con éxito' });
    } catch (error) {
        console.error('Error al actualizar el proceso:', error);
        res.status(500).json({ message: 'Error al actualizar el proceso' });
    }
});

// Eliminar un proceso por ID, junto con los subprocesos y sensores relacionados
router.delete('/processes/:id', async (req, res) => {
    const { id } = req.params;
    if (isNaN(id)) {
        return res.status(400).json({ message: 'ID no válido' });
    }

    try {
        // Primero eliminar los sensores relacionados
        await pool.query('DELETE FROM sensores WHERE id_proceso = ?', [id]);

        // Luego eliminar los subprocesos relacionados
        await pool.query('DELETE FROM subprocesos WHERE proceso_id = ?', [id]);

        // Finalmente, eliminar el proceso en sí
        const result = await pool.query('DELETE FROM procesos WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Proceso no encontrado' });
        }
        res.json({ message: 'Proceso y todos los subprocesos y sensores eliminados con éxito' });
    } catch (error) {
        console.error('Error al eliminar el proceso, subprocesos y sensores:', error);
        res.status(500).json({ message: 'Error al eliminar el proceso, subprocesos y sensores', error });
    }
});

export default router;
