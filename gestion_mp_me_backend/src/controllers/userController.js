const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// --- 1. AUTENTICACIÓN ---

exports.login = async (req, res) => {
  try {
    const usuario = req.body.usuario.trim();
    const password = req.body.password.trim();

    const user = await User.findByUsername(usuario);
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
    console.error('Error en el login:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};


// --- 2. GESTIÓN DE USUARIOS (CRUD) ---

// POST /api/users
exports.createUser = async (req, res) => {
  try {
    const { usuario, password } = req.body;
    if (!usuario || !password) {
      return res.status(400).json({ message: 'El usuario y la contraseña son requeridos.' });
    }
    
    // Verificar si el usuario ya existe
    const existingUser = await User.findByUsername(usuario);
    if (existingUser) {
      return res.status(409).json({ message: 'El nombre de usuario ya existe.' });
    }

    await User.create(usuario, password);
    res.status(201).json({ message: 'Usuario creado exitosamente.' });
  
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// GET /api/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// PUT /api/users/:id
exports.updateUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: 'La nueva contraseña es requerida.' });
    }

    await User.updatePassword(id, password);
    res.status(200).json({ message: 'Contraseña actualizada exitosamente.' });
  
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // (Opcional) Leer el usuario para asegurarse de no borrar 'admin'
    // Esta lógica ya la tienes en el frontend, pero es bueno tenerla aquí también
    
    await User.deleteById(id);
    res.status(200).json({ message: 'Usuario eliminado exitosamente.' });

  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};