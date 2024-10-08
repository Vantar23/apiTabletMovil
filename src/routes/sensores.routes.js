import { Router } from 'express';
import { pool } from '../db.js';  // Asegúrate de que la conexión a la base de datos esté correctamente exportada

const router = Router();

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
        res.json(rows[0]);  // Devolver solo el primer (y único) resultado
    } catch (error) {
        console.error('Error al obtener el sensor por ID:', error);
        res.status(500).json({ message: 'Error al obtener el sensor' });
    }
});

// Crear un nuevo sensor
router.post('/sensores', async (req, res) => {
    let { nombre_sensor, mac_address, instrumento, marca, modelo, serie, resolucion, intervalo_indicacion, emp, temp_inicial, temp_final, humedad_relativa_inicial, humedad_relativa_final, presion_atmosferica, numero_informe } = req.body;
    
    // Validaciones para campos faltantes
    if (!nombre_sensor) {
        return res.status(400).json({ message: 'Favor de llenar el campo nombre_sensor' });
    }
    if (!mac_address) {
        return res.status(400).json({ message: 'Favor de llenar el campo mac_address' });
    }
    if (!instrumento) {
        return res.status(400).json({ message: 'Favor de llenar el campo instrumento' });
    }

    try {
        // Buscar el único proceso existente
        const [procesos] = await pool.query('SELECT id FROM procesos');
        if (procesos.length === 0) {
            return res.status(404).json({ message: 'No hay procesos disponibles para asignar al sensor' });
        }
        if (procesos.length > 1) {
            return res.status(400).json({ message: 'Se encontraron múltiples procesos, debe haber solo uno' });
        }

        const id_proceso = procesos[0].id;  // Se asume que solo hay un proceso

        // Formatear la MAC Address en minúsculas
        mac_address = formatMacAddress(mac_address).toLowerCase();

        const result = await pool.query(
            `INSERT INTO sensores (nombre_sensor, mac_address, instrumento, marca, modelo, serie, resolucion, intervalo_indicacion, emp, temp_inicial, temp_final, humedad_relativa_inicial, humedad_relativa_final, presion_atmosferica, numero_informe, id_proceso) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
            [nombre_sensor, mac_address, instrumento, marca, modelo, serie, resolucion, intervalo_indicacion, emp, temp_inicial, temp_final, humedad_relativa_inicial, humedad_relativa_final, presion_atmosferica, numero_informe, id_proceso]
        );
        res.json({ id: result.insertId, message: 'Sensor creado con éxito' });
    } catch (error) {
        console.error('Error al crear el sensor:', error);
        res.status(500).json({ message: 'Error al crear el sensor', error });
    }
});

// Función para formatear la MAC Address
const formatMacAddress = (mac) => {
    return mac.match(/.{1,2}/g).join(':').toUpperCase();
};

// Editar un sensor por ID
router.put('/sensores/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre_sensor, mac_address, instrumento, marca, modelo, serie, resolucion, intervalo_indicacion, emp, temp_inicial, temp_final, humedad_relativa_inicial, humedad_relativa_final, presion_atmosferica, numero_informe } = req.body;

    // Validaciones para campos faltantes
    if (!nombre_sensor) {
        return res.status(400).json({ message: 'Favor de llenar el campo nombre_sensor' });
    }
    if (!mac_address) {
        return res.status(400).json({ message: 'Favor de llenar el campo mac_address' });
    }
    if (!instrumento) {
        return res.status(400).json({ message: 'Favor de llenar el campo instrumento' });
    }

    try {
        // Buscar el único proceso existente
        const [procesos] = await pool.query('SELECT id FROM procesos');
        if (procesos.length === 0) {
            return res.status(404).json({ message: 'No hay procesos disponibles para asignar al sensor' });
        }
        if (procesos.length > 1) {
            return res.status(400).json({ message: 'Se encontraron múltiples procesos, debe haber solo uno' });
        }

        const id_proceso = procesos[0].id;  // Se asume que solo hay un proceso

        // Formatear la MAC Address en minúsculas
        const formattedMacAddress = formatMacAddress(mac_address).toLowerCase();

        const result = await pool.query(
            'UPDATE sensores SET nombre_sensor = ?, mac_address = ?, instrumento = ?, marca = ?, modelo = ?, serie = ?, resolucion = ?, intervalo_indicacion = ?, emp = ?, temp_inicial = ?, temp_final = ?, humedad_relativa_inicial = ?, humedad_relativa_final = ?, presion_atmosferica = ?, numero_informe = ?, id_proceso = ? WHERE id = ?', 
            [nombre_sensor, formattedMacAddress, instrumento, marca, modelo, serie, resolucion, intervalo_indicacion, emp, temp_inicial, temp_final, humedad_relativa_inicial, humedad_relativa_final, presion_atmosferica, numero_informe, id_proceso, id]
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

export default router;
