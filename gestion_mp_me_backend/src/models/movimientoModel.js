const db = require('../config/database');

const Movimiento = {

  /**
   * Inserta un nuevo registro de movimiento en la base de datos.
   * @param {object} movimientoData - Los datos del movimiento a guardar.
   * @param {object} connection - La conexión de la base de datos para la transacción.
   * @returns {Promise<object>} El resultado de la inserción.
   */
  crear: async (movimientoData, connection) => {
    const query = `
      INSERT INTO bitacora_movimientos (
        referencia, producto, lote, cantidad, observaciones, ubicacion, bodega
      ) VALUES (?, ?, ?, ?, ?, ?, ?);
    `;

    const values = [
      movimientoData.referencia,
      movimientoData.producto,
      movimientoData.lote,
      movimientoData.cantidad,
      movimientoData.observaciones,
      movimientoData.ubicacion,
      movimientoData.bodega
    ];

    // Ejecuta la consulta usando la conexión de la transacción
    const [resultado] = await connection.query(query, values);
    return resultado;
  },

  /**
   * Obtiene todos los registros de la tabla bitacora_movimientos.
   * @returns {Promise<Array>} Un array con todos los movimientos.
   */
  obtenerTodos: async () => {
    const query = 'SELECT * FROM bitacora_movimientos ORDER BY id_movimiento DESC;';
    const [rows] = await db.query(query);
    return rows;
  }
};

module.exports = Movimiento;