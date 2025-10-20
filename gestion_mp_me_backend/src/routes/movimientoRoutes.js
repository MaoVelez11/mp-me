const express = require('express');
const router = express.Router();
const movimientoController = require('../controllers/movimientoController');

// Ruta para crear un nuevo movimiento
// POST /api/movimientos
router.post('/', movimientoController.crearMovimiento);

// Ruta para obtener todos los movimientos
// GET /api/movimientos
router.get('/', movimientoController.obtenerMovimientos);

module.exports = router;