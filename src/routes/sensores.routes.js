import { Router } from 'express';
import { pool } from '../db.js';  // Asegúrate de que la conexión a la base de datos esté correctamente exportada

const router = Router();

// Función para decodificar la MAC address eliminando los ":" y convertir a mayúsculas
const decodeMacAddress = (mac) => {
    return mac.replace(/:/g, '').toUpperCase();
};

// Ruta para verificar la cantidad de sensores
router.get('/cantidad-sensores', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT COUNT(*) as cantidad FROM sensores');
        const cantidad = rows[0].cantidad;

        if (cantidad >= 12) {
            return res.status(400).json({ message: 'Ya se ha alcanzado el límite de 12 sensores.' });
        }

        res.json({ cantidad });
    } catch (error) {
        console.error('Error al obtener la cantidad de sensores:', error);
        res.status(500).json({ message: 'Error al obtener la cantidad de sensores' });
    }
});

// Obtener todos los sensores
router.get('/sensores', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM sensores');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener los sensores:', error);
        res.status(500).json({ message: 'Error al obtener los sensores' });
    }
});

// Obtener solo las MAC addresses de los sensores
router.get('/sensores/macaddresses', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT mac_address FROM sensores');

        // Verificar si se encontraron MAC Addresses
        if (rows.length === 0) {
            return res.status(404).json({ message: 'No se encontraron sensores con MAC Addresses' });
        }

        // Extraer las MAC Addresses y convertirlas a minúsculas
        const macAddresses = rows.map(row => row.mac_address.toLowerCase()).join(', ');

        // Devolver la cadena con las MAC Addresses en minúsculas
        res.send(macAddresses);
    } catch (error) {
        console.error('Error al obtener las MAC Addresses:', error.message);
        res.status(500).json({ message: 'Error al obtener las MAC Addresses', error: error.message });
    }
});

// Obtener un sensor específico por ID
router.get('/sensores/:id', async (req, res) => {
    const { id } = req.params;
    if (isNaN(id)) {
        return res.status(400).json({ message: 'ID no válido' });
    }
    try {
        const [rows] = await pool.query('SELECT * FROM sensores WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Sensor no encontrado' });
        }

        // Decodificar la MAC address del sensor
        const sensor = {
            ...rows[0],
            mac_address: decodeMacAddress(rows[0].mac_address)
        };

        res.json(sensor);
    } catch (error) {
        console.error('Error al obtener el sensor por ID:', error);
        res.status(500).json({ message: 'Error al obtener el sensor' });
    }
});
// Crear un nuevo sensor
router.post('/sensores', async (req, res) => {
    const sensores = Array.isArray(req.body) ? req.body : [req.body]; // Convertir a arreglo si es un objeto único

    try {
        // Validar si ya hay 12 sensores
        const [rows] = await pool.query('SELECT COUNT(*) as cantidad FROM sensores');
        const cantidadActual = rows[0].cantidad;
        if (cantidadActual + sensores.length > 12) {
            return res.status(400).json({ message: 'Se ha excedido el límite de 12 sensores.' });
        }

        // Obtener el único ID de la tabla procesos
        const [procesos] = await pool.query('SELECT id FROM procesos');
        if (procesos.length !== 1) {
            return res.status(500).json({ message: 'Error: Debe haber exactamente un proceso en la tabla procesos.' });
        }
        const id_proceso = procesos[0].id;

        for (const sensor of sensores) {
            // Desestructurar y validar cada sensor
            const { instrumento, marca, modelo, serie, resolucion, intervalo_indicacion, emp, temp_inicial, temp_final, humedad_relativa_inicial, humedad_relativa_final, presion_atmosferica, numero_informe } = sensor;

            // Validar campos obligatorios
            if (!instrumento || !marca || !modelo || !serie || !resolucion || !intervalo_indicacion || !emp || !temp_inicial || !temp_final || !humedad_relativa_inicial || !humedad_relativa_final || !presion_atmosferica || !numero_informe) {
                return res.status(400).json({ message: 'Todos los campos son obligatorios para cada sensor.' });
            }

            // Insertar el sensor
            await pool.query(
                `INSERT INTO sensores (instrumento, marca, modelo, serie, resolucion, intervalo_indicacion, emp, temp_inicial, temp_final, humedad_relativa_inicial, humedad_relativa_final, presion_atmosferica, numero_informe, id_proceso) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [instrumento, marca, modelo, serie, resolucion, intervalo_indicacion, emp, temp_inicial, temp_final, humedad_relativa_inicial, humedad_relativa_final, presion_atmosferica, numero_informe, id_proceso]
            );
        }

        res.json({ message: 'Sensores creados con éxito' });
    } catch (error) {
        console.error('Error al crear los sensores:', error);
        res.status(500).json({ message: 'Error al crear los sensores', error });
    }
});

// Editar un sensor por ID
router.put('/sensores/:id', async (req, res) => {
    const { id } = req.params;
    const { instrumento, marca, modelo, serie, resolucion, intervalo_indicacion, emp, temp_inicial, temp_final, humedad_relativa_inicial, humedad_relativa_final, presion_atmosferica, numero_informe } = req.body;

    // Validar campos obligatorios
    if (!instrumento || !marca || !modelo || !serie || !resolucion || !intervalo_indicacion || !emp || !temp_inicial || !temp_final || !humedad_relativa_inicial || !humedad_relativa_final || !presion_atmosferica || !numero_informe) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios para actualizar el sensor.' });
    }

    try {
        // Buscar el único proceso existente
        let id_proceso = null;
        const [procesos] = await pool.query('SELECT id FROM procesos');
        if (procesos.length === 1) {
            id_proceso = procesos[0].id; // Asignar el único proceso si existe
        }

        const result = await pool.query(
            'UPDATE sensores SET instrumento = ?, marca = ?, modelo = ?, serie = ?, resolucion = ?, intervalo_indicacion = ?, emp = ?, temp_inicial = ?, temp_final = ?, humedad_relativa_inicial = ?, humedad_relativa_final = ?, presion_atmosferica = ?, numero_informe = ?, id_proceso = ? WHERE id = ?', 
            [instrumento, marca, modelo, serie, resolucion, intervalo_indicacion, emp, temp_inicial, temp_final, humedad_relativa_inicial, humedad_relativa_final, presion_atmosferica, numero_informe, id_proceso, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Sensor no encontrado' });
        }
        res.json({ message: 'Sensor actualizado con éxito' });
    } catch (error) {
        console.error('Error al actualizar el sensor:', error);
        res.status(500).json({ message: 'Error al actualizar el sensor' });
    }
});

// Eliminar un sensor por ID
router.delete('/sensores/:id', async (req, res) => {
    const { id } = req.params;
    if (isNaN(id)) {
        return res.status(400).json({ message: 'ID no válido' });
    }
    try {
        const result = await pool.query('DELETE FROM sensores WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Sensor no encontrado' });
        }
        res.json({ message: 'Sensor eliminado con éxito' });
    } catch (error) {
        console.error('Error al eliminar el sensor:', error);
        res.status(500).json({ message: 'Error al eliminar el sensor' });
    }
});

// Eliminar todos los sensores
router.delete('/sensores', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM sensores');
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'No hay sensores para eliminar' });
        }
        res.json({ message: 'Todos los sensores eliminados con éxito' });
    } catch (error) {
        console.error('Error al eliminar todos los sensores:', error);
        res.status(500).json({ message: 'Error al eliminar todos los sensores' });
    }
});


export default router;
