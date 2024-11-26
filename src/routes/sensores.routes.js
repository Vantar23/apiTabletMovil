import { Router } from 'express';
import { pool } from '../db.js'; // Asegúrate de que la conexión a la base de datos esté correctamente exportada

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

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No se encontraron sensores con MAC Addresses' });
        }

        const macAddresses = rows.map(row => row.mac_address.toLowerCase()).join(', ');

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
    const sensores = Array.isArray(req.body) ? req.body : [req.body];

    try {
        // Verificar la cantidad actual de sensores en la tabla
        const [rows] = await pool.query('SELECT COUNT(*) as cantidad FROM sensores');
        const cantidadActual = rows[0].cantidad;

        // Validar que no se exceda el límite de 12 sensores
        if (cantidadActual + sensores.length > 12) {
            return res.status(400).json({ message: 'Se ha excedido el límite de 12 sensores.' });
        }

        // Obtener el único proceso de la tabla 'procesos'
        const [procesos] = await pool.query('SELECT id FROM procesos');

        // Verificar que haya exactamente un proceso
        if (procesos.length !== 1) {
            return res.status(500).json({ message: 'Error: Debe haber exactamente un proceso en la tabla procesos.' });
        }

        // Obtener el ID del proceso
        const id_proceso = procesos[0].id;

        // Procesar cada sensor del cuerpo de la solicitud
        for (const [index, sensor] of sensores.entries()) {
            const {
                Instrumento,
                Marca,
                Modelo,
                MacAdress,
                Serie,
                Resolución,
                Intervalo_de_indicación,
                EMP,
                Temperatura_inicial,
                Temperatura_final,
                Humedad_relativa_inicial,
                Humedad_relativa_final,
                Presión_atmosférica,
                Numero_de_Informe
            } = sensor;

            // Crear un array con los campos faltantes
            const camposFaltantes = [];

            if (!Instrumento) camposFaltantes.push('Instrumento');
            if (!Marca) camposFaltantes.push('Marca');
            if (!Modelo) camposFaltantes.push('Modelo');
            if (!MacAdress) camposFaltantes.push('MacAdress');
            if (!Serie) camposFaltantes.push('Serie');
            if (!Resolución) camposFaltantes.push('Resolución');
            if (!Intervalo_de_indicación) camposFaltantes.push('Intervalo_de_indicación');
            if (!EMP) camposFaltantes.push('EMP');
            if (!Temperatura_inicial) camposFaltantes.push('Temperatura_inicial');
            if (!Temperatura_final) camposFaltantes.push('Temperatura_final');
            if (!Humedad_relativa_inicial) camposFaltantes.push('Humedad_relativa_inicial');
            if (!Humedad_relativa_final) camposFaltantes.push('Humedad_relativa_final');
            if (!Presión_atmosférica) camposFaltantes.push('Presión_atmosférica');
            if (!Numero_de_Informe) camposFaltantes.push('Numero_de_Informe');

            // Si hay campos faltantes, responder con un error específico
            if (camposFaltantes.length > 0) {
                return res.status(400).json({ 
                    message: `El sensor en la posición ${index + 1} tiene campos faltantes: ${camposFaltantes.join(', ')}` 
                });
            }

            // Insertar los datos del sensor en la base de datos
            await pool.query(
                `INSERT INTO sensores (instrumento, marca, modelo, mac_address, serie, resolucion, intervalo_indicacion, emp, temp_inicial, temp_final, humedad_relativa_inicial, humedad_relativa_final, presion_atmosferica, numero_informe, id_proceso) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    Instrumento,
                    Marca,
                    Modelo,
                    MacAdress,
                    Serie,
                    Resolución,
                    Intervalo_de_indicación,
                    EMP,
                    Temperatura_inicial,
                    Temperatura_final,
                    Humedad_relativa_inicial,
                    Humedad_relativa_final,
                    Presión_atmosférica,
                    Numero_de_Informe,
                    id_proceso
                ]
            );
        }

        // Responder con éxito
        res.json({ message: 'Sensores creados con éxito' });
    } catch (error) {
        // Manejo de errores
        console.error('Error al crear los sensores:', error);
        res.status(500).json({ message: 'Error al crear los sensores', error });
    }
});



// Editar un sensor por ID
router.put('/sensores/:id', async (req, res) => {
    const { id } = req.params;
    const { mac_address, instrumento, marca, modelo, serie, resolucion, intervalo_indicacion, emp, temp_inicial, temp_final, humedad_relativa_inicial, humedad_relativa_final, presion_atmosferica, numero_informe } = req.body;

    if (!mac_address || !instrumento || !marca || !modelo || !serie || !resolucion || !intervalo_indicacion || !emp || !temp_inicial || !temp_final || !humedad_relativa_inicial || !humedad_relativa_final || !presion_atmosferica || !numero_informe) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios para actualizar el sensor.' });
    }

    try {
        const [procesos] = await pool.query('SELECT id FROM procesos');
        const id_proceso = procesos.length === 1 ? procesos[0].id : null;

        const result = await pool.query(
            'UPDATE sensores SET mac_address = ?, instrumento = ?, marca = ?, modelo = ?, serie = ?, resolucion = ?, intervalo_indicacion = ?, emp = ?, temp_inicial = ?, temp_final = ?, humedad_relativa_inicial = ?, humedad_relativa_final = ?, presion_atmosferica = ?, numero_informe = ?, id_proceso = ? WHERE id = ?', 
            [mac_address, instrumento, marca, modelo, serie, resolucion, intervalo_indicacion, emp, temp_inicial, temp_final, humedad_relativa_inicial, humedad_relativa_final, presion_atmosferica, numero_informe, id_proceso, id]
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
