import { Router } from 'express';
import { pool } from '../db.js';  // Asegúrate de que la conexión a la base de datos esté correctamente exportada

const router = Router();

// Crear una cadena con los datos de las tablas procesos, subprocesos y sensores sin borrar nada
router.get('/crea-cadena', async (req, res) => {
    try {
        // Obtener todos los datos de procesos
        const [procesos] = await pool.query('SELECT * FROM procesos');

        // Obtener todos los subprocesos
        const [subprocesos] = await pool.query('SELECT * FROM subprocesos');

        // Obtener todos los sensores
        const [sensores] = await pool.query('SELECT * FROM sensores');

        // Construir la cadena de envío
        let cadena = '';

        // Agregar procesos a la cadena
        procesos.forEach(proceso => {
            cadena += `${proceso.id},${proceso.nombre || ''},${proceso.descripcion || ''},${proceso.estandar || ''},${proceso.marca || ''},${proceso.modelo || ''},${proceso.serie || ''},${proceso.resolucion || ''},${proceso.intervalo_indicacion || ''},${proceso.calibrado_patron || ''},${proceso.prox_calibracion_patron || ''},${proceso.fecha_verificacion || ''},${proceso.proxima_verificacion || ''},$`;
        });

        // Agregar subprocesos a la cadena
        subprocesos.forEach(sub => {
            cadena += `${sub.id},${sub.nombre || ''},${sub.descripcion || ''},${sub.valor_referencia || ''},${sub.incertidumbre_patron || ''},${sub.estatus || ''},$`;
        });

        // Agregar sensores a la cadena
        sensores.forEach(sensor => {
            cadena += `!${sensor.id},${sensor.nombre_sensor || ''},${sensor.mac_address || ''},${sensor.instrumento || ''},${sensor.marca || ''},${sensor.modelo || ''},${sensor.serie || ''},${sensor.resolucion || ''},${sensor.intervalo_indicacion || ''},${sensor.emp || ''},${sensor.temp_inicial || ''},${sensor.temp_final || ''},${sensor.humedad_relativa_inicial || ''},${sensor.humedad_relativa_final || ''},${sensor.presion_atmosferica || ''},${sensor.numero_informe || ''},`;
        });

        // Enviar la cadena construida sin eliminar los registros
        res.status(200).json({ cadena });

    } catch (error) {
        console.error('Error al crear la cadena:', error);
        res.status(500).json({ message: 'Error al crear la cadena', error });
    }
});

export default router;
