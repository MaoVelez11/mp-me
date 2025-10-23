const db = require('../config/database');
const bcrypt = require('bcryptjs');

const User = {
  /**
   * Busca un usuario por su nombre de usuario.
   */
  findByUsername: async (usuario) => {
    const query = 'SELECT * FROM usuarios WHERE usuario = ?;';
    const [rows] = await db.query(query, [usuario]);
    return rows[0] || null;
  },

  /**
   * Obtiene todos los usuarios de la base de datos.
   */
  getAll: async () => {
    const query = 'SELECT id_usuario, usuario FROM usuarios;'; // No enviamos el hash
    const [rows] = await db.query(query);
    return rows;
  },

  /**
   * Crea un nuevo usuario con la contraseña ya encriptada.
   */
  create: async (usuario, password) => {
    // Encriptamos la contraseña
    const password_hash = await bcrypt.hash(password, 10);
    
    const query = 'INSERT INTO usuarios (usuario, password_hash) VALUES (?, ?);';
    const [result] = await db.query(query, [usuario, password_hash]);
    return result;
  },

  /**
   * Actualiza la contraseña de un usuario específico.
   */
  updatePassword: async (id, password) => {
    const password_hash = await bcrypt.hash(password, 10);
    
    const query = 'UPDATE usuarios SET password_hash = ? WHERE id_usuario = ?;';
    const [result] = await db.query(query, [id, password_hash]);
    return result;
  },

  /**
   * Elimina un usuario de la base de datos por su ID.
   */
  deleteById: async (id) => {
    const query = 'DELETE FROM usuarios WHERE id_usuario = ?;';
    const [result] = await db.query(query, [id]);
    return result;
  }
};

module.exports = User;