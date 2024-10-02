import express from 'express';
import procesosRoutes from './routes/procesos.routes.js';  // Importa las rutas de procesos
import subprocesosRoutes from './routes/subprocesos.routes.js';  // Importa las rutas de subprocesos
import indexRoutes from './routes/index.routes.js';  // Importa la ruta del ping
import dotenv from 'dotenv';

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

const app = express();

// Middlewares
app.use(express.json());

// Rutas
app.use(indexRoutes);  // Ruta para ping
app.use(procesosRoutes);  // Rutas para procesos
app.use(subprocesosRoutes);  // Rutas para subprocesos

// Poner a escuchar el servidor en el puerto definido en el archivo .env o el 3000 por defecto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
