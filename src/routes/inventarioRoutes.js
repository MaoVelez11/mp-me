// src/routes/inventarioRoutes.js

const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventarioController');
const authMiddleware = require('../middleware/authMiddleware'); // Proteger las rutas de consulta

// Rutas de Inventario (protegidas)
router.get('/', authMiddleware, inventarioController.obtenerInventarioCompleto);
router.get('/:codigo', authMiddleware, inventarioController.obtenerInventarioPorCodigo);

module.exports = router;