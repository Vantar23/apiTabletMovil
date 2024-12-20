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
            return res.status(404).send('No se encontraron sensores con MAC Addresses');
        }

        // Formatear las MAC Addresses al formato xx:xx:xx:xx:xx:xx
        const macAddresses = rows.map(row => {
            const mac = row.mac_address.toLowerCase(); // Convertir a minúsculas
            return mac.match(/.{1,2}/g).join(':'); // Insertar los dos puntos entre cada par
        }).join(', '); // Unir todas las MAC Addresses con comas

        res.send(macAddresses);
    } catch (error) {
        console.error('Error al obtener las MAC Addresses:', error.message);
        res.status(500).send('Error al obtener las MAC Addresses');
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
// Crear un nuevo sensor
router.post('/sensores', async (req, res) => {
    try {
        // Verificar la cantidad actual de sensores en la tabla
        const [rows] = await pool.query('SELECT COUNT(*) as cantidad FROM sensores');
        const cantidadActual = rows[0].cantidad;

        // Validar que no se exceda el límite de 12 sensores
        if (cantidadActual >= 12) {
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

        // Extraer datos del sensor desde el cuerpo de la solicitud
        const {
            instrumento,
            marca,
            modelo,
            mac_address, // Corregido
            resolucion,
            intervalo_indicacion, // Corregido
            emp,
            temp_inicial, // Corregido
            temp_final, // Corregido
            humedad_relativa_inicial,
            humedad_relativa_final,
            presion_atmosferica,
            numero_informe
        } = req.body;

        // Crear un array con los campos faltantes
        const camposFaltantes = [];

        if (!instrumento) camposFaltantes.push('instrumento');
        if (!marca) camposFaltantes.push('marca');
        if (!modelo) camposFaltantes.push('modelo');
        if (!mac_address) camposFaltantes.push('mac_address');
        if (!resolucion) camposFaltantes.push('resolucion');
        if (!intervalo_indicacion) camposFaltantes.push('intervalo_indicacion');
        if (!emp) camposFaltantes.push('emp');
        if (!temp_inicial) camposFaltantes.push('temp_inicial');
        if (!temp_final) camposFaltantes.push('temp_final');
        if (!humedad_relativa_inicial) camposFaltantes.push('humedad_relativa_inicial');
        if (!humedad_relativa_final) camposFaltantes.push('humedad_relativa_final');
        if (!presion_atmosferica) camposFaltantes.push('presion_atmosferica');
        if (!numero_informe) camposFaltantes.push('numero_informe');

        // Si hay campos faltantes, responder con un error específico
        if (camposFaltantes.length > 0) {
            return res.status(400).json({ 
                message: `El sensor tiene campos faltantes: ${camposFaltantes.join(', ')}` 
            });
        }

        // Insertar los datos del sensor en la base de datos
        await pool.query(
            `INSERT INTO sensores (instrumento, marca, modelo, mac_address, resolucion, intervalo_indicacion, emp, temp_inicial, temp_final, humedad_relativa_inicial, humedad_relativa_final, presion_atmosferica, numero_informe, id_proceso) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                instrumento,
                marca,
                modelo,
                mac_address,
                resolucion,
                intervalo_indicacion,
                emp,
                temp_inicial,
                temp_final,
                humedad_relativa_inicial,
                humedad_relativa_final,
                presion_atmosferica,
                numero_informe,
                id_proceso
            ]
        );

        // Responder con éxito
        res.json({ message: 'Sensor creado con éxito' });
    } catch (error) {
        // Manejo de errores
        console.error('Error al crear el sensor:', error);
        res.status(500).json({ message: 'Error al crear el sensor', error });
    }
});


// Editar un sensor por ID
// Editar un sensor por ID
router.put('/sensores/:id', async (req, res) => {
    const { id } = req.params;

    // Extraer los datos del cuerpo de la solicitud en minúsculas y en el orden correcto
    const {
        instrumento,
        marca,
        modelo,
        mac_address, // Corregido
        resolucion,
        intervalo_indicacion, // Corregido
        emp,
        temp_inicial, // Corregido
        temp_final, // Corregido
        humedad_relativa_inicial,
        humedad_relativa_final,
        presion_atmosferica,
        numero_informe
    } = req.body;

    // Validar que todos los campos estén presentes
    const camposFaltantes = [];
    if (!instrumento) camposFaltantes.push('instrumento');
    if (!marca) camposFaltantes.push('marca');
    if (!modelo) camposFaltantes.push('modelo');
    if (!mac_address) camposFaltantes.push('mac_address');
    if (!resolucion) camposFaltantes.push('resolucion');
    if (!intervalo_indicacion) camposFaltantes.push('intervalo_indicacion');
    if (!emp) camposFaltantes.push('emp');
    if (!temp_inicial) camposFaltantes.push('temp_inicial');
    if (!temp_final) camposFaltantes.push('temp_final');
    if (!humedad_relativa_inicial) camposFaltantes.push('humedad_relativa_inicial');
    if (!humedad_relativa_final) camposFaltantes.push('humedad_relativa_final');
    if (!presion_atmosferica) camposFaltantes.push('presion_atmosferica');
    if (!numero_informe) camposFaltantes.push('numero_informe');

    if (camposFaltantes.length > 0) {
        return res.status(400).json({ 
            message: `El sensor tiene campos faltantes: ${camposFaltantes.join(', ')}` 
        });
    }

    try {
        // Obtener el único proceso de la tabla 'procesos'
        const [procesos] = await pool.query('SELECT id FROM procesos');
        if (procesos.length !== 1) {
            return res.status(500).json({ message: 'Error: Debe haber exactamente un proceso en la tabla procesos.' });
        }

        const id_proceso = procesos[0].id;

        // Actualizar el sensor en la base de datos
        const [result] = await pool.query(
            `UPDATE sensores 
             SET instrumento = ?, 
                 marca = ?, 
                 modelo = ?, 
                 mac_address = ?, 
                 resolucion = ?, 
                 intervalo_indicacion = ?, 
                 emp = ?, 
                 temp_inicial = ?, 
                 temp_final = ?, 
                 humedad_relativa_inicial = ?, 
                 humedad_relativa_final = ?, 
                 presion_atmosferica = ?, 
                 numero_informe = ?, 
                 id_proceso = ? 
             WHERE id = ?`, 
            [
                instrumento,
                marca,
                modelo,
                mac_address, // Corregido
                resolucion,
                intervalo_indicacion, // Corregido
                emp,
                temp_inicial, // Corregido
                temp_final, // Corregido
                humedad_relativa_inicial,
                humedad_relativa_final,
                presion_atmosferica,
                numero_informe,
                id_proceso,
                id
            ]
        );

        // Verificar si se encontró el sensor
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Sensor no encontrado' });
        }

        res.json({ message: 'Sensor actualizado con éxito' });
    } catch (error) {
        console.error('Error al actualizar el sensor:', error);
        res.status(500).json({ message: 'Error al actualizar el sensor', error });
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
