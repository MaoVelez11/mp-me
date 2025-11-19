const db = require('../config/database');

const Recepcion = {

  // Muestra el historial en la tabla (con el JOIN a la nueva tabla de items)
  obtenerTodas: async (connection) => {
    const conn = connection || db;
    
    const query = `
      SELECT 
        ri.codigo_mp AS cod_mp_me,
        ri.nombre_mp AS nombre_mp_me,
        ri.lote,
        ri.cantidad_peso,
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

  // Obtiene el último ID para el consecutivo (ej. 0012)
  getLatestId: async () => {
    const query = 'SELECT MAX(id_recepcion) as maxId FROM recepciones;';
    const [rows] = await db.query(query);
    return rows[0];
  },

  // Busca por N° de Control QC (para la página de correos)
  getByControlQC: async (n_control_qc) => {
    // Usamos LIKE para buscar el número aunque no escriban "QC-"
    const query = 'SELECT * FROM recepciones WHERE n_control_qc LIKE ?';
    const searchTerm = '%' + n_control_qc + '%';
    const [rows] = await db.query(query, [searchTerm]);
    return rows[0];
  },

  // --- ¡AQUÍ ESTÁ LA FUNCIÓN CORREGIDA! ---
  // Busca una recepción por su ID (para el controlador de correos)
  getById: async (id) => {
    const query = 'SELECT * FROM recepciones WHERE id_recepcion = ?';
    const [rows] = await db.query(query, [id]);
    return rows[0];
  },
};

module.exports = Recepcion;