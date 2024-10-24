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


// ----------------------------------- PROOVEDOR ENDPOINTS -----------------------------------


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


// ----------------------------------- PRODUCTO ENDPOINTS -----------------------------------



// Endpoint para obtener todos los productos
app.get('/api/productos', async (req, res) => {
    try {
        const db = await getConnection();
        const [results] = await db.query('SELECT * FROM productos');
        res.json(results);
    } catch (err) {
        console.error('Error al obtener productos:', err);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

// Endpoint para agregar un nuevo producto
app.post('/api/productos', async (req, res) => {
    const { nombre, marca, modelo, categoria, cantidad, activo } = req.body;

    try {
        const db = await getConnection();
        const query = `
            INSERT INTO productos (nombre, marca, modelo, categoria, cantidad, activo) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [nombre, marca, modelo, categoria, cantidad, activo]);

        res.status(201).json({ id: result.insertId, nombre, marca, modelo, categoria, cantidad, activo });
    } catch (err) {
        console.error('Error al agregar producto:', err);
        res.status(500).json({ error: 'Error al agregar producto' });
    }
});

// Endpoint para obtener un producto por ID
app.get('/api/productos/:id', async (req, res) => {
    const productoId = req.params.id;

    try {
        const db = await getConnection();
        const [results] = await db.query('SELECT * FROM productos WHERE id_producto = ?', [productoId]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json(results[0]);
    } catch (err) {
        console.error('Error al obtener producto:', err);
        res.status(500).json({ error: 'Error al obtener producto' });
    }
});

// Endpoint para modificar los datos de un producto
app.put('/api/productos/:id', async (req, res) => {
    const productoId = req.params.id;
    const { nombre, marca, modelo, categoria, cantidad, activo } = req.body;

    try {
        const db = await getConnection();
        const query = `
            UPDATE productos 
            SET nombre = ?, marca = ?, modelo = ?, categoria = ?, cantidad = ?, activo = ? 
            WHERE id_producto = ?
        `;
        const [result] = await db.query(query, [nombre, marca, modelo, categoria, cantidad, activo, productoId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json({ message: 'Producto actualizado exitosamente' });
    } catch (err) {
        console.error('Error al actualizar producto:', err);
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
});

// Endpoint para pasar un producto a estado inactivo
app.put('/api/productos/:id/inactivo', async (req, res) => {
    const productoId = req.params.id;

    try {
        const db = await getConnection();
        const query = 'UPDATE productos SET activo = false WHERE id_producto = ?';
        const [result] = await db.query(query, [productoId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json({ message: 'Producto pasado a estado inactivo' });
    } catch (err) {
        console.error('Error al pasar producto a estado inactivo:', err);
        res.status(500).json({ error: 'Error al pasar producto a estado inactivo' });
    }
});




// ----------------------------------- FLOTA ENDPOINTS -----------------------------------

// Endpoint para obtener una flota por id
app.get('/api/flotas/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const db = await getConnection();
        const [results] = await db.query('SELECT * FROM flotas WHERE id = ?', [id]);
        
        if (results.length === 0) {
            console.error(`Flota con id ${id} no encontrada`);
            return res.status(404).json({ error: 'Flota no encontrada' });
        }

        res.json(results[0]);
    } catch (err) {
        console.error('Error al obtener la flota:', err.message);
        res.status(500).json({ error: 'Error al obtener la flota', details: err.message });
    }
});

// Endpoint para obtener todas las flotas activas
app.get('/api/flotas', async (req, res) => {
    try {
        const db = await getConnection();
        const [results] = await db.query('SELECT * FROM flotas WHERE activo = 1');
        res.json(results);
    } catch (err) {
        console.error('Error al obtener las flotas activas:', err);
        res.status(500).json({ error: 'Error al obtener las flotas activas', details: err.message });
    }
});

// Endpoint para obtener todos los autos que pertenecen a una flota
app.get('/api/flotas/:id/autos', async (req, res) => {
    const flotaId = req.params.id;
    let db;

    try {
        db = await getConnection();
        const [results] = await db.query(`SELECT * FROM autos WHERE flota_id = ?`, [flotaId]);
        res.json(results);
    } catch (err) {
        console.error('Error al obtener los autos de la flota:', err);
        res.status(500).json({ error: 'Error al obtener los autos de la flota' });
    } finally {
        if (db) {
            await db.end();
        }
    }
});

// Endpoint para crear una nueva flota
app.post('/api/flotas-crear', async (req, res) => {
    const { nombre } = req.body;

    if (!nombre) {
        return res.status(400).json({ error: 'El nombre de la flota es obligatorio' });
    }

    try {
        const db = await getConnection();
        const [result] = await db.query('INSERT INTO flotas (nombre) VALUES (?)', [nombre]);

        const nuevaFlota = {
            id: result.insertId,
            nombre: nombre,
            create_time: new Date()
        };

        res.status(201).json(nuevaFlota);
    } catch (err) {
        console.error('Error al crear la flota:', err);
        res.status(500).json({ error: 'Error al crear la flota' });
    }
});

// Endpoint para actualizar flota_id a null para un auto específico en una flota específica
app.put('/api/flotas/:flotaId/autos/:autoId', async (req, res) => {
    try {
        const { flotaId, autoId } = req.params;
        const db = await getConnection();

        console.log(`Actualizando flota_id a NULL para el auto con ID ${autoId} en la flota con ID ${flotaId}`);

        // Verificar si el auto existe en la flota
        const [selectResult] = await db.query('SELECT * FROM autos WHERE id = ? AND flota_id = ?', [autoId, flotaId]);
        if (selectResult.length === 0) {
            console.log('Auto no encontrado en la flota');
            return res.status(404).json({ error: 'Auto no encontrado en la flota' });
        }

        // Actualizar flota_id a null para el auto especificado
        const [updateResult] = await db.query('UPDATE autos SET flota_id = NULL WHERE id = ? AND flota_id = ?', [autoId, flotaId]);

        if (updateResult.affectedRows === 0) {
            console.log('Error al actualizar el auto');
            return res.status(404).json({ error: 'Error al actualizar el auto' });
        }

        console.log('flota_id actualizado a NULL para el auto');
        res.json({ message: 'flota_id actualizado a NULL para el auto' });
    } catch (err) {
        console.error('Error al actualizar el auto:', err);
        res.status(500).json({ error: 'Error al actualizar el auto', details: err.message });
    }
});

// Endpoint para eliminar una flota y actualizar flota_id a null para todos los autos de esa flota
app.delete('/api/flotas/:flotaId', async (req, res) => {
    try {
        const { flotaId } = req.params;
        const db = await getConnection();

        console.log(`Eliminando la flota con ID ${flotaId}`);

        // Actualizar flota_id a null en la tabla de autos para todos los autos de la flota
        const [updateAutosResult] = await db.query('UPDATE autos SET flota_id = NULL WHERE flota_id = ?', [flotaId]);

        if (updateAutosResult.affectedRows === 0) {
            console.log('No se encontraron autos en la flota o error al actualizar los autos');
        } else {
            console.log('flota_id actualizado a NULL para todos los autos de la flota');
        }

        // Cambiar el estado de la flota a inactivo en lugar de eliminarla
        const [updateFlotaResult] = await db.query('UPDATE flotas SET activo = false WHERE id = ?', [flotaId]);

        if (updateFlotaResult.affectedRows === 0) {
            console.log('Error al actualizar el estado de la flota');
            return res.status(404).json({ error: 'Error al actualizar el estado de la flota' });
        }

        console.log('Estado de la flota actualizado a inactivo');
        res.json({ message: 'Estado de la flota actualizado a inactivo y flota_id actualizado a NULL para todos los autos de la flota' });
    } catch (err) {
        console.error('Error al eliminar la flota:', err);
        res.status(500).json({ error: 'Error al eliminar la flota', details: err.message });
    }
});

// Endpoint para actualizar el nombre de una flota por id
app.put('/api/flotas/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;

    if (!nombre) {
        return res.status(400).json({ error: 'El nombre de la flota es obligatorio' });
    }

    try {
        const db = await getConnection();
        const [result] = await db.query('UPDATE flotas SET nombre = ? WHERE id = ?', [nombre, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Flota no encontrada' });
        }

        res.json({ message: 'Nombre de la flota actualizado con éxito' });
    } catch (err) {
        console.error('Error al actualizar el nombre de la flota:', err);
        res.status(500).json({ error: 'Error al actualizar el nombre de la flota', details: err.message });
    }
});



// ----------------------------------- ORDEN DE COMPRA ENDPOINTS -----------------------------------

// Endpoint para obtener todas las órdenes de compra y sus productos
app.get('/api/ordenes_de_compra', async (req, res) => {
    try {
        const db = await getConnection();
        const [ordenes] = await db.query('SELECT * FROM ordenes_de_compra');

        // Para cada orden, obtener sus productos asociados
        const ordenesConProductos = await Promise.all(ordenes.map(async (orden) => {
            const [productos] = await db.query(`
                SELECT p.id_producto, p.nombre, op.cantidad
                FROM ordenes_productos op
                JOIN productos p ON op.id_producto = p.id_producto
                WHERE op.id_orden_de_compra = ?
            `, [orden.id_orden_de_compra]);

            return { ...orden, productos };
        }));

        res.json(ordenesConProductos);
    } catch (err) {
        console.error('Error al obtener las órdenes de compra:', err);
        res.status(500).json({ error: 'Error al obtener las órdenes de compra', details: err.message });
    }
});

// Endpoint para cambiar el estado de una orden de compra de creada a aceptada
app.put('/api/ordenes_de_compra/:id/aceptar', async (req, res) => {
    try {
        const { id } = req.params;
        const db = await getConnection();

        // Verificar si la orden existe y su estado actual es "creada"
        const [orden] = await db.query('SELECT estado FROM ordenes_de_compra WHERE id_orden_de_compra = ?', [id]);

        if (orden.length === 0) {
            return res.status(404).json({ error: 'Orden de compra no encontrada' });
        }

        if (orden[0].estado !== 'creada') {
            return res.status(400).json({ error: 'Solo se pueden aceptar órdenes en estado "creada"' });
        }

        // Actualizar el estado de la orden a "aceptada"
        const [result] = await db.query('UPDATE ordenes_de_compra SET estado = ? WHERE id_orden_de_compra = ?', ['aceptada', id]);

        if (result.affectedRows === 0) {
            return res.status(500).json({ error: 'Error al actualizar el estado de la orden de compra' });
        }

        res.json({ message: 'Orden de compra aceptada' });
    } catch (err) {
        console.error('Error al aceptar la orden de compra:', err);
        res.status(500).json({ error: 'Error al aceptar la orden de compra', details: err.message });
    }
});

// Endpoint para cambiar el estado de una orden de compra de "aceptada" a "inactiva"
app.put('/api/ordenes_de_compra/:id/inactivar', async (req, res) => {
    try {
        const { id } = req.params;
        const db = await getConnection();

        // Verificar si la orden existe y su estado actual es "aceptada"
        const [orden] = await db.query('SELECT estado FROM ordenes_de_compra WHERE id_orden_de_compra = ?', [id]);

        if (orden.length === 0) {
            return res.status(404).json({ error: 'Orden de compra no encontrada' });
        }

        if (orden[0].estado !== 'aceptada') {
            return res.status(400).json({ error: 'Solo se pueden inactivar órdenes en estado "aceptada"' });
        }

        // Actualizar el estado de la orden a "inactiva"
        const [result] = await db.query('UPDATE ordenes_de_compra SET estado = ? WHERE id_orden_de_compra = ?', ['inactiva', id]);

        if (result.affectedRows === 0) {
            return res.status(500).json({ error: 'Error al actualizar el estado de la orden de compra' });
        }

        res.json({ message: 'Orden de compra inactivada' });
    } catch (err) {
        console.error('Error al inactivar la orden de compra:', err);
        res.status(500).json({ error: 'Error al inactivar la orden de compra', details: err.message });
    }
});


// Endpoint para indicar la cantidad de productos recibidos y cambiar el estado de la orden a completada

app.post('/api/ordenes_de_compra/:id/confirmar_recepcion', async (req, res) => {
    const { id } = req.params;
    const { productos } = req.body; // Espera un array de productos con id_producto y cantidadRecibida
    const db = await getConnection();

    try {
        // Verificar si la orden de compra existe
        const [orden] = await db.query('SELECT * FROM ordenes_de_compra WHERE id_orden_de_compra = ?', [id]);
        if (!orden) {
            return res.status(404).json({ error: 'Orden de compra no encontrada' });
        }

        // Iterar sobre los productos y actualizar o insertar en recepciones_productos
        for (const producto of productos) {
            const { id_producto, cantidadRecibida } = producto;

            // Actualizar la cantidad recibida
            await db.query(
                `INSERT INTO recepciones_productos (id_orden_de_compra, id_producto, cantidad_recibida, fecha_recepcion) 
                 VALUES (?, ?, ?, NOW())
                 ON DUPLICATE KEY UPDATE cantidad_recibida = ?`,
                [id, id_producto, cantidadRecibida, cantidadRecibida]
            );
        }

        // Actualizar el estado de la orden a "completada"
        await db.query(
            'UPDATE ordenes_de_compra SET estado = ? WHERE id_orden_de_compra = ?',
            ['completada', id]
        );

        res.status(200).json({ message: 'Recepción de productos confirmada y orden de compra completada.' });
    } catch (err) {
        console.error('Error al confirmar la recepción de productos:', err);
        res.status(500).json({ error: 'Error al confirmar la recepción de productos', details: err.message });
    }
});

// Endpoint para obtener las ordenes de compra y confirmaciones de recepcion

app.get('/api/ordenes_de_compra', async (req, res) => {
    const db = await getConnection();

    try {
        // Obtener todas las órdenes de compra
        const ordenes = await db.query('SELECT * FROM ordenes_de_compra');

        // Obtener las confirmaciones de recepción para cada orden
        const ordenesConRecepciones = await Promise.all(ordenes.map(async (orden) => {
            const recepciones = await db.query(
                `SELECT id_producto, cantidad_recibida 
                 FROM recepciones_productos 
                 WHERE id_orden_de_compra = ?`,
                [orden.id_orden_de_compra]
            );
            return {
                ...orden,
                recepciones
            };
        }));

        res.json(ordenesConRecepciones);
    } catch (err) {
        console.error('Error al obtener órdenes de compra:', err);
        res.status(500).json({ error: 'Error al obtener órdenes de compra', details: err.message });
    }
});

// Endpoint obtener productos y productos recibidos

app.get('/api/ordenes_de_compra/:id/recepcion_productos', async (req, res) => {
    const { id } = req.params;
    const db = await getConnection();

    try {
        // Obtener la orden de compra
        const [orden] = await db.query('SELECT * FROM ordenes_de_compra WHERE id_orden_de_compra = ?', [id]);

        // Verificar si la orden de compra existe
        if (!orden) {
            return res.status(404).json({ error: 'Orden de compra no encontrada' });
        }

        // Obtener los productos de la orden junto con las recepciones de productos asociadas
        const productosConRecepcion = await db.query(`
            SELECT op.id_producto, op.cantidad AS cantidad_solicitada, 
                   IFNULL(rp.cantidad_recibida, 0) AS cantidad_recibida
            FROM ordenes_productos op
            LEFT JOIN recepciones_productos rp ON op.id_producto = rp.id_producto 
            AND rp.id_orden_de_compra = ?
            WHERE op.id_orden_de_compra = ?`,
            [id, id]
        );

        // Enviar la respuesta con la orden y los productos con sus cantidades
        res.json({
            orden, // Devolviendo el objeto de orden directamente
            productos: productosConRecepcion // Devolviendo los productos solicitados con sus cantidades
        });
    } catch (err) {
        console.error('Error al obtener la orden de compra:', err);
        res.status(500).json({ error: 'Error al obtener la orden de compra', details: err.message });
    }
});

// Endpoint para agregar una nueva orden de compra
app.post('/api/ordenes_de_compra', async (req, res) => {
    const { id_proveedor, productos } = req.body; // Datos enviados desde el frontend

    if (!id_proveedor || !productos || productos.length === 0) {
        return res.status(400).json({ error: 'Debe proporcionar un proveedor y al menos un producto' });
    }

    try {
        const db = await getConnection();
        await db.beginTransaction(); // Iniciar una transacción

        // Calcular el total sumando los precios de los productos multiplicados por la cantidad
        let total = 0;
        for (const producto of productos) {
            const [productoData] = await db.query('SELECT precio FROM productos WHERE id_producto = ?', [producto.id_producto]);
            const precio = productoData[0].precio;
            total += precio * producto.cantidad;
        }

        // Insertar la nueva orden de compra en la tabla `ordenes_de_compra`
        const [result] = await db.query(
            'INSERT INTO ordenes_de_compra (id_proveedor, fecha_creacion, total, estado) VALUES (?, NOW(), ?, ?)',
            [id_proveedor, total, 'creada'] // Se establece el estado en 'creada' por defecto
        );
        const id_orden_de_compra = result.insertId; // Obtener el ID de la nueva orden

        // Insertar los productos de la orden en la tabla `ordenes_productos`
        for (const producto of productos) {
            const { id_producto, cantidad } = producto;
            await db.query('INSERT INTO ordenes_productos (id_orden_de_compra, id_producto, cantidad) VALUES (?, ?, ?)', 
                [id_orden_de_compra, id_producto, cantidad]);
        }

        await db.commit(); // Confirmar la transacción
        res.json({ message: 'Orden de compra agregada exitosamente', id_orden_de_compra });

    } catch (err) {
        await db.rollback(); // Revertir los cambios si algo falla
        console.error('Error al agregar la orden de compra:', err);
        res.status(500).json({ error: 'Error al agregar la orden de compra', details: err.message });
    }
});

app.use(cors({
    origin: 'http://localhost:5173', // Ajusta esto si tu frontend está en otro dominio
    methods: 'GET,POST,PUT,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
}));


// Exportar la app para Vercel
export default app;

