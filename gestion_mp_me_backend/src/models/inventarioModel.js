const db = require('../config/database');

const Inventario = {
  /**
   * Busca un producto en el inventario por su código.
   * Si no existe, lo crea con saldo inicial cero.
   * @param {string} codigo - El código del producto (cod_mp_me o referencia).
   * @param {string} nombre - El nombre del producto.
   * @param {object} connection - La conexión de la BD para la transacción.
   * @returns {Promise<object>} El registro del inventario del producto.
   */
  buscarOCrear: async (codigo, nombre, connection) => {
    // Primero, intenta encontrar el producto
    let [rows] = await connection.query('SELECT * FROM inventario WHERE codigo_referencia = ?', [codigo]);

    // Si no existe, lo creamos
    if (rows.length === 0) {
      await connection.query(
        'INSERT INTO inventario (codigo_referencia, nombre_producto, saldo) VALUES (?, ?, 0)',
        [codigo, nombre]
      );
      // Volvemos a buscarlo para tener el registro completo
      [rows] = await connection.query('SELECT * FROM inventario WHERE codigo_referencia = ?', [codigo]);
    }
    return rows[0];
  },

  /**
   * Actualiza el saldo de un producto específico.
   * @param {string} codigo - El código del producto.
   * @param {number} nuevoSaldo - El nuevo saldo a establecer.
   * @param {object} connection - La conexión de la BD para la transacción.
   */
  actualizarSaldo: async (codigo, nuevoSaldo, connection) => {
    const query = 'UPDATE inventario SET saldo = ? WHERE codigo_referencia = ?;';
    await connection.query(query, [nuevoSaldo, codigo]);
  }
};

module.exports = Inventario;