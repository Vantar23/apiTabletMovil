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

// Obtener un sensor específico por ID
router.get('/sensores/:id', async (req, res) => {
    const { id } = req.params;
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

router.get('/sensores/macaddresses', async (req, res) => {
    try {
        // Obtener solo las mac_address de los sensores
        const [rows] = await pool.query('SELECT mac_address FROM sensores');

        // Verificar si se encontraron MAC Addresses
        if (rows.length === 0) {
            return res.status(404).json({ message: 'No se encontraron sensores con MAC Addresses' });
        }

        // Extraer las MAC Addresses y unirlas con comas
        const macAddresses = rows.map(row => row.mac_address).join(',');

        // Devolver la cadena con las MAC Addresses separadas por comas
        res.send(macAddresses);
    } catch (error) {
        console.error('Error al obtener las MAC Addresses:', error.message);
        res.status(500).json({ message: 'Error al obtener las MAC Addresses', error: error.message });
    }
});



// Crear un nuevo sensor
router.post('/sensores', async (req, res) => {
    let { nombre_sensor, mac_address, instrumento, marca, modelo, serie, resolucion, intervalo_indicacion, emp, temp_inicial, temp_final, humedad_relativa_inicial, humedad_relativa_final, presion_atmosferica, numero_informe } = req.body;
    
    // Formatear la MAC Address
    mac_address = formatMacAddress(mac_address);
    
    try {
        const result = await pool.query(
            `INSERT INTO sensores (nombre_sensor, mac_address, instrumento, marca, modelo, serie, resolucion, intervalo_indicacion, emp, temp_inicial, temp_final, humedad_relativa_inicial, humedad_relativa_final, presion_atmosferica, numero_informe) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
            [nombre_sensor, mac_address, instrumento, marca, modelo, serie, resolucion, intervalo_indicacion, emp, temp_inicial, temp_final, humedad_relativa_inicial, humedad_relativa_final, presion_atmosferica, numero_informe]
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
    try {
        const result = await pool.query(
            'UPDATE sensores SET nombre_sensor = ?, mac_address = ?, instrumento = ?, marca = ?, modelo = ?, serie = ?, resolucion = ?, intervalo_indicacion = ?, emp = ?, temp_inicial = ?, temp_final = ?, humedad_relativa_inicial = ?, humedad_relativa_final = ?, presion_atmosferica = ?, numero_informe = ? WHERE id = ?', 
            [nombre_sensor, mac_address, instrumento, marca, modelo, serie, resolucion, intervalo_indicacion, emp, temp_inicial, temp_final, humedad_relativa_inicial, humedad_relativa_final, presion_atmosferica, numero_informe, id]
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
