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

        // Construir la cadena de proceso
        let cadena = `${proceso[0].id},${proceso[0].nombre || ''},${proceso[0].descripcion || ''},${proceso[0].estandar || ''},${proceso[0].marca || ''},${proceso[0].modelo || ''},${proceso[0].serie || ''},${proceso[0].resolucion || ''},${proceso[0].intervalo_indicacion || ''},${proceso[0].calibrado_patron || ''},${proceso[0].prox_calibracion_patron || ''},${proceso[0].fecha_verificacion || ''},${proceso[0].proxima_verificacion || ''},$`;

        // Agregar subprocesos a la cadena (excluyendo las columnas de fecha_verificacion y proxima_verificacion)
        subprocesos.forEach(sub => {
            cadena += `${sub.id},${sub.nombre || ''},${sub.descripcion || ''},${sub.valor_referencia || ''},${sub.incertidumbre_patron || ''},${sub.estatus || ''},$`;
        });

        // Agregar sensores a la cadena
        sensores.forEach(sensor => {
            cadena += `!${sensor.id},${sensor.nombre_sensor || ''},${sensor.mac_address || ''},${sensor.instrumento || ''},${sensor.marca || ''},${sensor.modelo || ''},${sensor.serie || ''},${sensor.resolucion || ''},${sensor.intervalo_indicacion || ''},${sensor.emp || ''},${sensor.temp_inicial || ''},${sensor.temp_final || ''},${sensor.humedad_relativa_inicial || ''},${sensor.humedad_relativa_final || ''},${sensor.presion_atmosferica || ''},${sensor.numero_informe || ''},`;
        });

        // Enviar la respuesta con la cadena construida
        res.json({ message: 'Estatus actualizado con éxito', cadena });

    } catch (error) {
        console.error('Error al actualizar el estatus del subproceso:', error);
        res.status(500).json({ message: 'Error al actualizar el estatus del subproceso', error: error.message });
    }
});

export default router;
