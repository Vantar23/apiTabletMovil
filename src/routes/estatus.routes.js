import { Router } from 'express';
import { pool } from '../db.js';
import axios from 'axios'; // Importamos axios

const router = Router();

router.put('/estatus/:id', async (req, res) => {
    const { id } = req.params;
    const { estatus } = req.body;

    try {
        // Actualizar el estatus del subproceso
        const [result] = await pool.query('UPDATE subprocesos SET estatus = ? WHERE id = ?', [estatus, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Subproceso no encontrado' });
        }

        // Obtener todos los datos de procesos, subprocesos y sensores
        const [procesos] = await pool.query('SELECT * FROM procesos');
        const [subprocesos] = await pool.query('SELECT * FROM subprocesos');
        const [sensores] = await pool.query('SELECT * FROM sensores');

        // Construir la cadena para enviar
        let cadena = '';

        // Agregar procesos a la cadena
        procesos.forEach(proceso => {
            cadena += `${proceso.id},${proceso.nombre || ''},${proceso.descripcion || ''},${proceso.estandar || ''},${proceso.marca || ''},${proceso.modelo || ''},${proceso.serie || ''},${proceso.resolucion || ''},${proceso.intervalo_indicacion || ''},${proceso.calibrado_patron || ''},${proceso.prox_calibracion_patron || ''},${proceso.fecha_verificacion || ''},${proceso.proxima_verificacion || ''},${proceso.temp_inicial || ''},${proceso.temp_final || ''},${proceso.humedad_relativa_inicial || ''},${proceso.humedad_relativa_final || ''},${proceso.presion_atmosferica || ''},${proceso.numero_informe || ''},`;
        });

        // Agregar subprocesos a la cadena con $ al principio del id
        subprocesos.forEach(sub => {
            cadena += `$${sub.id_subproceso},${sub.nombre || ''},${sub.descripcion || ''},${sub.valor_referencia || ''},${sub.incertidumbre_patron || ''},${sub.estatus || ''},`;
        });

        // Agregar sensores a la cadena
        sensores.forEach(sensor => {
            cadena += `!${sensor.id},${sensor.nombre_sensor || ''},${sensor.mac_address || ''},${sensor.instrumento || ''},${sensor.marca || ''},${sensor.modelo || ''},${sensor.resolucion || ''},${sensor.intervalo_indicacion || ''},${sensor.emp || ''},`;
        });

        // Construir la URL para enviar la cadena
        const url = `https://controlware.com.mx/recibe_avimex_tablet.asp?recibo=${encodeURIComponent(cadena)}`;

        try {
            // Realizar la solicitud POST a la URL construida
            const response = await axios.post(url, null, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            console.log('Respuesta del servidor:', response.data);
        } catch (error) {
            console.error('Error al enviar la cadena:', error);
            return res.status(500).json({ message: 'Error al enviar la cadena', error: error.message });
        }

        // Responder con éxito y enviar la cadena en la respuesta
        res.json({ message: 'Estatus actualizado con éxito y cadena enviada', cadena });

    } catch (error) {
        console.error('Error al actualizar el estatus del subproceso:', error);
        res.status(500).json({ message: 'Error al actualizar el estatus del subproceso', error: error.message });
    }
});

export default router;
