import { createPool } from 'mysql2/promise';
import dotenv from 'dotenv';

// Cargar las variables de entorno
dotenv.config();

export const pool = createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
