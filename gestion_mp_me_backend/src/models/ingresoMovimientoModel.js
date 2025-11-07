const db = require('../config/database');

const IngresoMovimiento = {
  // Crea un nuevo movimiento y actualiza la bitácora
  crear: async (movimientoData) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Obtener la suma (bitácora) actual
      const [rows] = await connection.query(
        "SELECT SUM(cantidad) as total FROM movimientos WHERE referencia = ? AND estado = 'abierto'", 
        [movimientoData.referencia]
      );
      const bitacoraActual = rows[0].total || 0;
      const nuevaBitacora = parseFloat(bitacoraActual) + parseFloat(movimientoData.cantidad);

      // 2. Insertar el movimiento
      const query = `
        INSERT INTO movimientos (
          referencia, producto, lote, cantidad, bitacora, fecha_creacion, estado
        ) VALUES (?, ?, ?, ?, ?, ?, 'abierto');
      `;
      const fecha_creacion = new Date().toISOString().slice(0, 19).replace('T', ' ');
      await connection.query(query, [
        movimientoData.referencia, movimientoData.producto, movimientoData.lote,
        movimientoData.cantidad, nuevaBitacora, fecha_creacion
      ]);
      
      // 3. Actualizar bitácora en registros abiertos
      await connection.query(
        "UPDATE movimientos SET bitacora = ? WHERE referencia = ? AND estado = 'abierto'",
        [nuevaBitacora, movimientoData.referencia]
      );

      await connection.commit();
      // Necesitamos devolver el ID del último insert para el frontend
      const [result] = await db.query('SELECT LAST_INSERT_ID() as insertId');
      return result[0];

    } catch (error) {
      await connection.rollback();
      throw error; 
    } finally {
      connection.release();
    }
  },

  /// Obtiene movimientos abiertos
  obtenerTodosAbiertos: async () => {
    // CAMBIO AQUÍ: Usamos 'movimientos' en lugar de 'bitacora_movimientos'
    const query = "SELECT * FROM movimientos WHERE estado = 'abierto' ORDER BY id_movimiento DESC;";
    const [rows] = await db.query(query);
    return rows;
  },

  // Cierra el día
  cerrarDia: async () => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query('DELETE FROM etiquetas_movimientos;');
      await connection.query(`
        INSERT INTO etiquetas_movimientos (referencia, producto, lote, cantidad, bitacora, fecha_creacion)
        SELECT referencia, producto, lote, cantidad, bitacora, fecha_creacion
        FROM movimientos WHERE estado = 'abierto';
      `);
      await connection.query("UPDATE movimientos SET estado = 'cerrado' WHERE estado = 'abierto';");
      await connection.commit();
      return { message: 'Día cerrado correctamente.' };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // Obtiene etiquetas
  obtenerEtiquetas: async () => {
    const [rows] = await db.query('SELECT * FROM etiquetas_movimientos ORDER BY referencia;');
    return rows;
  }
};

module.exports = IngresoMovimiento;