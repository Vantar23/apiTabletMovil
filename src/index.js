import express from 'express';
import procesosRoutes from './routes/procesos.routes.js';
import subprocesosRoutes from './routes/subprocesos.routes.js';
import indexRoutes from './routes/index.routes.js';
import createTableRoutes from './routes/createTable.routes.js';  // Importa la nueva ruta

const app = express();

// Middlewares
app.use(express.json());

// Rutas
app.use(indexRoutes);  // Ruta de ping
app.use(procesosRoutes);  // Rutas de procesos
app.use(subprocesosRoutes);  // Rutas de subprocesos
app.use(createTableRoutes);  // Ruta para crear la tabla

// Poner a escuchar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});