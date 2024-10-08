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

    // Verificación de campos faltantes
    if (!nombre) {
        return res.status(400).json({ message: 'Favor de llenar el campo nombre' });
    }
    if (!descripcion) {
        return res.status(400).json({ message: 'Favor de llenar el campo descripcion' });
    }
    if (!estandar) {
        return res.status(400).json({ message: 'Favor de llenar el campo estandar' });
    }
    if (!marca) {
        return res.status(400).json({ message: 'Favor de llenar el campo marca' });
    }
    if (!modelo) {
        return res.status(400).json({ message: 'Favor de llenar el campo modelo' });
    }
    if (!serie) {
        return res.status(400).json({ message: 'Favor de llenar el campo serie' });
    }
    if (!resolucion) {
        return res.status(400).json({ message: 'Favor de llenar el campo resolucion' });
    }
    if (!intervalo_indicacion) {
        return res.status(400).json({ message: 'Favor de llenar el campo intervalo_indicacion' });
    }
    if (!calibrado_patron) {
        return res.status(400).json({ message: 'Favor de llenar el campo calibrado_patron' });
    }
    if (!prox_calibracion_patron) {
        return res.status(400).json({ message: 'Favor de llenar el campo prox_calibracion_patron' });
    }
    if (!fecha_verificacion) {
        return res.status(400).json({ message: 'Favor de llenar el campo fecha_verificacion' });
    }
    if (!proxima_verificacion) {
        return res.status(400).json({ message: 'Favor de llenar el campo proxima_verificacion' });
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

    // Verificación de campos faltantes
    if (!nombre) {
        return res.status(400).json({ message: 'Favor de llenar el campo nombre' });
    }
    if (!descripcion) {
        return res.status(400).json({ message: 'Favor de llenar el campo descripcion' });
    }
    if (!estandar) {
        return res.status(400).json({ message: 'Favor de llenar el campo estandar' });
    }
    if (!marca) {
        return res.status(400).json({ message: 'Favor de llenar el campo marca' });
    }
    if (!modelo) {
        return res.status(400).json({ message: 'Favor de llenar el campo modelo' });
    }
    if (!serie) {
        return res.status(400).json({ message: 'Favor de llenar el campo serie' });
    }
    if (!resolucion) {
        return res.status(400).json({ message: 'Favor de llenar el campo resolucion' });
    }
    if (!intervalo_indicacion) {
        return res.status(400).json({ message: 'Favor de llenar el campo intervalo_indicacion' });
    }
    if (!calibrado_patron) {
        return res.status(400).json({ message: 'Favor de llenar el campo calibrado_patron' });
    }
    if (!prox_calibracion_patron) {
        return res.status(400).json({ message: 'Favor de llenar el campo prox_calibracion_patron' });
    }
    if (!fecha_verificacion) {
        return res.status(400).json({ message: 'Favor de llenar el campo fecha_verificacion' });
    }
    if (!proxima_verificacion) {
        return res.status(400).json({ message: 'Favor de llenar el campo proxima_verificacion' });
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
