// src/models/inventarioModel.js

const db = require('../config/database');

const Inventario = {

  // Obtener todo el inventario
  obtenerTodo: async () => {
    const query = 'SELECT * FROM inventario_actual ORDER BY nombre_producto ASC;';
    const [rows] = await db.query(query);
    return rows;
  },

  // Obtener un producto del inventario por su código de referencia
  getByCodigoReferencia: async (codigo) => {
    const query = 'SELECT * FROM inventario_actual WHERE codigo_referencia = ?;';
    const [rows] = await db.query(query, [codigo]);
    return rows[0] || null;
  },

  // Actualizar la cantidad de un producto existente en el inventario
  // Esta función es CRÍTICA para mantener el inventario actualizado
  actualizarCantidad: async (codigo, cantidadCambio, ubicacion, bodega) => {
    // Si la cantidadCambio es positiva, es una entrada (recepción).
    // Si es negativa, es una salida (movimiento/consumo/devolución).
    const query = `
      INSERT INTO inventario_actual (codigo_referencia, nombre_producto, cantidad_actual, ubicacion, bodega)
      VALUES (?, (SELECT nombre_mp_me FROM maestros WHERE codigo = ?), ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        cantidad_actual = cantidad_actual + ?,
        ubicacion = VALUES(ubicacion),
        bodega = VALUES(bodega),
        fecha_ultima_actualizacion = CURRENT_TIMESTAMP;
    `;
    // Nota: Para ON DUPLICATE KEY UPDATE, el nombre_producto se obtiene de 'maestros'
    // La cantidad_actual se incrementa/decrementa.
    // La ubicación y bodega se actualizan con los nuevos valores.
    const [result] = await db.query(query, [codigo, codigo, cantidadCambio, ubicacion, bodega, cantidadCambio]);
    return result;
  },

  // Obtener el inventario para una "vista de bitácora" detallada (como la segunda tabla de tu imagen)
  // Esto puede ser más complejo y quizás se base en la bitacora_movimientos filtrada por producto
  // Por ahora, solo tenemos el "stock actual". La bitácora detallada se construirá más adelante si es necesario.
};

module.exports = Inventario;