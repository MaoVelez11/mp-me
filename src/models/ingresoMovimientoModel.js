const db = require('../config/database');

const IngresoMovimiento = {
  
  crear: async (movimientoData) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Obtener la suma (bitácora) actual para esa referencia
      const [rows] = await connection.query(
        "SELECT SUM(cantidad) as total FROM movimientos WHERE referencia = ? AND estado = 'abierto'", 
        [movimientoData.referencia]
      );
      const bitacoraActual = rows[0].total || 0;
      
      // 2. Calcular la nueva bitácora (suma acumulada)
      const nuevaBitacora = parseFloat(bitacoraActual) + parseFloat(movimientoData.cantidad);

      // 3. Insertar el nuevo movimiento
      const query = `
        INSERT INTO movimientos (
          referencia, producto, lote, cantidad, bitacora, fecha_creacion, estado
        ) VALUES (?, ?, ?, ?, ?, ?, 'abierto');
      `;
      // Fecha automática como pediste
      const fecha_creacion = new Date().toISOString().slice(0, 19).replace('T', ' ');

      const values = [
        movimientoData.referencia,
        movimientoData.producto,
        movimientoData.lote,
        movimientoData.cantidad,
        nuevaBitacora, // Guardamos la nueva suma
        fecha_creacion
      ];
      
      const [resultado] = await connection.query(query, values);
      
      // 4. Actualizar la bitácora en TODOS los registros 'abiertos' de esa referencia
      await connection.query(
        "UPDATE movimientos SET bitacora = ? WHERE referencia = ? AND estado = 'abierto'",
        [nuevaBitacora, movimientoData.referencia]
      );

      await connection.commit();
      return resultado;

    } catch (error) {
      await connection.rollback();
      throw error; 
    } finally {
      connection.release();
    }
  },

  // Obtiene solo los movimientos 'abiertos' (del día)
  obtenerTodosAbiertos: async () => {
    const query = "SELECT * FROM movimientos WHERE estado = 'abierto' ORDER BY id_movimiento DESC;";
    const [rows] = await db.query(query);
    return rows;
  },

  // Lógica para "Cerrar Día"
  cerrarDia: async () => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Borrar las etiquetas viejas (como pediste)
      await connection.query('DELETE FROM etiquetas_movimientos;');

      // 2. Copiar todos los movimientos 'abiertos' a la tabla de etiquetas
      const copyQuery = `
        INSERT INTO etiquetas_movimientos (referencia, producto, lote, cantidad, bitacora, fecha_creacion)
        SELECT referencia, producto, lote, cantidad, bitacora, fecha_creacion
        FROM movimientos
        WHERE estado = 'abierto';
      `;
      await connection.query(copyQuery);

      // 3. Marcar todos los movimientos 'abiertos' como 'cerrados'
      const updateQuery = "UPDATE movimientos SET estado = 'cerrado' WHERE estado = 'abierto';";
      await connection.query(updateQuery);

      await connection.commit();
      return { message: 'Día cerrado y etiquetas generadas.' };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // Obtiene las etiquetas generadas
  obtenerEtiquetas: async () => {
    const query = 'SELECT * FROM etiquetas_movimientos ORDER BY referencia;';
    const [rows] = await db.query(query);
    return rows;
  }
};

module.exports = IngresoMovimiento;