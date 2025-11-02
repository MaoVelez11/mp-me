// src/controllers/authController.js
const Auth = require('../models/authModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.login = async (req, res) => {
  try {
    const usuario = req.body.usuario.trim();
    const password = req.body.password.trim();

    const user = await Auth.findByUsername(usuario);
    if (!user) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos.' });
    }
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos.' });
    }
    const payload = { id: user.id_usuario, usuario: user.usuario };
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token: token
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};