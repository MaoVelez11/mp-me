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

obtenerTodas: async (connection) => {
    const conn = connection || db; // 'db' debe estar definido arriba
    
    // Esta consulta UNE las dos tablas para traer todo el historial
    const query = `
      SELECT 
        ri.codigo_mp AS cod_mp_me,
        ri.nombre_mp AS nombre_mp_me,
        ri.lote,
        ri.cantidad_peso,  -- Cambiado de total_unidades_peso para que sea más claro
        r.fecha_recepcion
      FROM 
        recepcion_items AS ri
      JOIN 
        recepciones AS r ON ri.id_recepcion = r.id_recepcion
      ORDER BY 
        r.id_recepcion DESC;
    `;
    
    const [rows] = await conn.query(query);
    return rows;
  },

  getLatestId: async () => {
    const query = 'SELECT MAX(id_recepcion) as maxId FROM recepciones;';
    const [rows] = await db.query(query);
    return rows[0];
  },

 getByControlQC: async (n_control_qc) => {
    // Usamos LIKE para buscar el número aunque no escriban "QC-"
    const query = 'SELECT * FROM recepciones WHERE n_control_qc LIKE ?';
    
    // El '%' busca el número en cualquier parte del texto
    const searchTerm = '%' + n_control_qc + '%';
    
    const [rows] = await db.query(query, [searchTerm]);
    return rows[0];
  },
};


module.exports = Recepcion;