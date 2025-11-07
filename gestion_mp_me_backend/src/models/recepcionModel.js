const db = require('../config/database');

const Recepcion = {
  // Crea el registro sin el consecutivo
  crear: async (recepcionData, connection) => {
    const query = `
      INSERT INTO recepciones (
        cod_mp_me, nombre_mp_me, presentacion, cantidad_peso, 
        fecha_recepcion, responsable_qc, lote, fecha_vencimiento, 
        n_orden_compra, fecha_oc, tipo_insumo, total_unidades_peso, 
        total_etiquetas, placa_vehiculo, proveedor, calidad_producto, 
        oportunidad_entrega, cumplimiento_parametros, servicio, razon_nc, 
        tratamiento_nc, puntaje_obtenido
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    const values = [
      recepcionData.cod_mp_me, recepcionData.nombre_mp_me, 
      recepcionData.presentacion, recepcionData.cantidad_peso, recepcionData.fecha_recepcion,
      recepcionData.responsable_qc, recepcionData.lote, 
      recepcionData.fecha_vencimiento || null,
      recepcionData.n_orden_compra, 
      recepcionData.fecha_oc || null, 
      recepcionData.tipo_insumo,
      recepcionData.total_unidades_peso, recepcionData.total_etiquetas, recepcionData.placa_vehiculo,
      recepcionData.proveedor, recepcionData.calidad_producto, recepcionData.oportunidad_entrega,
      recepcionData.cumplimiento_parametros, recepcionData.servicio, recepcionData.razon_nc,
      recepcionData.tratamiento_nc, recepcionData.puntaje_obtenido
    ];

    const [resultado] = await connection.query(query, values);
    return resultado;
  },

  // Actualiza el consecutivo una vez creado el registro
  setControlQC: async (id, qcNumber, connection) => {
    const query = 'UPDATE recepciones SET n_control_qc = ? WHERE id_recepcion = ?;';
    await connection.query(query, [qcNumber, id]);
  },

  obtenerTodas: async () => {
    const query = 'SELECT * FROM recepciones ORDER BY id_recepcion DESC;';
    const [rows] = await db.query(query);
    return rows;
  },

  getLatestId: async () => {
    const query = 'SELECT MAX(id_recepcion) as maxId FROM recepciones;';
    const [rows] = await db.query(query);
    return rows[0];
  },

  getById: async (id) => {
     const query = 'SELECT * FROM recepciones WHERE id_recepcion = ? OR n_control_qc = ?;';
     const [rows] = await db.query(query, [id, id]);
     return rows[0] || null;
  }
};

module.exports = Recepcion;