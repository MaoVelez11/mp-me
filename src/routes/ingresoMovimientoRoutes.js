const express = require('express');
const router = express.Router();
const ingresoMovimientoController = require('../controllers/ingresoMovimientoController.js');
const authMiddleware = require('../middleware/authMiddleware'); // Protegeremos "Cerrar Día"

// Rutas públicas (para guardar y ver la bitácora del día)
router.post('/', ingresoMovimientoController.crearMovimiento);
router.get('/', ingresoMovimientoController.obtenerMovimientos);

// Rutas protegidas (solo admin puede cerrar el día y ver etiquetas)
router.post('/cerrar-dia', authMiddleware, ingresoMovimientoController.cerrarDia);
router.get('/etiquetas', authMiddleware, ingresoMovimientoController.obtenerEtiquetas);

module.exports = router;