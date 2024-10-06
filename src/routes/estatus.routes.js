// Editar el estatus de un subproceso por ID
router.put('/estatus/:id', async (req, res) => {
    const { id } = req.params;  // Este es el ID del subproceso
    const { estatus } = req.body;  // Recibe el nuevo estatus desde el body
    try {
        // Actualizar el estatus del subproceso
        const result = await pool.query('UPDATE subprocesos SET estatus = ? WHERE id = ?', [estatus, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Subproceso no encontrado' });
        }

        // Obtener el subproceso, incluyendo el proceso_id relacionado
        const [subprocesoRows] = await pool.query('SELECT proceso_id FROM subprocesos WHERE id = ?', [id]);
        if (subprocesoRows.length === 0) {
            return res.status(404).json({ message: 'Subproceso no encontrado' });
        }
        
        const proceso_id = subprocesoRows[0].proceso_id;  // ID del proceso relacionado

        // Construir la cadena de texto a partir del proceso_id
        const cadena = await construirCadena(proceso_id);

        res.json({ message: 'Estatus de subproceso actualizado con éxito', cadena });
    } catch (error) {
        console.error('Error al actualizar el estatus del subproceso:', error); // Mostrar el error exacto en la consola
        res.status(500).json({ message: 'Error al actualizar el estatus del subproceso', error: error.message });
    }
});

// Función para construir la cadena del proceso, subprocesos y sensores
async function construirCadena(proceso_id) {
    try {
        // Obtener la información del proceso
        const [procesoRows] = await pool.query('SELECT * FROM procesos WHERE id = ?', [proceso_id]);
        const proceso = procesoRows[0];

        // Obtener los subprocesos asociados al proceso
        const [subprocesosRows] = await pool.query('SELECT * FROM subprocesos WHERE proceso_id = ?', [proceso_id]);

        // Obtener los sensores asociados al proceso
        const [sensoresRows] = await pool.query('SELECT * FROM sensores WHERE proceso_id = ?', [proceso_id]);

        // Construir la cadena de texto
        let cadena = `${proceso.id},${proceso.nombre},${proceso.descripcion},${proceso.estandar},${proceso.marca},${proceso.modelo},${proceso.serie},${proceso.resolucion},${proceso.intervalo_indicacion},${proceso.calibrado_patron},${proceso.prox_calibracion_patron},${proceso.fecha_verificacion},${proceso.proxima_verificacion},$`;

        // Añadir subprocesos a la cadena
        for (let subproceso of subprocesosRows) {
            cadena += `${subproceso.id},${subproceso.nombre},${subproceso.descripcion},${subproceso.valor_referencia},${subproceso.incertidumbre_patron},${subproceso.estatus},${subproceso.fecha_verificacion || ''},${subproceso.proxima_verificacion || ''},$`;
        }

        // Añadir sensores a la cadena
        for (let sensor of sensoresRows) {
            cadena += `!${sensor.id},${sensor.nombre_sensor},${sensor.mac_address},${sensor.instrumento},${sensor.marca},${sensor.modelo},${sensor.serie},${sensor.resolucion},${sensor.intervalo_indicacion},${sensor.emp},${sensor.temp_inicial},${sensor.temp_final},${sensor.humedad_relativa_inicial},${sensor.humedad_relativa_final},${sensor.presion_atmosferica},${sensor.numero_informe}`;
        }

        return cadena;
    } catch (error) {
        console.error('Error al construir la cadena:', error);
        throw new Error('Error al construir la cadena');
    }
}
