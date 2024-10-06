import { Router } from 'express';
import { pool } from '../db.js';  // Importa el pool de conexiones

const router = Router();

// Función para construir la cadena de texto solicitada
const construirCadena = async (proceso_id) => {
    // Obtener los datos del proceso
    const [procesoRows] = await pool.query('SELECT * FROM procesos WHERE id = ?', [proceso_id]);
    if (procesoRows.length === 0) {
        throw new Error('Proceso no encontrado');
    }
    const proceso = procesoRows[0];

    // Obtener los subprocesos asociados
    const [subprocesosRows] = await pool.query('SELECT * FROM subprocesos WHERE proceso_id = ?', [proceso_id]);

    // Obtener los sensores asociados
    const [sensoresRows] = await pool.query('SELECT * FROM sensores WHERE proceso_id = ?', [proceso_id]);

    // Construir la cadena del proceso
    let cadena = `${proceso.id},${proceso.nombre},${proceso.descripcion},${proceso.estandar},${proceso.marca},${proceso.modelo},${proceso.serie},${proceso.resolucion},${proceso.intervalo_indicacion},${proceso.calibrado_patron},${proceso.prox_calibracion_patron},${proceso.fecha_verificacion},${proceso.proxima_verificacion},$`;

    // Agregar subprocesos a la cadena
    for (const subproceso of subprocesosRows) {
        cadena += `${subproceso.id},${subproceso.nombre},${subproceso.descripcion},${subproceso.valor_referencia},${subproceso.incertidumbre_patron},${subproceso.estatus},${subproceso.fecha_verificacion || ''},${subproceso.proxima_verificacion || ''},$`;
    }

    // Agregar sensores a la cadena
    for (const sensor of sensoresRows) {
        cadena += `!${sensor.id},${sensor.nombre_sensor},${sensor.mac_address},${sensor.instrumento},${sensor.marca},${sensor.modelo},${sensor.serie},${sensor.resolucion},${sensor.intervalo_indicacion},${sensor.emp},${sensor.temp_inicial},${sensor.temp_final},${sensor.humedad_relativa_inicial},${sensor.humedad_relativa_final},${sensor.presion_atmosferica},${sensor.numero_informe},`;
    }

    // Eliminar el último carácter sobrante
    return cadena.slice(0, -1);
};

// Editar el estatus de un subproceso por ID
router.put('/estatus/:id', async (req, res) => {
    const { id } = req.params;
    const { estatus } = req.body;  // Recibe el nuevo estatus desde el body
    try {
        // Actualizar el estatus del subproceso
        const result = await pool.query('UPDATE subprocesos SET estatus = ? WHERE id = ?', [estatus, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Subproceso no encontrado' });
        }

        // Obtener el proceso_id relacionado con el subproceso
        const [subprocesoRows] = await pool.query('SELECT proceso_id FROM subprocesos WHERE id = ?', [id]);
        const proceso_id = subprocesoRows[0].proceso_id;

        // Construir la cadena de texto
        const cadena = await construirCadena(proceso_id);

        res.json({ message: 'Estatus de subproceso actualizado con éxito', cadena });
    } catch (error) {
        console.error('Error al actualizar el estatus del subproceso:', error); // Mostrar el error exacto en la consola
        res.status(500).json({ message: 'Error al actualizar el estatus del subproceso', error: error.message });
    }
});


export default router;
