const db = require('../config/database');

const Inventario = {
  // Obtener todo para la tabla visual
  obtenerTodo: async () => {
    const query = 'SELECT * FROM inventario ORDER BY nombre_producto ASC;';
    const [rows] = await db.query(query);
    return rows;
  },

  // Buscar un producto específico
  obtenerPorCodigo: async (codigo) => {
    const query = 'SELECT * FROM inventario WHERE codigo_referencia = ?;';
    const [rows] = await db.query(query, [codigo]);
    return rows[0];
  },

  // Función principal para actualizar stock (usada por Recepción y Movimientos)
  actualizarStock: async (codigo, nombre, cantidad, ubicacion, bodega, connection) => {
    const conn = connection || db;
    const query = `
      INSERT INTO inventario (codigo_referencia, nombre_producto, saldo, ubicacion, bodega)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        saldo = saldo + VALUES(saldo),
        ubicacion = COALESCE(VALUES(ubicacion), ubicacion),
        bodega = COALESCE(VALUES(bodega), bodega),
        nombre_producto = VALUES(nombre_producto);
    `;
    await conn.query(query, [codigo, nombre, cantidad, ubicacion, bodega]);
  }
};

module.exports = Inventario;