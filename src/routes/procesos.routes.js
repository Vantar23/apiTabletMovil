import { Router } from 'express';
import { pool } from '../db.js';  // Asegúrate de que la conexión a la base de datos esté correctamente exportada

const router = Router();

// Función para quitar los "/" de las fechas y formatearlas
const formatDate = (dateString) => {
    if (!dateString) return '';
    const [day, month, year] = dateString.split('/');
    return `${day} ${month} ${year}`;  // Formato: "dd mm yyyy"
};

// Obtener todos los procesos
router.get('/processes', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM procesos');
        if (rows.length === 0) {
            return res.status(204).json({ message: 'No hay procesos disponibles' });  // 204 No Content
        }

        // Formatear fechas
        const procesos = rows.map(proceso => ({
            ...rows[0],
            calibrado_patron: formatDate(proceso.calibrado_patron),
            prox_calibracion_patron: formatDate(proceso.prox_calibracion_patron),
            fecha_verificacion: formatDate(proceso.fecha_verificacion),
            proxima_verificacion: formatDate(proceso.proxima_verificacion)
        }));

        res.json(procesos);
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

        // Formatear fechas del proceso
        const proceso = {
            ...rows[0],
            calibrado_patron: formatDate(rows[0].calibrado_patron),
            prox_calibracion_patron: formatDate(rows[0].prox_calibracion_patron),
            fecha_verificacion: formatDate(rows[0].fecha_verificacion),
            proxima_verificacion: formatDate(rows[0].proxima_verificacion)
        };

        res.json(proceso);  // Devuelve un objeto
    } catch (error) {
        console.error('Error al obtener el proceso por ID:', error);
        res.status(500).json({ message: 'Error al obtener el proceso' });
    }
});

// Crear un nuevo proceso
router.post('/processes', async (req, res) => {
    const { nombre, descripcion, estandar, marca, modelo, serie, resolucion, intervalo_indicacion, calibrado_patron, prox_calibracion_patron, fecha_verificacion, proxima_verificacion, temp_inicial, temp_final, humedad_relativa_inicial, humedad_relativa_final, presion_atmosferica, numero_informe } = req.body;

    // Verificación de campos faltantes
    if (!nombre || !descripcion || !estandar || !marca || !modelo || !serie || !resolucion || !intervalo_indicacion || !calibrado_patron || !prox_calibracion_patron || !fecha_verificacion || !proxima_verificacion || !temp_inicial || !temp_final || !humedad_relativa_inicial || !humedad_relativa_final || !presion_atmosferica || !numero_informe) {
        return res.status(400).json({ message: 'Favor de llenar todos los campos obligatorios' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO procesos (nombre, descripcion, estandar, marca, modelo, serie, resolucion, intervalo_indicacion, calibrado_patron, prox_calibracion_patron, fecha_verificacion, proxima_verificacion, temp_inicial, temp_final, humedad_relativa_inicial, humedad_relativa_final, presion_atmosferica, numero_informe) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
            [nombre, descripcion, estandar, marca, modelo, serie, resolucion, intervalo_indicacion, calibrado_patron, prox_calibracion_patron, fecha_verificacion, proxima_verificacion, temp_inicial, temp_final, humedad_relativa_inicial, humedad_relativa_final, presion_atmosferica, numero_informe]
        );
        res.json({ id: result.insertId, nombre: nombre });
    } catch (error) {
        console.error('Error al crear proceso:', error);
        res.status(500).json({ message: 'Error al crear el proceso' });
    }
});

// Editar un proceso por ID
router.put('/processes/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, estandar, marca, modelo, serie, resolucion, intervalo_indicacion, calibrado_patron, prox_calibracion_patron, fecha_verificacion, proxima_verificacion, temp_inicial, temp_final, humedad_relativa_inicial, humedad_relativa_final, presion_atmosferica, numero_informe } = req.body;

    // Verificación de campos faltantes
    if (!nombre || !descripcion || !estandar || !marca || !modelo || !serie || !resolucion || !intervalo_indicacion || !calibrado_patron || !prox_calibracion_patron || !fecha_verificacion || !proxima_verificacion || !temp_inicial || !temp_final || !humedad_relativa_inicial || !humedad_relativa_final || !presion_atmosferica || !numero_informe) {
        return res.status(400).json({ message: 'Favor de llenar todos los campos obligatorios' });
    }

    try {
        const result = await pool.query(
            'UPDATE procesos SET nombre = ?, descripcion = ?, estandar = ?, marca = ?, modelo = ?, serie = ?, resolucion = ?, intervalo_indicacion = ?, calibrado_patron = ?, prox_calibracion_patron = ?, fecha_verificacion = ?, proxima_verificacion = ?, temp_inicial = ?, temp_final = ?, humedad_relativa_inicial = ?, humedad_relativa_final = ?, presion_atmosferica = ?, numero_informe = ? WHERE id = ?', 
            [nombre, descripcion, estandar, marca, modelo, serie, resolucion, intervalo_indicacion, calibrado_patron, prox_calibracion_patron, fecha_verificacion, proxima_verificacion, temp_inicial, temp_final, humedad_relativa_inicial, humedad_relativa_final, presion_atmosferica, numero_informe, id]
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
