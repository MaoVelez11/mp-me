const db = require('../config/database');

const Responsable = {
  /**
   * Obtiene todos los responsables.
   */
  getAll: async () => {
    const query = 'SELECT * FROM responsables_qc ORDER BY nombre ASC;';
    const [rows] = await db.query(query);
    return rows;
  },

  /**
   * Crea un nuevo responsable.
   */
  create: async (nombre) => {
    const query = 'INSERT INTO responsables_qc (nombre) VALUES (?);';
    const [result] = await db.query(query, [nombre]);
    return result;
  },

  /**
   * Elimina un responsable por su ID.
   */
  deleteById: async (id) => {
    const query = 'DELETE FROM responsables_qc WHERE id_responsable = ?;';
    const [result] = await db.query(query, [id]);
    return result;
  }
};

module.exports = Responsable;