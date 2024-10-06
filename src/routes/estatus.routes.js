import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

router.put('/estatus/:id', async (req, res) => {
    const { id } = req.params;
    const { estatus } = req.body;

    try {
        // Actualizar el estatus
        const result = await pool.query('UPDATE subprocesos SET estatus = ? WHERE id = ?', [estatus, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Subproceso no encontrado' });
        }

        // Obtener datos del proceso, subprocesos y sensores relacionados
        const [proceso] = await pool.query('SELECT * FROM procesos WHERE id = (SELECT proceso_id FROM subprocesos WHERE id = ?)', [id]);
        const [subprocesos] = await pool.query('SELECT * FROM subprocesos WHERE proceso_id = ?', [proceso[0].id]);
        const [sensores] = await pool.query('SELECT * FROM sensores WHERE id_proceso = ?', [proceso[0].id]);

        // Función para devolver espacio en blanco si el valor es nulo o vacío
        const safeValue = (value) => (value ? value : " ");

        // Construir la cadena de proceso
        let cadena = `${safeValue(proceso[0].id)},${safeValue(proceso[0].nombre)},${safeValue(proceso[0].descripcion)},${safeValue(proceso[0].estandar)},${safeValue(proceso[0].marca)},${safeValue(proceso[0].modelo)},${safeValue(proceso[0].serie)},${safeValue(proceso[0].resolucion)},${safeValue(proceso[0].intervalo_indicacion)},${safeValue(proceso[0].calibrado_patron)},${safeValue(proceso[0].prox_calibracion_patron)},${safeValue(proceso[0].fecha_verificacion)},${safeValue(proceso[0].proxima_verificacion)},$`;

        // Agregar subprocesos a la cadena
        subprocesos.forEach(sub => {
            cadena += `${safeValue(sub.id)},${safeValue(sub.nombre)},${safeValue(sub.descripcion)},${safeValue(sub.valor_referencia)},${safeValue(sub.incertidumbre_patron)},${safeValue(sub.estatus)},${safeValue(sub.fecha_verificacion)},${safeValue(sub.proxima_verificacion)},$`;
        });

        // Agregar sensores a la cadena
        sensores.forEach(sensor => {
            cadena += `!${safeValue(sensor.id)},${safeValue(sensor.nombre_sensor)},${safeValue(sensor.mac_address)},${safeValue(sensor.instrumento)},${safeValue(sensor.marca)},${safeValue(sensor.modelo)},${safeValue(sensor.serie)},${safeValue(sensor.resolucion)},${safeValue(sensor.intervalo_indicacion)},${safeValue(sensor.emp)},${safeValue(sensor.temp_inicial)},${safeValue(sensor.temp_final)},${safeValue(sensor.humedad_relativa_inicial)},${safeValue(sensor.humedad_relativa_final)},${safeValue(sensor.presion_atmosferica)},${safeValue(sensor.numero_informe)},`;
        });

        // Enviar la respuesta con la cadena construida
        res.json({ message: 'Estatus actualizado con éxito', cadena });

    } catch (error) {
        console.error('Error al actualizar el estatus del subproceso:', error);
        res.status(500).json({ message: 'Error al actualizar el estatus del subproceso', error: error.message });
    }
});

export default router;
