import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// Funciones para validar el formato numérico con decimales
const isTwoDecimalNumber = (value) => /^-?\d+(\.\d{1,2})?$/.test(value);
const isFourDecimalNumber = (value) => /^-?\d+(\.\d{1,4})?$/.test(value);

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
        return res.status(400).json({ message: 'El valor de referencia debe ser un número decimal con hasta 2 decimales' });
    }

    // Validar que incertidumbre_patron sea un número con 4 decimales
    if (!isFourDecimalNumber(incertidumbre_patron)) {
        return res.status(400).json({ message: 'La incertidumbre del patrón debe ser un número decimal con hasta 4 decimales' });
    }

    // Si todo es válido, proceder con la inserción
    try {
        const result = await pool.query(
            'INSERT INTO subprocesos (nombre, descripcion, proceso_id, valor_referencia, incertidumbre_patron, estatus) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre, descripcion, proceso_id, valor_referencia, incertidumbre_patron, estatus !== undefined ? estatus : 0]
        );
        res.json({ id: result.insertId, message: 'Subproceso creado con éxito' });
    } catch (error) {
        console.error('Error al crear el subproceso:', error);
        res.status(500).json({ message: 'Error al crear el subproceso' });
    }
});

export default router;
