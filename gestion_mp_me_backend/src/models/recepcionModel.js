const db = require('../config/database');

const Recepcion = {
  
  /**
   * Inserta un nuevo registro de recepción en la base de datos.
   * @param {object} recepcionData - Los datos de la recepción a guardar.
   * @param {object} connection - La conexión de la base de datos para la transacción.
   * @returns {Promise<object>} El resultado de la inserción.
   */
  crear: async (recepcionData, connection) => {
    const query = `
      INSERT INTO recepciones (
        n_control_qc, cod_mp_me, nombre_mp_me, presentacion, cantidad_peso, 
        fecha_recepcion, responsable_qc, lote, fecha_vencimiento, 
        n_orden_compra, fecha_oc, tipo_insumo, total_unidades_peso, 
        total_etiquetas, placa_vehiculo, proveedor, calidad_producto, 
        oportunidad_entrega, cumplimiento_parametros, servicio, razon_nc, 
        tratamiento_nc, puntaje_obtenido
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    const values = [
      recepcionData.n_control_qc, recepcionData.cod_mp_me, recepcionData.nombre_mp_me, 
      recepcionData.presentacion, recepcionData.cantidad_peso, recepcionData.fecha_recepcion,
      recepcionData.responsable_qc, recepcionData.lote, recepcionData.fecha_vencimiento,
      recepcionData.n_orden_compra, recepcionData.fecha_oc, recepcionData.tipo_insumo,
      recepcionData.total_unidades_peso, recepcionData.total_etiquetas, recepcionData.placa_vehiculo,
      recepcionData.proveedor, recepcionData.calidad_producto, recepcionData.oportunidad_entrega,
      recepcionData.cumplimiento_parametros, recepcionData.servicio, recepcionData.razon_nc,
      recepcionData.tratamiento_nc, recepcionData.puntaje_obtenido
    ];

    const [resultado] = await connection.query(query, values);
    return resultado;
  },

  /**
   * Obtiene todos los registros de la tabla recepciones.
   * @returns {Promise<Array>} Un array con todas las recepciones.
   */
  obtenerTodas: async () => {
    const query = 'SELECT * FROM recepciones ORDER BY id_recepcion DESC;';
    const [rows] = await db.query(query);
    return rows;
  }
  
};

module.exports = Recepcion;