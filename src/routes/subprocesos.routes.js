import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// Validación para verificar si el valor está dentro del rango
const isInRange = (value, min, max) => {
    return value >= min && value <= max;
};

// Crear un subproceso asociado a un proceso específico
router.post('/processes/:proceso_id/subprocesses', async (req, res) => {
    const { proceso_id } = req.params;
    const { nombre, descripcion, valor_referencia, incertidumbre_patron, estatus } = req.body;

    // Validaciones de campos requeridos
    if (!nombre) {
        return res.status(400).json({ message: 'Favor de llenar el campo nombre' });
    }
    if (!descripcion) {
        return res.status(400).json({ message: 'Favor de llenar el campo descripcion' });
    }
    if (!valor_referencia) {
        return res.status(400).json({ message: 'Favor de llenar el campo valor_referencia' });
    }
    if (!incertidumbre_patron) {
        return res.status(400).json({ message: 'Favor de llenar el campo incertidumbre_patron' });
    }

    // Validar que incertidumbre_patron esté en el rango permitido (ajusta los valores de min y max según tu base de datos)
    const incertidumbreMin = 0;  // Mínimo permitido (ajústalo según sea necesario)
    const incertidumbreMax = 9999;  // Máximo permitido (ajústalo según sea necesario)
    
    if (!isInRange(incertidumbre_patron, incertidumbreMin, incertidumbreMax)) {
        return res.status(400).json({ 
            message: `El campo incertidumbre_patron debe estar entre ${incertidumbreMin} y ${incertidumbreMax}` 
        });
    }

    // Si no se proporciona estatus, asignar el valor 0
    const estatusFinal = estatus !== undefined ? estatus : 0;

    try {
        const result = await pool.query(
            'INSERT INTO subprocesos (nombre, descripcion, proceso_id, valor_referencia, incertidumbre_patron, estatus) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre, descripcion, proceso_id, valor_referencia, incertidumbre_patron, estatusFinal]
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
    const { nombre, descripcion, valor_referencia, incertidumbre_patron, estatus } = req.body;

    // Validaciones de campos requeridos
    if (!nombre) {
        return res.status(400).json({ message: 'Favor de llenar el campo nombre' });
    }
    if (!descripcion) {
        return res.status(400).json({ message: 'Favor de llenar el campo descripcion' });
    }
    if (!valor_referencia) {
        return res.status(400).json({ message: 'Favor de llenar el campo valor_referencia' });
    }
    if (!incertidumbre_patron) {
        return res.status(400).json({ message: 'Favor de llenar el campo incertidumbre_patron' });
    }

    // Validar que incertidumbre_patron esté en el rango permitido
    if (!isInRange(incertidumbre_patron, incertidumbreMin, incertidumbreMax)) {
        return res.status(400).json({ 
            message: `El campo incertidumbre_patron debe estar entre ${incertidumbreMin} y ${incertidumbreMax}` 
        });
    }

    try {
        // Si no se pasa el estatus en la petición, se conserva el estatus actual del subproceso
        let currentEstatus;
        if (estatus === undefined) {
            // Obtener el estatus actual del subproceso
            const [rows] = await pool.query('SELECT estatus FROM subprocesos WHERE id = ?', [id]);
            if (rows.length === 0) {
                return res.status(404).json({ message: 'Subproceso no encontrado' });
            }
            currentEstatus = rows[0].estatus;
        } else {
            currentEstatus = estatus;
        }

        // Actualizar el subproceso
        const result = await pool.query(
            'UPDATE subprocesos SET nombre = ?, descripcion = ?, valor_referencia = ?, incertidumbre_patron = ?, estatus = ? WHERE id = ?',
            [nombre, descripcion, valor_referencia, incertidumbre_patron, currentEstatus, id]
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

export default router;
