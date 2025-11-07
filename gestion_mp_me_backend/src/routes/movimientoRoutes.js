const express = require('express');
const router = express.Router();
const movimientoController = require('../controllers/movimientoController');

// Rutas públicas para la bitácora antigua
router.post('/', movimientoController.crearMovimiento);
router.get('/', movimientoController.obtenerMovimientos);

module.exports = router;