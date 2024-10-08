import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// Funciones para validar el formato numérico con decimales
const isTwoDecimalNumber = (value) => /^-?\d+(\.\d{1,2})?$/.test(value);  // Acepta hasta 2 decimales
const isFourDecimalNumber = (value) => /^-?\d+(\.\d{1,4})?$/.test(value);  // Acepta hasta 4 decimales

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

    // Validar que valor_referencia sea un número con 2 decimales
    if (!isTwoDecimalNumber(valor_referencia)) {
        return res.status(400).json({ message: 'El valor de referencia debe ser un número con hasta 2 decimales' });
    }

    // Validar que incertidumbre_patron sea un número con 4 decimales
    if (!isFourDecimalNumber(incertidumbre_patron)) {
        return res.status(400).json({ message: 'La incertidumbre del patrón debe ser un número con hasta 4 decimales' });
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

    // Validar que valor_referencia sea un número con 2 decimales
    if (!isTwoDecimalNumber(valor_referencia)) {
        return res.status(400).json({ message: 'El valor de referencia debe ser un número con hasta 2 decimales' });
    }

    // Validar que incertidumbre_patron sea un número con 4 decimales
    if (!isFourDecimalNumber(incertidumbre_patron)) {
        return res.status(400).json({ message: 'La incertidumbre del patrón debe ser un número con hasta 4 decimales' });
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
