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

// Endpoint para obtener un gasto por ID
app.get('/api/bills/:id', async (req, res) => {
    const gastoId = req.params.id;
    try {
        const db = await getConnection();
        const [results] = await db.query('SELECT * FROM bills WHERE id = ?', [gastoId]);
        if (results.length === 0) {
            return res.status(404).json({ error: 'Gasto no encontrado' });
        }
        res.json(results[0]);
    } catch (err) {
        console.error('Error al obtener gasto:', err);
        res.status(500).json({ error: 'Error al obtener gasto' });
    }
});

// Endpoint para agregar una nueva ubicación de un conductor
app.post('/api/ubicacion-conductor', async (req, res) => {
    const {id_conductor, fecha_hora, latitud, longitud } = req.body;

    try {
        const db = await getConnection();
        const query = `INSERT INTO ubicacion_conductor (id_conductor, fecha_hora, latitud, longitud)
            VALUES (?, ?, ?, ?)`;
        ;
        const [result] = await db.query(query, [id_conductor, fecha_hora, latitud, longitud]);

        res.json({
            message: 'Ubicación agregada exitosamente',
            id_conductor,
            fecha_hora,
            latitud,
            longitud
        });
    } catch (err) {
        console.error('Error al agregar ubicación:', err);
        res.status(500).json({ error: 'Error al agregar ubicación' });
    }
});
// Endpoint para obtener la última ubicación de un conductor
app.get('/api/ubicacion-conductor', async (req, res) => {
    try {
        const db = await getConnection();
        const [results] = await db.query('SELECT latitud, longitud FROM ubicacion_conductor WHERE id_conductor = 1 ORDER BY fecha_hora DESC LIMIT 1'); // Mantén el ID fijo
        if (results.length === 0) {
            return res.status(404).json({ error: 'Ubicación no encontrada' });
        }
        res.json(results[0]); // Devuelve la última ubicación
    } catch (err) {
        console.error('Error al obtener la ubicación del conductor:', err);
        res.status(500).json({ error: 'Error al obtener la ubicación' });
    }
});

app.get('/api/vehiculos', async (req, res) => {
    const { disponibilidad, fechaDesde, fechaHasta } = req.query;
  
    // Verifica si las fechas están definidas
    if (!fechaDesde || !fechaHasta) {
      return res.status(400).json({ error: "Las fechas son obligatorias" });
    }
  
    let query;
    let params = [fechaDesde, fechaHasta];
  
    // Verificar disponibilidad
    if (disponibilidad === 'reservados') {
      query = `
        SELECT * FROM autos
        WHERE EXISTS (
          SELECT 1 FROM alquiler
          WHERE alquiler.auto_id = autos.id
          AND (alquiler.fecha_inicio between ? and ?)
        )
      `;
    } else if (disponibilidad === 'no reservados') {
      query = `
        SELECT * FROM autos
        WHERE NOT EXISTS (
          SELECT 1 FROM alquiler
          WHERE alquiler.auto_id = autos.id
          AND (alquiler.fecha_inicio between ? and ?)
        )
      `;
    } else {
      // En caso de que no se especifique disponibilidad
      query = 'SELECT * FROM autos';
    }
  
    try {
      const db = await getConnection();
      const [results] = await db.query(query, params);
      res.json(results);
    } catch (err) {
      console.error('Error al obtener vehículos:', err);
      res.status(500).json({ error: 'Error al obtener vehículos' });
    }
  });
  
  
// Endpoint para obtener todos los conductores
app.get('/api/conductores', async (req, res) => {
    try {
        const db = await getConnection();
        const [results] = await db.query('SELECT * FROM conductores'); // Asegúrate de que la tabla se llame 'conductores'
        res.json(results);
    } catch (err) {
        console.error('Error al obtener conductores:', err);
        res.status(500).json({ error: 'Error al obtener conductores' });
    }
});

// Endpoint para obtener todos los proveedores
app.get('/api/proveedores', async (req, res) => {
    try {
        const db = await getConnection();
        const [results] = await db.query('SELECT * FROM proveedores');
        res.json(results);
    } catch (err) {
        console.error('Error al obtener proveedores:', err);
        res.status(500).json({ error: 'Error al obtener proveedores' });
    }
});

// Endpoint para obtener un proveedor por ID
app.get('/api/proveedores/:id', async (req, res) => {
    const proveedorId = req.params.id;
    try {
        const db = await getConnection();
        const [results] = await db.query('SELECT * FROM proveedores WHERE id_proveedor = ?', [proveedorId]);
        if (results.length === 0) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }
        res.json(results[0]);
    } catch (err) {
        console.error('Error al obtener proveedor:', err);
        res.status(500).json({ error: 'Error al obtener proveedor' });
    }
});

// Endpoint para actualizar un proveedor por ID
app.put('/api/proveedores/:id', async (req, res) => {
    const proveedorId = req.params.id;
    const { nombre, cuil, email, direccion, telefono, activo } = req.body;

    try {
        const db = await getConnection();
        const query = `
            UPDATE proveedores 
            SET nombre = ?, cuil = ?, email = ?, direccion = ?, telefono = ?, activo = ? 
            WHERE id_proveedor = ?
        `;
        const [result] = await db.query(query, [nombre, cuil, email, direccion, telefono, activo, proveedorId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }

        res.json({ id: proveedorId, nombre, cuil, email, direccion, telefono, activo });
    } catch (err) {
        console.error('Error al actualizar proveedor:', err);
        res.status(500).json({ error: 'Error al actualizar proveedor' });
    }
});

// Endpoint para agregar un nuevo proveedor
app.post('/api/proveedores', async (req, res) => {
    const { nombre, cuil, email, direccion, telefono, activo } = req.body;

    try {
        const db = await getConnection();
        const query = `
            INSERT INTO proveedores (nombre, cuil, email, direccion, telefono, activo) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [nombre, cuil, email, direccion, telefono, activo]);

        res.status(201).json({ id: result.insertId, nombre, cuil, email, direccion, telefono, activo });
    } catch (err) {
        console.error('Error al agregar proveedor:', err);
        res.status(500).json({ error: 'Error al agregar proveedor' });
    }
});

// Endpoint para pasar un proveedor a estado inactivo
app.put('/api/proveedores/:id/inactivo', async (req, res) => {
    const proveedorId = req.params.id;

    try {
        const db = await getConnection();
        const query = 'UPDATE proveedores SET activo = false WHERE id_proveedor = ?';
        const [result] = await db.query(query, [proveedorId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Proveedor no encontrado' });
        }

        res.json({ message: 'Proveedor pasado a estado inactivo' });
    } catch (err) {
        console.error('Error al pasar proveedor a estado inactivo:', err);
        res.status(500).json({ error: 'Error al pasar proveedor a estado inactivo' });
    }
});

// Exportar la app para Vercel
export default app;

