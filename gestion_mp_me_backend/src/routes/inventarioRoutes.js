const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventarioController');

// Ruta para obtener todo el inventario
// GET /api/inventario
router.get('/', inventarioController.obtenerInventario);

module.exports = router;