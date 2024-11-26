import { Router } from 'express';
import { pool } from '../db.js';  // Asegúrate de que la conexión a la base de datos esté correctamente exportada
import axios from 'axios'; // Importar axios para hacer la solicitud POST

const router = Router();

router.get('/muestra-cadena', async (req, res) => {
    try {
        // Obtener todos los datos de procesos, subprocesos y sensores
        const [procesos] = await pool.query('SELECT * FROM procesos');
        const [subprocesos] = await pool.query('SELECT * FROM subprocesos');
        const [sensores] = await pool.query('SELECT * FROM sensores');

        // Construir la cadena de envío
        let cadena = '';

        // Agregar procesos a la cadena
        procesos.forEach(proceso => {
            cadena += `${proceso.id || ''},${proceso.nombre || ''},${proceso.descripcion || ''},${proceso.estandar || ''},${proceso.marca || ''},${proceso.modelo || ''},${proceso.serie || ''},${proceso.resolucion || ''},${proceso.intervalo_indicacion || ''},${proceso.calibrado_patron || ''},${proceso.prox_calibracion_patron || ''},${proceso.fecha_verificacion || ''},${proceso.proxima_verificacion || ''},`;
        });

        // Agregar subprocesos a la cadena con "$" al principio de cada subproceso
        subprocesos.forEach(sub => {
            cadena += `$${sub.id_subproceso || ''},${sub.nombre || ''},${sub.descripcion || ''},${sub.valor_referencia || ''},${sub.incertidumbre_patron || ''},${sub.estatus || ''},`;
        });

        // Agregar sensores a la cadena con "!" al principio de cada sensor
        sensores.forEach((sensor, index) => {
            const consecutivo = (index + 1).toString(); // Consecutivo como string
            cadena += `!${consecutivo},${sensor.instrumento || ''},${sensor.mac_address || ''},${sensor.marca || ''},${sensor.modelo || ''},${sensor.resolucion || ''},${sensor.intervalo_indicacion || ''},${sensor.emp || ''},${sensor.temp_inicial || ''},${sensor.temp_final || ''},${sensor.humedad_relativa_inicial || ''},${sensor.humedad_relativa_final || ''},${sensor.presion_atmosferica || ''},${sensor.numero_informe || ''},`;
        });

        // Mostrar la cadena generada en la respuesta
        res.status(200).json({ message: 'Cadena generada con éxito', cadena });
    } catch (error) {
        console.error('Error al crear la cadena:', error);
        res.status(500).json({ message: 'Error al crear la cadena', error: error.message });
    }
});


router.get('/crea-cadena', async (req, res) => {
    try {
        // Obtener todos los datos de procesos, subprocesos y sensores
        const [procesos] = await pool.query('SELECT * FROM procesos');
        const [subprocesos] = await pool.query('SELECT * FROM subprocesos');
        const [sensores] = await pool.query('SELECT * FROM sensores');

        // Construir la cadena de envío
        let cadena = '';

        // Agregar procesos a la cadena
        procesos.forEach(proceso => {
            cadena += `${proceso.id || ''},${proceso.nombre || ''},${proceso.descripcion || ''},${proceso.estandar || ''},${proceso.marca || ''},${proceso.modelo || ''},${proceso.serie || ''},${proceso.resolucion || ''},${proceso.intervalo_indicacion || ''},${proceso.calibrado_patron || ''},${proceso.prox_calibracion_patron || ''},${proceso.fecha_verificacion || ''},${proceso.proxima_verificacion || ''},`;
        });

        // Agregar subprocesos a la cadena con "$" al principio de cada subproceso
        subprocesos.forEach(sub => {
            cadena += `$${sub.id_subproceso || ''},${sub.nombre || ''},${sub.descripcion || ''},${sub.valor_referencia || ''},${sub.incertidumbre_patron || ''},${sub.estatus || ''},`;
        });

        // Agregar sensores a la cadena con "!" al principio de cada sensor
        sensores.forEach((sensor, index) => {
            const consecutivo = (index + 1).toString(); // Consecutivo como string
            cadena += `!${consecutivo},${sensor.instrumento || ''},${sensor.mac_address || ''},${sensor.marca || ''},${sensor.modelo || ''},${sensor.resolucion || ''},${sensor.intervalo_indicacion || ''},${sensor.emp || ''},${sensor.temp_inicial || ''},${sensor.temp_final || ''},${sensor.humedad_relativa_inicial || ''},${sensor.humedad_relativa_final || ''},${sensor.presion_atmosferica || ''},${sensor.numero_informe || ''},`;
        });

        // Preparar los datos para el envío POST
        const url = 'https://controlware.com.mx/recibe_avimex_tablet.asp';
        const data = new URLSearchParams();
        data.append('recibo', cadena);

        try {
            // Realizar la solicitud POST a la URL con datos de formulario
            const response = await axios.post(url, data, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            console.log('Respuesta del servidor:', response.data);
            res.status(200).json({ message: 'Cadena enviada con éxito', cadena });
        } catch (error) {
            console.error('Error al enviar la cadena:', error);
            res.status(500).json({ message: 'Error al enviar la cadena', error: error.message });
        }
    } catch (error) {
        console.error('Error al crear y enviar la cadena:', error);
        res.status(500).json({ message: 'Error al crear y enviar la cadena', error: error.message });
    }
});


router.get('/sensoresFaltantes', async (req, res) => {
    try {
        // Query para agregar los campos faltantes
        await pool.query(`
            ALTER TABLE sensores
            ADD COLUMN serie VARCHAR(255) NOT NULL,
            ADD COLUMN temp_inicial FLOAT NOT NULL,
            ADD COLUMN temp_final FLOAT NOT NULL,
            ADD COLUMN humedad_relativa_inicial FLOAT NOT NULL,
            ADD COLUMN humedad_relativa_final FLOAT NOT NULL,
            ADD COLUMN presion_atmosferica FLOAT NOT NULL,
            ADD COLUMN numero_informe VARCHAR(255) NOT NULL;
        `);

        res.json({ message: 'Campos faltantes añadidos a la tabla sensores con éxito.' });
    } catch (error) {
        console.error('Error al agregar los campos faltantes a la tabla sensores:', error);
        res.status(500).json({ message: 'Error al agregar los campos faltantes a la tabla sensores', error });
    }
});

router.get('/eliminarCampoNombreSensor', async (req, res) => {
    try {
        // Query para eliminar la columna nombre_sensor de la tabla procesos
        await pool.query(`
            ALTER TABLE sensores
            DROP COLUMN nombre_sensor;
        `);

        res.json({ message: 'Campo nombre_sensor eliminado de la tabla procesos.' });
    } catch (error) {
        console.error('Error al eliminar el campo nombre_sensor:', error);
        res.status(500).json({ message: 'Error al eliminar el campo nombre_sensor', error });
    }
});

router.get('/agregarProcesosCampos', async (req, res) => {
    try {
        // Query para agregar las columnas necesarias
        await pool.query(`
            ALTER TABLE procesos
            ADD COLUMN nombre VARCHAR(255) NOT NULL,
            ADD COLUMN descripcion TEXT NOT NULL;
        `);

        res.json({ message: 'Campos nombre y descripcion añadidos a la tabla procesos.' });
    } catch (error) {
        console.error('Error al agregar los campos nombre y descripcion:', error);
        res.status(500).json({ message: 'Error al agregar los campos nombre y descripcion', error });
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
