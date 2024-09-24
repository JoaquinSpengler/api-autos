import express from 'express';
import mysql from 'mysql2/promise'; // Usar mysql2 con promesas
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const router = express.Router();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

// Función para obtener una conexión a la base de datos
async function getConnection() {
    const connection = await mysql.createConnection(dbConfig);
    return connection;
}

// Endpoint para obtener todos los autos
app.get('/api/autos', async (req, res) => {
    try {
        const db = await getConnection();
        const [results] = await db.query('SELECT * FROM autos');
        res.json(results);
    } catch (err) {
        console.error('Error al obtener autos:', err);
        res.status(500).json({ error: 'Error al obtener autos' });
    }
});

// Endpoint para obtener un auto por ID
app.get('/api/autos/:id', async (req, res) => {
    const autoId = req.params.id;
    try {
        const db = await getConnection();
        const [results] = await db.query('SELECT * FROM autos WHERE id = ?', [autoId]);
        if (results.length === 0) {
            res.status(404).json({ error: 'Auto no encontrado' });
            return;
        }
        res.json(results[0]);
    } catch (err) {
        console.error('Error al obtener auto:', err);
        res.status(500).json({ error: 'Error al obtener auto' });
    }
});

// Endpoint para obtener el historial de mantenimiento de un auto
app.get('/api/autos/:id/mantenimientos', async (req, res) => {
    const autoId = req.params.id;
    try {
        const db = await getConnection();
        const [results] = await db.query('SELECT * FROM historial_mantenimiento WHERE auto_id = ?', [autoId]);
        res.json(results);
    } catch (err) {
        console.error('Error al obtener mantenimientos:', err);
        res.status(500).json({ error: 'Error al obtener mantenimientos' });
    }
});

// Endpoint para agregar un nuevo mantenimiento
app.post('/api/autos/:id/mantenimientos', async (req, res) => {
    const autoId = req.params.id;
    const { fecha, tipo_de_mantenimiento, descripcion } = req.body;
    try {
        const db = await getConnection();
        const query = 'INSERT INTO historial_mantenimiento (auto_id, fecha, tipo_de_mantenimiento, descripcion) VALUES (?, ?, ?, ?)';
        const [result] = await db.query(query, [autoId, fecha, tipo_de_mantenimiento, descripcion]);
        res.json({ id: result.insertId, auto_id: autoId, fecha, tipo_de_mantenimiento, descripcion });
    } catch (err) {
        console.error('Error al agregar mantenimiento:', err);
        res.status(500).json({ error: 'Error al agregar mantenimiento' });
    }
});

// Endpoint para agregar un nuevo auto
app.post('/api/autos', async (req, res) => {
    const { marca, modelo, anio, kilometraje, nro_patente } = req.body;
    try {
        const db = await getConnection();
        const query = 'INSERT INTO autos (marca, modelo, anio, kilometraje, nro_patente) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.query(query, [marca, modelo, anio, kilometraje, nro_patente]);
        res.json({ id: result.insertId, marca, modelo, anio, kilometraje, nro_patente });
    } catch (err) {
        console.error('Error al agregar auto:', err);
        res.status(500).json({ error: 'Error al agregar auto' });
    }
});

// ----------------------------------- MECANICOS ENDPOINTS -----------------------------------

// Endpoint para obtener todos los mecánicos
app.get('/api/mecanicos', async (req, res) => {
    try {
        const db = await getConnection();
        const [results] = await db.query('SELECT * FROM mecanicos');
        res.json(results);
    } catch (err) {
        console.error('Error al obtener mecánicos:', err);
        res.status(500).json({ error: 'Error al obtener mecánicos' });
    }
});

// Endpoint para obtener un mecánico por ID
app.get('/api/mecanicos/:id', async (req, res) => {
    const mecanicoId = req.params.id;
    try {
        const db = await getConnection();
        const [results] = await db.query('SELECT * FROM mecanicos WHERE id = ?', [mecanicoId]);
        if (results.length === 0) {
            res.status(404).json({ error: 'Mecánico no encontrado' });
            return;
        }
        res.json(results[0]);
    } catch (err) {
        console.error('Error al obtener mecánico:', err);
        res.status(500).json({ error: 'Error al obtener mecánico' });
    }
});

// Endpoint para agregar un nuevo mecánico
app.post('/api/mecanicos', async (req, res) => {
    const { nombre, apellido, telefono, correo_electronico, especialidad } = req.body;
    try {
        const db = await getConnection();
        const query = 'INSERT INTO mecanicos (nombre, apellido, telefono, correo_electronico, especialidad) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.query(query, [nombre, apellido, telefono, correo_electronico, especialidad]);
        res.json({ id: result.insertId, nombre, apellido, telefono, correo_electronico, especialidad });
    } catch (err) {
        console.error('Error al agregar mecánico:', err);
        res.status(500).json({ error: 'Error al agregar mecánico' });
    }
});

// Endpoint para obtener todos los bills
app.get('/api/bills', async (req, res) => {
    try {
        const db = await getConnection();
        const [results] = await db.query('SELECT * FROM bills');
        res.json(results);
    } catch (err) {
        console.error('Error al obtener bills:', err);
        res.status(500).json({ error: 'Error al obtener bills' });
    }
});

// Endpoint para agregar un nuevo bill
app.post('/api/bills', async (req, res) => {
    const { descripcion, monto, fecha, estado } = req.body;
    try {
        const db = await getConnection();
        const query = 'INSERT INTO bills (descripcion, monto, fecha, estado) VALUES (?, ?, ?, ?)';
        const [result] = await db.query(query, [descripcion, monto, fecha, estado]);
        res.json({ id: result.insertId, descripcion, monto, fecha, estado });
    } catch (err) {
        console.error('Error al agregar bill:', err);
        res.status(500).json({ error: 'Error al agregar bill' });
    }
});

// Endpoint para actualizar el estado de un gasto
app.patch('/api/bills/:id', async (req, res) => {
    const gastoId = req.params.id;
    const { estado } = req.body;
    try {
        const db = await getConnection();
        const query = 'UPDATE bills SET estado = ? WHERE id = ?';
        const [result] = await db.query(query, [estado, gastoId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Gasto no encontrado' });
        }
        res.json({ id: gastoId, estado });
    } catch (err) {
        console.error('Error al actualizar estado del gasto:', err);
        res.status(500).json({ error: 'Error al actualizar estado del gasto' });
    }
});




// Exportar la app para Vercel
export default app;

