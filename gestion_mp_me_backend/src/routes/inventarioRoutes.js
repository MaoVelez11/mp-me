const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventarioController');

// Ruta pública para consultar el inventario
router.get('/', inventarioController.obtenerInventario);

module.exports = router;