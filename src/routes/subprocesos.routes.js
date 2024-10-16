import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// Función para validar si un valor es decimal con hasta 4 decimales ds
const isDecimal = (value) => {
    return /^-?\d+(\.\d{1,4})?$/.test(value);
};

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
    if (isNaN(id)) {
        return res.status(400).json({ message: 'ID no válido' });
    }
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

// Crear un subproceso asociado a un proceso específico con un id_subproceso consecutivo
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
    if (!incertidumbre_patron || !isDecimal(incertidumbre_patron)) {
        return res.status(400).json({ message: 'El valor de incertidumbre_patron no es válido, debe ser un número decimal con hasta 4 decimales' });
    }

    // Si no se proporciona estatus, asignar el valor 0
    const estatusFinal = estatus !== undefined ? estatus : 0;

    try {
        // Obtener el siguiente número consecutivo para el subproceso en este proceso
        const [rows] = await pool.query(
            'SELECT COUNT(*) AS total FROM subprocesos WHERE proceso_id = ?',
            [proceso_id]
        );

        const siguienteConsecutivo = rows[0].total + 1;

        // Insertar el nuevo subproceso con el consecutivo asignado
        const result = await pool.query(
            'INSERT INTO subprocesos (id_subproceso, nombre, descripcion, proceso_id, valor_referencia, incertidumbre_patron, estatus) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [siguienteConsecutivo, nombre, descripcion, proceso_id, valor_referencia, incertidumbre_patron, estatusFinal]
        );

        res.json({ 
            id: result.insertId, 
            id_subproceso: siguienteConsecutivo, 
            message: 'Subproceso creado con éxito' 
        });
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
    if (!incertidumbre_patron || !isDecimal(incertidumbre_patron)) {
        return res.status(400).json({ message: 'El valor de incertidumbre_patron no es válido, debe ser un número decimal con hasta 4 decimales' });
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

// Eliminar un subproceso por su ID
router.delete('/subprocesses/:id', async (req, res) => {
    const { id } = req.params;
    if (isNaN(id)) {
        return res.status(400).json({ message: 'ID no válido' });
    }
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
