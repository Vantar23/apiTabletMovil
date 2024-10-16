import { Router } from 'express';
import { pool } from '../db.js';  // Asegúrate de que la conexión a la base de datos esté correctamente exportada
import axios from 'axios'; // Importar axios para hacer la solicitud POST

const router = Router();

// Crear una cadena con los datos de las tablas procesos, subprocesos y sensores y enviarla por POST
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

        // Enviar la cadena mediante una solicitud POST
        const url = `https://controlware.com.mx/recibe_avimex_tablet.asp?recibo=${encodeURIComponent(cadena)}`;

        await axios.post(url);

        res.status(200).json({ message: 'Cadena enviada con éxito', cadena });

    } catch (error) {
        console.error('Error al crear y enviar la cadena:', error);
        res.status(500).json({ message: 'Error al crear y enviar la cadena', error });
    }
});


// Limpiar las tablas procesos, subprocesos y sensores después de crear la cadena
router.get('/clean-database', async (req, res) => {
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

        // Eliminar los registros después de haber construido la cadena
        await pool.query('DELETE FROM sensores');
        await pool.query('DELETE FROM subprocesos');
        await pool.query('DELETE FROM procesos');

        // Enviar la respuesta con la cadena construida y mensaje de éxito
        res.status(200).json({ message: 'Base de datos limpiada con éxito', cadena });

    } catch (error) {
        console.error('Error al limpiar la base de datos:', error);
        res.status(500).json({ message: 'Error al limpiar la base de datos', error });
    }
});

export default router;
