const express = require('express');
const router = express.Router();
const ingresoMovimientoController = require('../controllers/ingresoMovimientoController.js');

// Rutas públicas para el módulo de ingreso de movimientos
router.post('/', ingresoMovimientoController.crearMovimiento);
router.get('/', ingresoMovimientoController.obtenerMovimientos);
router.post('/cerrar-dia', ingresoMovimientoController.cerrarDia);
router.get('/etiquetas', ingresoMovimientoController.obtenerEtiquetas);

module.exports = router;