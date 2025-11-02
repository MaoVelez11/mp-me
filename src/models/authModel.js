// src/models/authModel.js
const db = require('../config/database');

const Auth = {
  findByUsername: async (usuario) => {
    const query = 'SELECT * FROM usuarios WHERE usuario = ?;';
    const [rows] = await db.query(query, [usuario]);
    return rows[0] || null;
  }
};
module.exports = Auth;