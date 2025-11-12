const db = require('../config/database');

const Responsable = {
  
  // Función que ya tenías
  getAll: async () => {
    const [rows] = await db.query('SELECT * FROM responsables_qc ORDER BY nombre');
    return rows;
  },

  // --- NUEVA FUNCIÓN ---
  crear: async (nombre) => {
    const query = 'INSERT INTO responsables_qc (nombre) VALUES (?)';
    const [result] = await db.query(query, [nombre]);
    return result.insertId;
  },

  // --- NUEVA FUNCIÓN ---
  eliminar: async (id) => {
    const query = 'DELETE FROM responsables_qc WHERE id = ?';
    await db.query(query, [id]);
  }
};

module.exports = Responsable;